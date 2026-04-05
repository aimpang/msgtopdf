import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSG to PDF — Convert Outlook .MSG files to PDF instantly",
  description:
    "A truly web-based converter for Outlook .MSG files. No Outlook, no installs. Clean PDFs in seconds.",
  applicationName: "MSG to PDF",
  authors: [{ name: "MSG to PDF" }],
  keywords: [
    "msg to pdf",
    "outlook msg converter",
    "email to pdf",
    "convert msg online",
  ],
  openGraph: {
    title: "MSG to PDF — Convert Outlook .MSG files to PDF instantly",
    description:
      "A truly web-based converter for Outlook .MSG files. No Outlook, no installs.",
    type: "website",
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
      </body>
    </html>
  );
}
