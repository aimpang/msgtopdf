import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConverterClient } from "./converter-client";

export const metadata: Metadata = {
  title: "Converter · MSG to PDF",
  description:
    "Convert MSG to PDF online for free. Drop your Outlook .MSG files and get clean PDFs in seconds — no install needed.",
  alternates: { canonical: "/convert" },
};

export default function ConvertPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <ConverterClient />
      <SiteFooter />
    </div>
  );
}
