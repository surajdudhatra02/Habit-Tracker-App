"use client";

import Image from "next/image";
import { SCREENSHOTS } from "@/config/siteConfig";

const Screenshots = () => {
  return (
    <section
      id="screenshots"
      aria-labelledby="screenshots-heading"
      className="section bg-dark-bg overflow-hidden"
    >
      <div className="container">
        <div className="section-header">
          <div className="badge mb-5 inline-flex">
            <span aria-hidden="true">📱</span>
            <span>See It In Action</span>
          </div>
          <h2 id="screenshots-heading">
            Beautiful. Minimal.{" "}
            <span className="text-green-light">Purpose-built.</span>
          </h2>
          <p>
            A clean dark interface that keeps you focused on what matters most.
          </p>
        </div>
      </div>

      {/* Scroll track — full bleed, no container clipping */}
      <div
        id="screenshots-track"
        role="list"
        aria-label="App screenshots"
        className="flex gap-5 overflow-x-auto overflow-y-visible pb-2 snap-x snap-mandatory scrollbar-hidden"
        style={{
          paddingLeft: "max(24px, calc((100vw - 1200px) / 2 + 24px))",
          paddingRight: "max(24px, calc((100vw - 1200px) / 2 + 24px))",
        }}
      >
        {SCREENSHOTS.map((ss) => (
          <div
            key={ss.id}
            id={ss.id}
            role="listitem"
            className="flex-shrink-0 snap-start flex flex-col items-center gap-3"
          >
            <div className="w-[190px] rounded-[32px] overflow-hidden border-[1.5px] border-card-border shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-200 hover:border-green-light/45 hover:-translate-y-1">
              <Image
                src={ss.src}
                alt={ss.alt}
                width={190}
                height={411}
                className="w-full h-auto block"
              />
            </div>
            <span className="text-xs font-semibold text-grey-text tracking-[0.02em]">
              {ss.label}
            </span>
          </div>
        ))}
      </div>

      <p
        className="text-center text-[11px] text-divider mt-5 tracking-[0.05em]"
        aria-hidden="true"
      >
        ← swipe to explore →
      </p>
    </section>
  );
};

export default Screenshots;
