import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUH STONE — Soul in Stone | Contemporary Rajasthani Craft House",
  description:
    "Handcrafted stone objects, German silver pieces, and curated Indian artifacts shaped by master-masons of Rajasthan. Architectural luxury craft gallery.",
  keywords: [
    "RUH STONE",
    "Handcrafted stone",
    "Rajasthan architecture",
    "Sandstone craft",
    "Haveli artifacts",
    "German silver",
    "Silawat masons",
    "Contemporary craft gallery",
  ],
  openGraph: {
    title: "RUH STONE — Soul in Stone",
    description:
      "A contemporary Rajasthan haveli transformed into a luxury art gallery. Handcrafted stone objects, German silver pieces, and curated Indian artifacts.",
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
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#F2EBDD] text-[#241A14] font-sans antialiased selection:bg-[#B98B62]/30 selection:text-[#241A14] overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
