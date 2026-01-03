import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/shared/ui";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Corporate Booking | Property Management",
  description: "Enterprise property booking and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
