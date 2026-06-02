"use client";

import Image from "next/image";
import { STORE_URLS, CTA_TRUST_ITEMS } from "@/config/siteConfig";
import { COLORS } from "@/constants/colors";

const CTABanner = () => {
  return (
    <section
      id="download"
      aria-labelledby="cta-heading"
      className="section relative overflow-hidden bg-dark-bg"
    >
      {/* Glow orb */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div
          className="animate-glow-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[60px]"
          style={{
            background: `radial-gradient(circle, ${COLORS.GREEN_LIGHT}0f 0%, transparent 65%)`,
          }}
        />
      </div>

      <div className="container relative z-[1] text-center">
        {/* Badge */}
        <div className="badge mb-6 inline-flex">
          <span aria-hidden="true">🚀</span>
          <span>Free to download · No credit card needed</span>
        </div>

        {/* Headline */}
        <h2
          id="cta-heading"
          className="text-[clamp(2rem,5vw,3.4rem)] font-black leading-[1.06] mb-[18px] tracking-[-0.03em]"
        >
          Ready to <span className="text-green-light">evolve daily?</span>
        </h2>

        <p className="text-[1.05rem] text-green-light max-w-[500px] mx-auto mb-11 leading-[1.7]">
          Start building habits that actually stick. Download Habitz now — free,
          no ads, privacy-first.
        </p>

        {/* Store Buttons */}
        <div className="flex justify-center gap-4 flex-wrap mb-9">
          {/* Google Play — primary green button */}
          <a
            href={STORE_URLS.googlePlay}
            id="cta-playstore-btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Habitz on Google Play"
            className="inline-flex items-center gap-3.5 px-7 py-[15px] bg-green-light text-[#0d1a0f] rounded-md font-bold text-[15px] font-display transition-all duration-[250ms] ease-in-out shadow-[0_6px_24px_rgba(165,201,167,0.25)] no-underline min-w-[185px] hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_12px_36px_rgba(165,201,167,0.35)] hover:bg-[#b8d4ba] active:translate-y-0 active:scale-100"
          >
            <span aria-hidden="true" className="flex-shrink-0">
              <Image
                src="/playstore-icon.png"
                alt="Google Play"
                width={26}
                height={26}
                className="rounded-[4px]"
              />
            </span>
            <span className="flex flex-col items-start leading-[1.1]">
              <span className="text-[10px] font-medium opacity-70">
                Download on
              </span>
              <span>Google Play</span>
            </span>
          </a>

          {/* App Store — Coming Soon (disabled) */}
          <div
            id="cta-appstore-btn"
            aria-label="App Store — coming soon"
            className="inline-flex items-center gap-3.5 px-7 py-[15px] bg-dark-grey/60 border border-card-border/70 rounded-md text-app-white/35 font-semibold text-[15px] font-display min-w-[185px] cursor-not-allowed"
          >
            <span aria-hidden="true" className="flex-shrink-0">
              <Image
                src="/apple-icon.png"
                alt="App Store"
                width={26}
                height={26}
                className="rounded-[6px] opacity-35"
              />
            </span>
            <span className="flex flex-col items-start leading-[1.1]">
              <span className="text-[10px] font-medium opacity-70">
                Coming Soon to
              </span>
              <span>App Store</span>
            </span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 flex-wrap text-green-light text-sm font-medium opacity-80">
          {CTA_TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
