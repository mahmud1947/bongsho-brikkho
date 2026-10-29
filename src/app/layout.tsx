import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FamilyProvider } from "@/context/FamilyContext";
import AppShell from "@/components/AppShell";
import PwaRegistration from "@/components/PwaRegistration";

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/bongsho-brikkho" : "";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "বংশবৃক্ষ | Bongsho Brikkho",
  description: "একটি আধুনিক পারিবারিক বংশবৃক্ষ ও পরিবার পরিচিতি প্ল্যাটফর্ম",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "বংশবৃক্ষ",
  },
  icons: {
    icon: [
      { url: `${basePath}/favicon.png`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/icons/icon-192x192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512x512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-amber-300 selection:text-emerald-950">
        <FamilyProvider>
          <AppShell>{children}</AppShell>
        </FamilyProvider>
        <PwaRegistration />
      </body>
    </html>
  );
}
