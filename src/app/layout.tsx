import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lock In - Smart Habit Tracker",
  description: "Track your habits with context-aware intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <AuthProvider>{children}</AuthProvider>
            <Toaster position="top-center" richColors />
            <ServiceWorkerRegistrar />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
