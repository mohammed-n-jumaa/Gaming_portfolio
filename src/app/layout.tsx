import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono, Alexandria, Silkscreen } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const arabic = Alexandria({ subsets: ["arabic", "latin"], variable: "--font-arabic", display: "swap" });
const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixel", display: "swap" });

export const metadata: Metadata = {
  title: "Mohammed Nedal — Full Stack Developer",
  description:
    "Portfolio of Mohammed Nedal — Full Stack Developer & SharePoint Engineer. React, Laravel, ASP.NET, SPFx.",
  openGraph: {
    title: "Mohammed Nedal — Full Stack Developer",
    description: "Engineered like software, finished like design.",
    images: ["https://i.postimg.cc/k4JMxpf2/Professional-Navy-Suit-Headshot.png"],
  },
};

export const viewport: Viewport = { themeColor: "#031326", width: "device-width", initialScale: 1 };

// runs before paint: restores palette + direction so there's no flash
const boot = `try{var d=document.documentElement,t=localStorage.getItem('mn-theme');if(t)d.dataset.theme=t;if(localStorage.getItem('mn-lang')==='ar'){d.lang='ar';d.dir='rtl'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="neon"
      className={`${archivo.variable} ${serif.variable} ${mono.variable} ${arabic.variable} ${pixel.variable} is-loading`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
