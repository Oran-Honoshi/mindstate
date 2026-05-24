import { FAQSchema, OrganizationSchema, WebAppSchema, HowToSchema } from "@/app/seo-schema";
import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { RatingModal } from "@/components/modals/RatingModal";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SharePrompt } from "@/components/ui/SharePrompt";

const fraunces = Fraunces({
  subsets: ["latin"], variable: "--font-fraunces",
  weight: ["300","400","500","600","700","900"], style: ["normal","italic"],
});
const outfit = Outfit({
  subsets: ["latin"], variable: "--font-outfit",
  weight: ["300","400","500","600","700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"], variable: "--font-mono-var",
  weight: ["400","500","600"],
});

export const metadata: Metadata = {
  title: {
    default: "MindElement — Sharper Every Day",
    template: "%s | MindElement"
  },
  description: "An evolving suite of elite brain-training logic games for every mind. Tango, Queens, Sudoku, Nonogram and more — thousands of algorithmic stages. Free to start, $2/mo unlimited.",
  keywords: [
    "brain training","logic games","puzzle games","mind games","cognitive training",
    "sudoku","nonogram","tango game","queens puzzle","daily brain games",
    "Lumosity alternative","Elevate alternative","Peak alternative","brain games app",
    "brain training for kids","brain games for seniors","family brain games",
    "משחקי לוגיקה","juegos de lógica","Denkspiele","jeux de logique","jogos de lógica"
  ],
  authors: [{ name:"MindElement" }],
  creator: "MindElement",
  metadataBase: new URL("https://mindelement.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en": "https://mindelement.app/en",
      "es": "https://mindelement.app/es",
      "de": "https://mindelement.app/de",
      "fr": "https://mindelement.app/fr",
      "pt": "https://mindelement.app/pt",
      "nl": "https://mindelement.app/nl",
      "he": "https://mindelement.app/he",
      "x-default": "https://mindelement.app",
    }
  },
  openGraph: {
    title: "MindElement — Sharper Every Day",
    description: "24 precision logic games. 100 stages each. Free to start.",
    url: "https://mindelement.app",
    siteName: "MindElement",
    images: [{ url:"/og-image.png", width:1200, height:630, alt:"MindElement brain training games" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindElement — Sharper Every Day",
    description: "24 precision logic games. 100 stages each. Free to start.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index:true, follow:true, "max-image-preview":"large", "max-snippet":-1 }
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel:"icon", type:"image/png", sizes:"32x32", url:"/favicon-32x32.png" },
      { rel:"icon", type:"image/png", sizes:"16x16", url:"/favicon-16x16.png" },
    ]
  },
  manifest: "/manifest.json",
  verification: {},
  category: "games",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" href="/icons/icon-192.png" type="image/png"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="MindElement"/>
        <meta name="msapplication-TileImage" content="/icons/icon-192.png"/>
        <meta name="msapplication-TileColor" content="#121212"/>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var s = JSON.parse(localStorage.getItem('mindelement-settings') || '{}');
              var state = s && s.state;
              if (!state) return;
              if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
              if (state.language === 'he') {
                document.documentElement.dir = 'rtl';
                document.documentElement.lang = 'he';
              }
              if (state.isAccessibilityMode) {
                document.documentElement.classList.add('accessibility-mode');
              }
            } catch(e) {
              document.documentElement.classList.remove('dark');
            }
          })();
        `}}/>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `}}/>
      </head>
      <body className={`${fraunces.variable} ${outfit.variable} ${jetbrainsMono.variable} min-h-full w-full overflow-x-hidden`} style={{ overscrollBehaviorX:"none" }}>

        {/*
          ── COSMIC BACKGROUND LAYER ──────────────────────────────────────────
          Fixed behind all content. Only visible in dark mode via CSS.
          Uses the uploaded cosmic arena artwork as base, with CSS nebula
          glows layered on top for depth. Zero impact on light mode.
          pointer-events:none so it never blocks any interaction.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -50,
            pointerEvents: "none",
            display: "none", // hidden by default (light mode)
          }}
          className="cosmic-bg-layer"
        >
          {/* Base image */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url(/images/cosmic-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            opacity: 0.55,
          }}/>
          {/* Dark overlay to deepen it */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(7,7,18,0.45) 0%, rgba(7,7,18,0.7) 100%)",
          }}/>
          {/* Purple nebula — top left */}
          <div style={{
            position: "absolute",
            top: "-15%", left: "-10%",
            width: "55vw", height: "55vh",
            background: "radial-gradient(ellipse, rgba(126,34,206,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}/>
          {/* Emerald nebula — bottom right */}
          <div style={{
            position: "absolute",
            bottom: "-10%", right: "-5%",
            width: "50vw", height: "50vh",
            background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}/>
          {/* Cyan accent — center top */}
          <div style={{
            position: "absolute",
            top: "5%", left: "35%",
            width: "30vw", height: "30vh",
            background: "radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}/>
          {/* Subtle grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}/>
        </div>

        {/* Show cosmic layer only in dark mode */}
        <style>{`
          html.dark .cosmic-bg-layer { display: block !important; }
        `}</style>

        <div style={{ width:"100%", maxWidth:"100vw", overflowX:"hidden", position:"relative" }}>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <RealtimeProvider>
                  {children}
                  <Analytics />
                  <SpeedInsights />
                  <WelcomeModal />
                  <RatingModal />
                  <SharePrompt />
                </RealtimeProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  );
}