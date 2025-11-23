import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Raleway,
  Nunito,
  Playfair_Display,
  Merriweather,
  Source_Sans_3,
  Work_Sans,
  DM_Sans,
  Plus_Jakarta_Sans,
  Manrope,
  Space_Grotesk,
  Outfit,
  Sora,
} from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { FontProvider } from "@/contexts/FontContext";

// Existing fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clashDisplay = localFont({
  variable: "--font-clash",
  src: [
    { path: "../fonts/ClashDisplay-Extralight.otf", weight: "200", style: "normal" },
    { path: "../fonts/ClashDisplay-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/ClashDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-Semibold.otf", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-Bold.otf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

// Additional Google Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Combine all font variables
const allFontVariables = [
  clashDisplay.variable,
  geistSans.variable,
  geistMono.variable,
  inter.variable,
  poppins.variable,
  roboto.variable,
  openSans.variable,
  lato.variable,
  montserrat.variable,
  raleway.variable,
  nunito.variable,
  playfairDisplay.variable,
  merriweather.variable,
  sourceSans3.variable,
  workSans.variable,
  dmSans.variable,
  plusJakartaSans.variable,
  manrope.variable,
  spaceGrotesk.variable,
  outfit.variable,
  sora.variable,
].join(" ");



export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Just HODL It.",
    description: "Keep your assets. Minimize your portfolio.",
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
      ],
    },
    other: {
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: 'https://app.joinhodl.com/logos/App_Icon.png',
        button: {
          title: `Just HODL It.`,
          action: {
            type: 'launch_miniapp',
            name: 'Just HODL It.',
            url: 'https://app.joinhodl.com/',
            splashImageUrl: 'https://app.joinhodl.com/logos/HODL_Primary_BlockBlue.svg',
            splashBackgroundColor: '#ffffff',
          },
        },
      }),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${allFontVariables} antialiased`}
      >
        <FontProvider>
          <AppShell>
            {children}
          </AppShell>
        </FontProvider>
      </body>
    </html>
  );
}
