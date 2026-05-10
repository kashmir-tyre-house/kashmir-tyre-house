import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { LoginForm } from "../../components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#2d2c33] px-4">
      <div className="absolute inset-0 bg-[url('/images/bg-image.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[rgba(12,16,28,0.48)]" />
      <div className="relative z-10 w-full max-w-[440px]">
        <LoginForm
          callbackUrl={params?.callbackUrl ?? "/dashboard"}
          error={params?.error}
          isGoogleEnabled={Boolean(
            process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
          )}
        />
      </div>
    </main>
  );
}
