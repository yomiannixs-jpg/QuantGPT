import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quant GPT",
  description: "AI for mathematics, science, engineering, finance, economics, research, data analysis and exam preparation.",
  appleWebApp: { capable: true, title: "Quant GPT", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
