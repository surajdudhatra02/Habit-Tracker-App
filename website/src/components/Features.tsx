"use client";

import { FEATURES } from "@/config/siteConfig";

const Features = () => {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="section"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="badge mb-5 inline-flex">
            <span>⚡</span>
            <span>Packed with Features</span>
          </div>
          <h2 id="features-heading">
            Everything you need to{" "}
            <span className="text-green-light">build lasting habits</span>
          </h2>
          <p>
            Habitz gives you the right tools without the overwhelm. Simple,
            focused, and designed to keep you consistent.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <article
              key={feature.id}
              id={feature.id}
              className="bg-dark-grey border border-card-border rounded-lg p-7 transition-all duration-[250ms] ease-in-out cursor-default relative overflow-hidden hover:-translate-y-1 hover:border-green-light/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:bg-surface-2"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Subtle corner glow — radial gradient, kept as inline style */}
              <div
                className="absolute top-0 right-0 w-[100px] h-[100px] rounded-full blur-[20px] pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${feature.colorBg} 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div
                className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl mb-5 flex-shrink-0"
                style={{
                  background: feature.colorBg,
                  border: `1px solid ${feature.colorBorder}`,
                }}
                aria-hidden="true"
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold mb-2.5 text-app-white font-display">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-grey-text leading-[1.7]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
