"use client";

import { PageErrorState } from "../../components/page-error-state";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

// Route-level boundary for /contact (Send Enquiry). Because a failed enquiry
// form costs the business a lead, the secondary action is the phone number
// rather than another page.
export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f9eee4] text-[#231a12]">
      <SiteHeader />

      <PageErrorState
        description="We couldn't load the enquiry form just now. Please try again — or call us directly and we'll take your requirement over the phone."
        error={error}
        reset={reset}
        scope="contact"
        secondaryAction={{ href: "tel:+919977249965", label: "Call +91 99772 49965" }}
        title="Enquiry form couldn't be loaded"
      />

      <SiteFooter />
    </main>
  );
}
