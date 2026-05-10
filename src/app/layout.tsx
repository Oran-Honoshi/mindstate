import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { RatingModal } from "@/components/modals/RatingModal";
import { SuggestionButton } from "@/components/ui/SuggestionButton";

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
  title: { default:"MindState — Sharper Every Day.", template:"%s | MindState" },
  description:"Explore 20 logic disciplines and 1,000+ hand-crafted stages. An elegant brain-training suite designed for the modern mind.",
  keywords:["brain training","logic games","puzzle","mindstate","tango game","queens puzzle","focus","wellness","cognitive training","daily challenge"],
  authors:[{ name:"MindState" }],
  creator:"MindState",
  metadataBase: new URL("https://mindstate.vercel.app"),
  openGraph:{
    type:"website",
    url:"https://mindstate.vercel.app",
    siteName:"MindState",
    title:"MindState — Sharper Every Day.",
    description:"20 logic games. 1,000+ stages each. One elegant training suite.",
    images:[{
      url:"https://mindstate.vercel.app/icons/icon-512.png",
      width:512, height:512, alt:"MindState"
    }],
  },
  twitter:{
    card:"summary",
    title:"MindState — Sharper Every Day.",
    images:["https://mindstate.vercel.app/icons/icon-512.png"],
  },
  robots:{ index:true, follow:true },
  manifest:"/manifest.json",
  appleWebApp:{
    capable:true,
    statusBarStyle:"default",
    title:"MindState",
  },
};

export const viewport: Viewport = {
  themeColor:"#4F6EF7",
  width:"device-width",
  initialScale:1,
  maximumScale:1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" href="/icons/icon-192.png" type="image/png"/>

        {/* Apple PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png"/>

        {/* Apple PWA fullscreen */}
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="MindState"/>

        {/* MS tile */}
        <meta name="msapplication-TileImage" content="/icons/icon-192.png"/>
        <meta name="msapplication-TileColor" content="#4F6EF7"/>

        {/* Theme init — prevent flash */}
        <script dangerouslySetInnerHTML={{ __html:`
          (function(){
            try {
              var s=JSON.parse(localStorage.getItem('mindstate-settings')||'{}');
              var theme=s&&s.state&&s.state.theme;
              if(theme==='dark'){
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme='dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme='light';
              }
              var lang=s&&s.state&&s.state.language;
              if(lang==='he'){document.documentElement.dir='rtl';document.documentElement.lang='he';}
            } catch(e) {
              document.documentElement.classList.remove('dark');
            }
          })();
        `}}/>
      </head>
      <body className={`${fraunces.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <RealtimeProvider>
                {children}
                <WelcomeModal />
                <RatingModal />
                <SuggestionButton />
              </RealtimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
