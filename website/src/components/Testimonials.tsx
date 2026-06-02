"use client";

import { TESTIMONIALS, RATING_SUMMARY } from "@/config/siteConfig";
import { COLORS } from "@/constants/colors";

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className="text-brand-yellow text-[14px]"
        aria-hidden="true"
      >
        ★
      </span>
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="section"
      style={{
        background: `linear-gradient(180deg, ${COLORS.DARK_BG} 0%, ${COLORS.GREEN_DARK}59 50%, ${COLORS.DARK_BG} 100%)`,
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="badge mb-5 inline-flex">
            <span>💬</span>
            <span>Early Adopters Love It</span>
          </div>
          <h2 id="testimonials-heading">
            What our <span className="text-green-light">users say</span>
          </h2>
          <p>
            Join hundreds of users already building better habits with Habitz
            every single day.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.id}
              id={t.id}
              className="bg-dark-grey border border-card-border rounded-xl p-7 transition-all duration-[250ms] ease-in-out relative overflow-hidden hover:-translate-y-1 hover:border-green-light/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              {/* Big decorative quote mark */}
              <div
                className="absolute top-4 right-5 text-[64px] leading-none select-none pointer-events-none"
                style={{
                  fontFamily: "Georgia, serif",
                  color: `${COLORS.GREEN}14`,
                }}
                aria-hidden="true"
              >
                "
              </div>

              <StarRating count={t.rating} />

              <p className="mt-4 mb-6 text-sm leading-[1.8] text-off-white relative">
                {t.quote}
              </p>

              {/* Tag */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-light/[0.08] border border-green-light/15 rounded-full text-[11px] text-green-light mb-5 font-medium">
                {t.tag}
              </div>

              {/* Author */}
              <footer className="flex items-center gap-3 border-t border-card-border pt-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 font-display"
                  style={{
                    background: t.avatarBg,
                    border: `2px solid ${t.avatarColor}30`,
                    color: t.avatarColor,
                  }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <cite className="text-sm font-bold text-app-white not-italic block font-display">
                    {t.name}
                  </cite>
                  <span className="text-xs text-grey-text">{t.handle}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Rating summary bar */}
        <div className="mt-12 bg-dark-grey border border-card-border rounded-xl px-8 py-7 flex items-center justify-center gap-12 flex-wrap">
          {RATING_SUMMARY.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[2rem] font-black font-display text-green-light leading-none">
                {stat.value}
                {stat.suffix && (
                  <span className="text-base text-grey-text font-medium ml-1">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div className="text-xs text-grey-text mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
