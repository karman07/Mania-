import type { Metadata } from "next";
import { Bangers, Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/app/components/ThemeProvider";
import LanguageProvider from "@/app/components/LanguageProvider";
import AuthProvider from "@/app/components/AuthProvider";
import AuthDialog from "@/app/components/AuthDialog";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RaManga – Desi Stories, Epic Adventures",
  description:
    "Read manga by Indian & international creators. Discover epics, slice-of-life, action and romance told through stunning artwork. 100+ free manga available.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bangers.variable} ${poppins.variable}`}
    >
      <head>
        {/* Prevent dark-mode flash before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ramanga-theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen font-body antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <AuthDialog />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
