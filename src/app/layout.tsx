import { FAQSchema, OrganizationSchema, WebAppSchema, HowToSchema } from "@/app/seo-schema";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google'
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
import { CosmicBackground } from "@/components/ui/CosmicBackground";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400','500','600','700','800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['500','700'],
})

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
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
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
            var root = document.documentElement;
            var THEME_COLOR = { dark: '#121212', light: '#FFFFFF', paper: '#F2E8D9' };
            function setMeta(t) {
              var m = document.querySelector('meta[name="theme-color"]');
              if (!m) {
                m = document.createElement('meta');
                m.name = 'theme-color';
                document.head.appendChild(m);
              }
              m.content = THEME_COLOR[t];
            }
            try {
              var raw = localStorage.getItem('mindstate-settings');
              var s = raw ? JSON.parse(raw) : null;
              var state = s && s.state;
              var theme = (state && state.theme) || 'dark';
              if (theme !== 'dark' && theme !== 'light' && theme !== 'paper') theme = 'dark';
              root.setAttribute('data-theme', theme);
              root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
              setMeta(theme);
              if (state && state.language === 'he') {
                root.dir = 'rtl';
                root.lang = 'he';
              }
              if (state && state.isAccessibilityMode) {
                root.classList.add('accessibility-mode');
              }
            } catch(e) {
              root.setAttribute('data-theme', 'dark');
              root.style.colorScheme = 'dark';
              setMeta('dark');
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-full w-full overflow-x-hidden`} style={{ overscrollBehaviorX:"none" }}>

        <CosmicBackground />


        <div style={{ width:"100%", maxWidth:"100vw", overflowX:"hidden", position:"relative", zIndex: 1 }}>
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