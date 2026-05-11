"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";

type LoginFormProps = {
  callbackUrl: string;
  error?: string;
  isGoogleEnabled: boolean;
};

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid admin email."),
  password: z.string().min(1, "Enter your password.")
});

export function LoginForm({
  callbackUrl,
  error,
  isGoogleEnabled
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shownAuthErrorRef = useRef<string | null>(null);

  const authError = getAuthErrorMessage(error);

  useEffect(() => {
    if (!authError || shownAuthErrorRef.current === authError) {
      return;
    }

    toast.error(authError);
    shownAuthErrorRef.current = authError;
  }, [authError]);

  async function handleCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedLogin = loginSchema.safeParse({ email, password });

    if (!parsedLogin.success) {
      toast.error(
        parsedLogin.error.issues[0]?.message ?? "Check your login details."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: parsedLogin.data.email,
        password: parsedLogin.data.password,
        redirect: false,
        redirectTo: callbackUrl
      });

      if (result?.ok && result.url && !result.error) {
        window.location.assign(result.url);
        return;
      }

      toast.error(getAuthErrorMessage(result?.error) ?? INVALID_LOGIN_MESSAGE);
    } catch {
      toast.error("We could not sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative w-full overflow-hidden rounded-[20px] border border-[#e8e7ec] bg-white px-8 pb-8 pt-9 shadow-[0_2px_4px_rgba(45,44,51,0.04),0_8px_24px_rgba(45,44,51,0.08),0_32px_64px_rgba(45,44,51,0.1)] before:absolute before:right-[-1px] before:top-[-1px] before:h-[90px] before:w-[90px] before:rounded-bl-[90px] before:rounded-tr-[28px] before:bg-[linear-gradient(135deg,#f3f2f6_0%,#e8e7ec_100%)] before:content-['']">
      <div className="relative text-center mb-8">
        <div className="mb-4.5 inline-flex items-center gap-1.5 rounded-full border border-[#e8e7ec] bg-[#f3f2f6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6e6d78]">
          <span className="size-1.5 rounded-full bg-[#2d2c33]" />
          Secure Portal
        </div>

        <h1 className="font-display text-[34px] font-normal leading-[1.05] tracking-normal text-[#2d2c33]">
          Admin Login
        </h1>
        <p className="mt-2.5 text-sm text-[#6e6d78]">
          Enter your details to access the admin portal
        </p>
      </div>

      <form
        className="relative mt-8 flex flex-col gap-4"
        noValidate
        onSubmit={handleCredentialsSignIn}
      >
        <div className="space-y-2">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6d78]"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              autoComplete="email"
              className="h-13.5 w-full rounded-xl border-[1.5px] border-[#e8e7ec] bg-[#f9f8fb] px-4 pr-12 text-[15px] text-[#2d2c33] outline-none transition placeholder:text-[#b8b7bf] focus:border-[#2d2c33] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,44,51,0.08)]"
              id="email"
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

        <div className="space-y-2">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6d78]"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              autoComplete="current-password"
              className="h-13.5 w-full rounded-xl border-[1.5px] border-[#e8e7ec] bg-[#f9f8fb] px-4 pr-12 text-[15px] text-[#2d2c33] outline-none transition placeholder:text-[#b8b7bf] focus:border-[#2d2c33] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,44,51,0.08)]"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-[#b8b7bf] transition hover:text-[#2d2c33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </div>

        <Link
          className="-mt-1 block text-right text-xs font-semibold text-[#6e6d78] transition hover:text-[#2d2c33]"
          href="/forgot-password?stage=email"
        >
          Forgot password?
        </Link>

        <button
          className="relative mt-6 flex h-[54px] w-full items-center justify-center overflow-hidden rounded-[14px] bg-[#2d2c33] text-[15px] text-white shadow-[0_4px_16px_rgba(45,44,51,0.22)] transition duration-200 after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_60%)] after:content-[''] hover:-translate-y-px hover:bg-[#47464f] hover:shadow-[0_8px_28px_rgba(45,44,51,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={isSubmitting}
          type="submit"
        >
          <Lock aria-hidden="true" className="mr-2 size-4" />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {isGoogleEnabled ? (
        <>
          <div className="relative my-6 flex items-center gap-3 text-xs font-medium tracking-[0.04em] text-[#b8b7bf]">
            <span className="h-px flex-1 bg-[#e8e7ec]" />
            Sign in with
            <span className="h-px flex-1 bg-[#e8e7ec]" />
          </div>

          <button
            className="relative flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] border-[#e8e7ec] bg-white text-sm font-semibold text-[#2d2c33] transition duration-200 hover:-translate-y-px hover:border-[#6e6d78] hover:bg-[#f9f8fb] hover:shadow-[0_4px_16px_rgba(45,44,51,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2c33] active:translate-y-0"
            onClick={() => signIn("google", { redirectTo: callbackUrl })}
            type="button"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </>
      ) : null}

      <p className="relative mt-4 text-center text-xs leading-5 text-[#6e6d78]">
        Only active admin users can access this portal.
      </p>
    </section>
  );
}

function getAuthErrorMessage(error?: string) {
  if (!error) {
    return null;
  }

  if (error === "AccessDenied") {
    return "This Google account is not approved for admin access.";
  }

  if (error === "CredentialsSignin") {
    return INVALID_LOGIN_MESSAGE;
  }

  return "We could not sign you in. Please try again.";
}

const INVALID_LOGIN_MESSAGE =
  "Invalid email or password, or this admin account is not approved.";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
