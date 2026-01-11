import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App - Phase III",
  description: "Multi-user task management with authentication and AI chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
        suppressHydrationWarning
      >
        <div className="animated-mesh" />
        <div className="neon-orb w-[500px] h-[500px] bg-indigo-600/20 top-[-100px] left-[-100px] animate-float" />
        <div className="neon-orb w-[400px] h-[400px] bg-violet-600/20 bottom-[-50px] right-[-50px] animate-float" style={{ animationDelay: '-3s' }} />

        <main className="relative z-10">
          {children}
        </main>

        <ChatbotWidget />
      </body>
    </html>
  );
}
