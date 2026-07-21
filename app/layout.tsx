import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EthioPages — Ethiopia's local guide",
  description: "Discover the businesses, services and experiences that make Ethiopia extraordinary.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
