import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPUB Audiobook Reader",
  description: "Upload EPUB files and listen to them as audiobooks",
  manifest: "/manifest.json",
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
