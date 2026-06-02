import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Habitz – Evolve Daily | Build Better Habits",
  description:
    "Habitz is the habit tracker that helps you build consistent routines, track daily progress, set goals, and evolve every single day. Available on Android and iOS.",
  keywords: [
    "habit tracker",
    "daily habits",
    "goal setting",
    "productivity app",
    "Habitz",
    "habit building",
    "streak tracker",
    "daily routine",
    "self improvement",
    "Android app",
  ],
  authors: [{ name: "Habitz" }],
  creator: "Habitz",
  publisher: "Habitz",
  metadataBase: new URL("https://habitz.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://habitz.app",
    title: "Habitz – Evolve Daily | Build Better Habits",
    description:
      "Track your habits, set goals, and celebrate streaks with Habitz — the dark-mode-first habit tracker built for people who want to grow.",
    siteName: "Habitz",
    images: [
      {
        url: "/graphic-banner.png",
        width: 1024,
        height: 500,
        alt: "Habitz – Evolve Daily banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Habitz – Evolve Daily",
    description:
      "Build consistent habits, track streaks, and evolve every day with Habitz.",
    images: ["/graphic-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32.png",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
