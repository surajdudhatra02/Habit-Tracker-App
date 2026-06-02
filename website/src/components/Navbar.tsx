"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
      setMenuOpen(false); // Close mobile menu if open
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Screenshots", href: "#screenshots" },
  ];

  return (
    <header
      id="navbar"
      className={`fixed top-0 inset-x-0 z-[1000] transition-all duration-300 ${
        scrolled
          ? "bg-dark-bg/90 backdrop-blur-[20px] border-b border-card-border/80"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e as any, "#")}
          id="nav-logo"
          aria-label="Habitz home"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/graphic-banner.png"
            alt="Habitz logo"
            width={36}
            height={36}
            priority
            className="rounded-sm"
          />
          <span className="font-display font-bold text-[19px] tracking-wide text-app-white hidden sm:block leading-none pt-0.5">
            Habitz{" "}
            <span className="text-[12px] font-medium text-green-light opacity-80 tracking-normal ml-1">
              — Evolve Daily
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          className="desktop-nav hidden md:flex items-center gap-1"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e as any, link.href)}
              id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-grey-text hover:text-app-white hover:bg-white/[0.06] transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#download"
            onClick={(e) => handleNavClick(e as any, "#download")}
            id="nav-cta"
            className="btn-primary ml-2 !py-[10px] !px-[22px] !text-sm"
          >
            Download App
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden bg-transparent border-none text-app-white text-xl cursor-pointer p-1"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-grey border-b border-card-border px-6 pt-3 pb-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e as any, link.href)}
              className="px-4 py-3 text-[15px] font-medium text-off-white rounded-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#download"
            onClick={(e) => handleNavClick(e as any, "#download")}
            className="btn-primary mt-2.5 text-center rounded-sm"
          >
            Download App
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
