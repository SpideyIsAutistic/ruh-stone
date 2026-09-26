import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUH STONE | Soul in Stone — Contemporary Rajasthan Luxury Craft",
  description:
    "Handcrafted stone objects, German silver pieces, and curated Indian artifacts shaped by master-masons of Rajasthan. Architectural luxury craft gallery.",
  keywords: [
    "RUH STONE",
    "Handcrafted stone",
    "Rajasthan craft",
    "German silver",
    "Indian artifacts",
    "Haveli architecture",
    "Luxury sculpture",
    "Contemporary craft gallery",
  ],
  openGraph: {
    title: "RUH STONE | Soul in Stone",
    description:
      "A contemporary Rajasthan haveli transformed into a luxury art gallery. Handcrafted stone objects and German silver artifacts.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#0c0b0a] text-[#f5eedf] font-sans antialiased selection:bg-[#bd976e]/30 selection:text-[#fbf8f4] overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
