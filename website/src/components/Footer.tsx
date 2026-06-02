"use client";

import Image from "next/image";
import Link from "next/link";
import { FOOTER_LINKS, DEVELOPER, TECH_STACK } from "@/config/siteConfig";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string | undefined,
  ) => {
    if (href && href.startsWith("#")) {
      e.preventDefault();
      if (href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <footer
      id="footer"
      className="border-t border-card-border bg-dark-grey pt-16 pb-8"
    >
      <div className="container">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              onClick={(e) => handleNavClick(e as any, "#")}
              id="footer-logo"
              className="inline-flex items-center gap-3 mb-4"
            >
              <Image
                src="/logo-512.png"
                alt="Habitz logo"
                width={44}
                height={44}
                className="rounded-[10px]"
              />
              <span className="font-display font-bold text-[22px] text-app-white leading-none pt-1">
                Habitz
                <span className="text-[13px] font-medium text-green-light opacity-80 tracking-normal ml-1.5">
                  — Evolve Daily
                </span>
              </span>
            </Link>
            <p className="text-[13px] text-grey-text leading-[1.7] max-w-[220px] mb-5">
              Build consistent habits with smart reminders, streak tracking, and
              goal setting.
            </p>
            {/* Tech stack pills */}
            <div className="flex gap-1.5 flex-wrap">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] font-medium text-divider bg-card-border/70 border border-card-border rounded-full px-2.5 py-[3px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Nav link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[11px] font-bold text-grey-text tracking-[0.08em] uppercase mb-4">
                {col.heading}
              </h3>
              <ul className="list-none flex flex-col gap-2.5">
                {col.items.map((item) => {
                  const isExternal = "external" in item && item.external;
                  const Component = isExternal ? "a" : Link;
                  return (
                    <li key={item.label}>
                      <Component
                        href={
                          "disabled" in item && item.disabled ? "" : item.href
                        }
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={(e) =>
                          !isExternal && handleNavClick(e as any, item.href)
                        }
                        className={`text-[13px] transition-colors duration-150 inline-flex items-center gap-1 ${
                          "disabled" in item && item.disabled
                            ? "text-divider cursor-not-allowed pointer-events-none"
                            : "text-grey-text hover:text-green-light cursor-pointer"
                        }`}
                      >
                        {item.label}
                        {isExternal && (
                          <span
                            className="text-[10px] opacity-40"
                            aria-hidden="true"
                          >
                            ↗
                          </span>
                        )}
                      </Component>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-card-border pt-6 flex justify-between items-center flex-wrap gap-3">
          <p className="text-xs text-divider">
            © {currentYear} Habitz – Evolve Daily. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-divider">
            <span>Built with</span>
            <span className="text-green-light">♥</span>
            <span>by</span>
            <a
              href={DEVELOPER.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-author-link"
              className="text-green-light font-semibold hover:text-green transition-colors duration-150"
            >
              {DEVELOPER.name}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
