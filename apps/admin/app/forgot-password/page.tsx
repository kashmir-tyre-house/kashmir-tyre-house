import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { ForgotPasswordForm } from "../../components/forgot-password-form";

type ResetStage = "email" | "verify" | "reset";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    stage?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/tyres");
  }

  const params = await searchParams;
  const stage = getResetStage(params?.stage);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#2d2c33] px-4">
      <div className="absolute inset-0 bg-[url('/images/bg-image.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[rgba(12,16,28,0.48)]" />
      <div className="relative z-10 w-full max-w-[520px]">
        <ForgotPasswordForm
          initialEmail={params?.email ?? ""}
          stage={stage}
        />
      </div>
    </main>
  );
}

function getResetStage(stage?: string): ResetStage {
  if (stage === "verify" || stage === "reset") {
    return stage;
  }

  return "email";
}
