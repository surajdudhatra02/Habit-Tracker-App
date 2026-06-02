"use client";

import Image from "next/image";
import {
  STORE_URLS,
  HERO_STATS,
  SCREENSHOTS,
  HERO_MAIN_SCREENSHOT_ID,
  HERO_BG_SCREENSHOT_ID,
} from "@/config/siteConfig";
import { COLORS } from "@/constants/colors";

const Hero = () => {
  const mainSS =
    SCREENSHOTS.find((s) => s.id === HERO_MAIN_SCREENSHOT_ID) ?? SCREENSHOTS[0];
  const bgSS =
    SCREENSHOTS.find((s) => s.id === HERO_BG_SCREENSHOT_ID) ?? SCREENSHOTS[1];

  return (
    <section
      id="hero"
      aria-label="Hero section"
      className="relative min-h-[100vh] flex items-center overflow-hidden pt-16"
    >
      {/* ── Decorative background ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      >
        {/* Green glow */}
        <div
          className="animate-glow-pulse absolute top-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full blur-[50px]"
          style={{
            background: `radial-gradient(circle, ${COLORS.GREEN}17 0%, transparent 70%)`,
          }}
        />
        {/* Dark green bottom glow */}
        <div
          className="absolute bottom-[5%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[60px]"
          style={{
            background: `radial-gradient(circle, ${COLORS.GREEN_DARK}e6 0%, transparent 70%)`,
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(${COLORS.CARD_BORDER} 1px, transparent 1px),
              linear-gradient(90deg, ${COLORS.CARD_BORDER} 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 60% 40%, black 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container grid grid-cols-1 lg:grid-cols-2 items-center gap-[60px] py-20 relative z-[1]">
        {/* Left: Text */}
        <div className="max-w-[560px]">
          {/* Badge */}
          <div className="badge mb-7 inline-flex">
            <span>Download Today</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.6rem,5vw,3.8rem)] font-black leading-[1.05] mb-5 tracking-[-0.03em]">
            Build Habits.{" "}
            <span className="text-green-light">Track Progress.</span>
            <br />
            Evolve Daily.
          </h1>

          {/* Subtitle */}
          <p className="text-[1.1rem] text-grey-text leading-[1.75] mb-10 max-w-[460px]">
            Habitz keeps you consistent. Set daily goals, build streaks, get
            smart reminders, and watch your progress grow — one habit at a time.
          </p>

          {/* Store Buttons */}
          <div className="flex flex-wrap gap-3.5 mb-12">
            {/* Google Play */}
            <a
              href={STORE_URLS.googlePlay}
              id="hero-playstore-btn"
              target="_blank"
              rel="noopener noreferrer"
              className="store-btn"
              aria-label="Download Habitz on Google Play"
            >
              <span className="store-icon" aria-hidden="true">
                <Image
                  src="/playstore-icon.png"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-[4px]"
                />
              </span>
              <span className="store-label">
                <small>Get it on</small>
                <strong>Google Play</strong>
              </span>
            </a>

            {/* App Store — Coming Soon */}
            <div
              id="hero-appstore-btn"
              aria-label="App Store – coming soon"
              className="inline-flex items-center gap-3 px-[22px] py-3 bg-dark-grey/50 border border-card-border/50 rounded-md text-app-white/30 min-w-[170px] cursor-not-allowed"
            >
              <span aria-hidden="true" className="flex-shrink-0">
                <Image
                  src="/apple-icon.png"
                  alt=""
                  width={26}
                  height={26}
                  className="rounded-[6px] opacity-35"
                />
              </span>
              <span className="flex flex-col">
                <small className="text-[10px] font-normal leading-none">
                  Coming soon to
                </small>
                <strong className="text-[15px] font-display">App Store</strong>
              </span>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="flex gap-8 flex-wrap">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold font-display text-app-white leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-grey-text mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Right: Phone mockups */}
        <div className="flex justify-center items-center relative">
          {/* Glow behind phones */}
          <div
            className="absolute w-[300px] h-[300px] rounded-full blur-[40px] z-0"
            style={{
              background: `radial-gradient(circle, ${COLORS.GREEN}24 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />

          {/* Main phone */}
          <div className="animate-float relative z-[2] w-[232px]">
            <div className="phone-frame">
              <Image
                src={mainSS.src}
                alt={mainSS.alt}
                width={232}
                height={502}
                priority
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Background phone */}
          <div className="animate-float-slow absolute right-0 top-[50px] z-[1] w-[172px] opacity-65">
            <div className="phone-frame">
              <Image
                src={bgSS.src}
                alt={bgSS.alt}
                width={172}
                height={373}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-grey-text text-[11px] tracking-[0.05em]"
      >
        <span>scroll to explore</span>
        <div className="w-5 h-8 border border-card-border rounded-[10px] flex justify-center pt-[5px]">
          <div
            className="w-[3px] h-[6px] bg-green-light rounded-[2px]"
            style={{ animation: "floatPhone 1.4s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #hero > .container {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: 48px !important;
          }
          #hero > .container > div:first-child { max-width: 100% !important; }
          #hero > .container > div:first-child p { margin: 0 auto 40px !important; }
          #hero > .container > div:first-child > div:nth-child(3),
          #hero > .container > div:first-child > div:last-child { justify-content: center !important; }
        }
        @media (max-width: 600px) {
          #hero > .container > div:last-child > div:last-child { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
