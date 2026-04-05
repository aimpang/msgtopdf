import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ConverterClient } from "./converter-client";

export const metadata: Metadata = {
  title: "Converter · MSG to PDF",
  description:
    "Drop your Outlook .MSG files and download clean PDFs instantly. No Outlook needed, works on any device.",
  alternates: { canonical: "/convert" },
};

export default function ConvertPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <ConverterClient />
    </div>
  );
}
