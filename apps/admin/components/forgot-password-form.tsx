"use client";

import type {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode
} from "react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type ResetStage = "email" | "verify" | "reset";

type ForgotPasswordFormProps = {
  initialEmail?: string;
  stage: ResetStage;
};

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid work email.")
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export function ForgotPasswordForm({
  initialEmail = "",
  stage
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const codeValue = useMemo(() => code.join(""), [code]);

  function goToStage(nextStage: ResetStage, nextEmail = email) {
    const params = new URLSearchParams({ stage: nextStage });
    if (nextEmail) params.set("email", nextEmail);
    router.push(`/forgot-password?${params.toString()}`);
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedEmail = emailSchema.safeParse({ email });
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0]?.message ?? "Enter your email.");
      return;
    }
    toast.success("Reset code sent", {
      description: "Check your email for the 6-digit verification code."
    });
    goToStage("verify", parsedEmail.data.email);
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (codeValue.length !== 6) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }
    toast.success("Code verified");
    goToStage("reset");
  }

  function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPassword = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsedPassword.success) {
      toast.error(parsedPassword.error.issues[0]?.message ?? "Check your new password.");
      return;
    }
    toast.success("Password reset", { description: "Use your new password to sign in." });
    router.push("/login");
  }

  function handleCodeChange(index: number, value: string) {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = nextDigit;
    setCode(nextCode);
    if (nextDigit && index < code.length - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Backspace" || code[index]) return;
    codeRefs.current[index - 1]?.focus();
  }

  function handleCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedCode) return;
    const nextCode = Array.from({ length: 6 }, (_, index) => pastedCode[index] ?? "");
    setCode(nextCode);
    codeRefs.current[Math.min(pastedCode.length, 6) - 1]?.focus();
  }

  return (
    <section className="relative w-110 place-self-center overflow-hidden rounded-[20px] border border-[#e8e7ec] bg-white px-8 pb-8 pt-9 shadow-[0_2px_4px_rgba(45,44,51,0.04),0_8px_24px_rgba(45,44,51,0.08),0_32px_64px_rgba(45,44,51,0.1)] before:absolute before:right-[-1px] before:top-[-1px] before:h-[90px] before:w-[90px] before:rounded-bl-[90px] before:rounded-tr-[28px] before:bg-[linear-gradient(135deg,#f3f2f6_0%,#e8e7ec_100%)] before:content-['']">
      <div className="relative mb-7">
        <h1 className="text-[34px] leading-tight tracking-[-0.03em] text-[#2d2c33]">
          {getStageTitle(stage)}
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#9896a4]">
          {getStageDescription(stage, email)}
        </p>
      </div>

      {stage === "email" ? (
        <form className="relative flex flex-col gap-4" noValidate onSubmit={handleEmailSubmit}>
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6d78]"
              htmlFor="reset-email"
            >
              Work email
            </label>
            <div className="relative">
              <input
                autoComplete="email"
                className="h-[54px] w-full rounded-[12px] border-[1.5px] border-[#e8e7ec] bg-[#f9f8fb] px-4 pr-11 text-[13.5px] font-medium text-[#2d2c33] outline-none transition placeholder:font-normal placeholder:text-[#b8b7bf] focus:border-[#2d2c33] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,44,51,0.08)]"
                id="reset-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="xyz@gmail.com"
                type="email"
                value={email}
              />
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#b8b7bf]"
              />
            </div>
          </div>

          <PrimaryButton>Send reset code</PrimaryButton>

          <BackLink href="/login">Back to sign in</BackLink>
        </form>
      ) : null}

      {stage === "verify" ? (
        <form className="relative flex flex-col gap-4" noValidate onSubmit={handleVerifySubmit}>
          <div className="space-y-3">
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6d78]"
              htmlFor="reset-code-0"
            >
              Verification code
            </label>
            <div className="flex items-center gap-2">
              {code.map((digit, index) => (
                <div className="contents" key={index}>
                  <input
                    aria-label={`Verification digit ${index + 1}`}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    className="h-[42px] w-[42px] rounded-[10px] border-[1.5px] border-[#e8e7ec] bg-[#f9f8fb] text-center text-[18px] font-semibold text-[#2d2c33] outline-none transition placeholder:text-[#c8d0dc] focus:border-[#2d2c33] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,44,51,0.08)]"
                    id={`reset-code-${index}`}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => handleCodeChange(index, event.target.value)}
                    onKeyDown={(event) => handleCodeKeyDown(index, event)}
                    onPaste={handleCodePaste}
                    ref={(node) => { codeRefs.current[index] = node; }}
                    type="text"
                    value={digit}
                  />
                  {index === 2 ? (
                    <span className="px-0.5 text-[18px] font-semibold text-[#b8b7bf]">·</span>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#9896a4]">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <PrimaryButton disabled={codeValue.length !== 6} className="mt-4">
            Verify code
          </PrimaryButton>

          <BackButton onClick={() => goToStage("email", "")}>
            Use a different email
          </BackButton>
        </form>
      ) : null}

      {stage === "reset" ? (
        <form className="relative flex flex-col gap-3" noValidate onSubmit={handleResetSubmit}>
          <PasswordField
            id="new-password"
            label="New password"
            onChange={setPassword}
            onToggleVisibility={() => setShowPassword((current) => !current)}
            placeholder="Enter new password"
            showValue={showPassword}
            value={password}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            onChange={setConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
            placeholder="Confirm new password"
            showValue={showConfirmPassword}
            value={confirmPassword}
          />

          <div className="mt-6">
            <PrimaryButton>Reset password</PrimaryButton>
          </div>

          <BackButton onClick={() => goToStage("verify")}>
            Back to verification
          </BackButton>
        </form>
      ) : null}
    </section>
  );
}

function PrimaryButton({
  children,
  disabled,
  className = ""
}: {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`flex h-11.5 w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#2d2c33] text-[13.5px] font-semibold tracking-[-0.01em] text-white transition duration-150 hover:-translate-y-px hover:bg-[#47464f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  );
}

function PasswordField({
  id,
  label,
  onChange,
  onToggleVisibility,
  placeholder,
  showValue,
  value
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  placeholder: string;
  showValue: boolean;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6d78]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <input
          autoComplete="new-password"
          className="h-[54px] w-full rounded-[12px] border-[1.5px] border-[#e8e7ec] bg-[#f9f8fb] pl-11 pr-11 text-[13.5px] font-medium text-[#2d2c33] outline-none transition placeholder:font-normal placeholder:text-[#b8b7bf] focus:border-[#2d2c33] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,44,51,0.08)]"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={showValue ? "text" : "password"}
          value={value}
        />
        <KeyRound
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#b8b7bf]"
        />
        <button
          aria-label={showValue ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#b8b7bf] transition hover:text-[#2d2c33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33]"
          onClick={onToggleVisibility}
          type="button"
        >
          {showValue ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function BackLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#9896a4] transition hover:text-[#2d2c33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33]"
      href={href}
    >
      <ArrowLeft aria-hidden="true" className="size-3.5" />
      {children}
    </Link>
  );
}

function BackButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#9896a4] transition hover:text-[#2d2c33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33]"
      onClick={onClick}
      type="button"
    >
      <ArrowLeft aria-hidden="true" className="size-3.5" />
      {children}
    </button>
  );
}

function getStageTitle(stage: ResetStage) {
  if (stage === "verify") return "Verify your code";
  if (stage === "reset") return "Create new password";
  return "Reset your password";
}

function getStageDescription(stage: ResetStage, email: string) {
  if (stage === "verify") return `Enter the code sent to ${email || "your work email"}.`;
  if (stage === "reset") return "Choose a new password for your admin account.";
  return "Enter your work email and we'll send a verification code.";
}