import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";

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
  description:"Explore 20 logic disciplines and 2,000+ hand-crafted stages. An elegant brain-training suite designed for the modern mind.",
  keywords:["brain training","logic games","puzzle","mindstate","tango game","queens puzzle","focus","wellness","cognitive training","daily challenge"],
  authors:[{ name:"MindState" }],
  creator:"MindState",
  metadataBase: new URL("https://mindstate.app"),
  openGraph:{
    type:"website", url:"https://mindstate.app", siteName:"MindState",
    title:"MindState — Sharper Every Day.",
    description:"20 logic games. 2,000+ stages. One elegant training suite.",
    images:[{ url:"/og-image.png", width:1200, height:630 }],
  },
  twitter:{ card:"summary_large_image", title:"MindState — Sharper Every Day.", images:["/og-image.png"] },
  robots:{ index:true, follow:true },
  manifest:"/manifest.json",
  appleWebApp:{ capable:true, statusBarStyle:"default", title:"MindState" },
};

export const viewport: Viewport = {
  themeColor:"#FDFCFB", width:"device-width", initialScale:1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.png"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <script dangerouslySetInnerHTML={{ __html:`
          try{
            const s=JSON.parse(localStorage.getItem('mindstate-settings')||'{}');
            if(s?.state?.theme==='dark') document.documentElement.classList.add('dark');
          }catch(e){}
        `}}/>
      </head>
      <body className={`${fraunces.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <RealtimeProvider>
                {children}
              </RealtimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
