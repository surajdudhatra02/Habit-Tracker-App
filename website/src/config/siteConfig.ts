import { COLORS } from "../constants/colors";

export const FEATURE_COLORS = {
  red: {
    color: COLORS.RED,
    colorBg: "rgba(255,90,95,0.08)",
    colorBorder: "rgba(255,90,95,0.2)",
  },
  green: {
    color: COLORS.GREEN,
    colorBg: "rgba(72,234,118,0.08)",
    colorBorder: "rgba(72,234,118,0.2)",
  },
  greenLight: {
    color: COLORS.GREEN_LIGHT,
    colorBg: "rgba(165,201,167,0.08)",
    colorBorder: "rgba(165,201,167,0.2)",
  },
  yellow: {
    color: COLORS.YELLOW,
    colorBg: "rgba(255,193,7,0.08)",
    colorBorder: "rgba(255,193,7,0.2)",
  },
};

export const AVATAR_COLORS = {
  greenVivid: { text: COLORS.GREEN, bg: COLORS.GREEN_DARK },
  yellow: { text: COLORS.YELLOW, bg: "#252535" },
  greenSoft: { text: COLORS.GREEN_LIGHT, bg: "#1a2320" },
};

export const APP_NAME = "Habitz";
export const APP_TAGLINE = "Evolve Daily";
export const APP_DESCRIPTION =
  "Habitz keeps you consistent. Set daily goals, build streaks, get smart reminders, and watch your progress grow — one habit at a time.";
export const APP_BUNDLE_ID = "com.suraj.habitz";

export const STORE_URLS = {
  googlePlay: `https://play.google.com/store/apps/details?id=${APP_BUNDLE_ID}`,
  appStore: null as string | null,
};

export const DEVELOPER = {
  name: "Suraj Dudhatra",
  portfolio: "https://surajd.com",
  github: "https://github.com/surajdudhatra02",
  email: "mailto:dev.surajd02@gmail.com",
  privacy: "https://sites.google.com/view/habitz-privacy",
};

export const HERO_STATS = [
  { value: "500+", label: "Active Users" },
  { value: "4.8★", label: "Rating" },
  { value: "10K+", label: "Habits Tracked" },
];
export const RATING_SUMMARY = [
  { value: "4.8", label: "Average Rating", suffix: "/ 5" },
  { value: "500+", label: "Active Users", suffix: "" },
  { value: "98%", label: "Would Recommend", suffix: "" },
];

export const SCREENSHOTS = [
  {
    id: "ss-home",
    src: "/screenshots/home.png",
    alt: "Habitz home screen — daily habits, weekly bar chart, success rate",
    label: "Home",
  },
  {
    id: "ss-habits",
    src: "/screenshots/habits.png",
    alt: "Habitz habits list",
    label: "My Habits",
  },
  {
    id: "ss-today",
    src: "/screenshots/todayhabits.png",
    alt: "Habitz today's habits",
    label: "Today",
  },
  {
    id: "ss-new",
    src: "/screenshots/newHabit.png",
    alt: "Habitz new habit screen",
    label: "New Habit",
  },
  {
    id: "ss-progress",
    src: "/screenshots/progress.png",
    alt: "Habitz progress screen",
    label: "Progress",
  },
  {
    id: "ss-signup",
    src: "/screenshots/signup.png",
    alt: "Habitz sign up screen",
    label: "Sign Up",
  },
];

export const HERO_MAIN_SCREENSHOT_ID = "ss-home";
export const HERO_BG_SCREENSHOT_ID = "ss-progress";

// ─── Features ────────────────────────────────────────────────

export const FEATURES = [
  {
    id: "feature-checkin",
    icon: "🔥",
    title: "Daily Check-ins",
    description:
      "Start every day with a clear view of your habits. One tap to mark complete and build your streak.",
    ...FEATURE_COLORS.red,
  },
  {
    id: "feature-progress",
    icon: "📊",
    title: "Weekly Progress",
    description:
      "Beautiful bar charts show your habit completions day by day — see your momentum build in real time.",
    ...FEATURE_COLORS.green,
  },
  {
    id: "feature-goals",
    icon: "🎯",
    title: "Goal Setting",
    description:
      'Set custom goals like "30 days in a row" and get notified when you crush them. Big wins, one day at a time.',
    ...FEATURE_COLORS.greenLight,
  },
  {
    id: "feature-reminders",
    icon: "🔔",
    title: "Smart Reminders",
    description:
      "Add multiple custom reminder times per habit. Never miss a day with flexible daily notifications.",
    ...FEATURE_COLORS.yellow,
  },
  {
    id: "feature-calendar",
    icon: "📅",
    title: "Calendar View",
    description:
      "Visual calendar showing your daily completion history at a glance. Spot patterns and plan ahead.",
    ...FEATURE_COLORS.green,
  },
  {
    id: "feature-trends",
    icon: "📈",
    title: "Monthly Trends",
    description:
      "Track your 30-day habit completion rate and compare growth over time. Data-driven self-improvement.",
    ...FEATURE_COLORS.greenLight,
  },
];

// ─── Testimonials ────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Priya S.",
    handle: "@priyalifts",
    avatar: "PS",
    avatarColor: AVATAR_COLORS.greenVivid.text,
    avatarBg: AVATAR_COLORS.greenVivid.bg,
    rating: 5,
    quote:
      "Finally a habit app that doesn't feel cluttered. The dark theme is 🔥 and the weekly charts actually motivate me to keep going. 30-day streak and counting!",
    tag: "Fitness & Wellness",
  },
  {
    id: "testimonial-2",
    name: "Arjun M.",
    handle: "@arjunbuilds",
    avatar: "AM",
    avatarColor: AVATAR_COLORS.yellow.text,
    avatarBg: AVATAR_COLORS.yellow.bg,
    rating: 5,
    quote:
      "Set a goal to read for 30 minutes every day. Habitz's reminder system is the only reason I've kept it up for 3 weeks. The goal tracker is a game changer.",
    tag: "Reading & Learning",
  },
  {
    id: "testimonial-3",
    name: "Sneha R.",
    handle: "@snehacode",
    avatar: "SR",
    avatarColor: AVATAR_COLORS.greenSoft.text,
    avatarBg: AVATAR_COLORS.greenSoft.bg,
    rating: 5,
    quote:
      "The UI is insanely clean. Reminds me of premium apps but it's free. Love how the progress section shows my monthly trend — really keeps me accountable.",
    tag: "Productivity",
  },
];

// ─── Footer Navigation ────────────────────────────────────────
export const FOOTER_LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "Screenshots", href: "#screenshots" },
    ],
  },
  {
    heading: "Download",
    items: [
      {
        label: "Google Play",
        href: STORE_URLS.googlePlay,
        external: true,
      },
      { label: "App Store (Soon)", href: "#download", disabled: true },
    ],
  },
  {
    heading: "Developer",
    items: [
      { label: "Portfolio", href: DEVELOPER.portfolio, external: true },
      // { label: "GitHub", href: DEVELOPER.github, external: true },
      { label: "Privacy Policy", href: DEVELOPER.privacy, external: true },
      { label: "Contact", href: DEVELOPER.email, external: true },
    ],
  },
];

export const TECH_STACK = ["React Native", "Supabase", "Firebase"];

export const CTA_TRUST_ITEMS = [
  "✓ Free to download",
  "✓ Free to use",
  "✓ No ads",
  "✓ Privacy-first",
];
