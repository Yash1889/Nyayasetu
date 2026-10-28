import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "NyayaSetu — Evidence-Grounded Legal Information & Pre-Litigation Triage",
  description: "A Risk-Aware Retrieval-Augmented Framework for Evidence-Grounded Legal Information and Pre-Litigation Triage for Indian Citizens.",
  keywords: ["NyayaSetu", "Indian Law", "Legal Triage", "BNS 2023", "BNSS 2023", "Consumer Protection", "Cyber Crime 1930", "NALSA Legal Aid 15100"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-paper-warm text-ink-deep font-sans">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
