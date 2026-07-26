import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zoom Clone",
  description: "A premium Zoom Web Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zoom-dark-bg text-zoom-text min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
