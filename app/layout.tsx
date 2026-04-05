import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://msgtopdf.tools";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "MSG to PDF — Convert Outlook .MSG Files Instantly",
  description:
    "Convert Outlook .MSG files to clean PDFs in seconds. No Outlook needed, no installs, no accounts. Free online tool.",
  applicationName: "MSG to PDF",
  authors: [{ name: "MSG to PDF" }],
  keywords: [
    "msg to pdf",
    "convert .msg file",
    "outlook msg converter",
    "open msg file without outlook",
    "email to pdf",
    "convert msg online",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MSG to PDF — Convert Outlook .MSG Files Instantly",
    description:
      "Convert Outlook .MSG files to clean PDFs in seconds. No Outlook needed, no installs, no accounts. Free online tool.",
    url: "/",
    type: "website",
    siteName: "MSG to PDF",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSG to PDF — Convert Outlook .MSG Files Instantly",
    description:
      "Convert Outlook .MSG files to clean PDFs in seconds. No Outlook needed, no installs, no accounts. Free online tool.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050a1c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
