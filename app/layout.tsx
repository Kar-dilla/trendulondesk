import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Nav from "@/src/dashboard/components/Nav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Trendulon Desk",
  description: "Global stories. Told the right way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-trendulon-black font-sans text-trendulon-fog antialiased">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 md:pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
