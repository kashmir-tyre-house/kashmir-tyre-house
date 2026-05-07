"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function PageLoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-[220px] sm:w-[260px]">
        <DotLottieReact
          autoplay
          loop
          src="/lottie/Sandy_Loading_beige.lottie"
        />
      </div>
    </div>
  );
}
