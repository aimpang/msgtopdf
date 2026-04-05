/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ParsedMessage } from "./msg-parser";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.5,
  },
  headerBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 14,
    marginBottom: 18,
  },
  subject: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    width: 52,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    flex: 1,
    color: "#111827",
  },
  body: {
    marginTop: 4,
  },
  paragraph: {
    marginBottom: 8,
  },
  attachmentSection: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  attachmentHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#0f172a",
  },
  attachmentItem: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 3,
  },
  inlineImageWrap: {
    marginTop: 10,
    marginBottom: 10,
  },
  inlineImage: {
    maxWidth: "100%",
    objectFit: "contain",
  },
  inlineImageCaption: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
});

function toDataUrl(content: Uint8Array, contentType: string): string {
  const buf = Buffer.from(content);
  return `data:${contentType};base64,${buf.toString("base64")}`;
}

export interface EmailPdfOptions {
  includeHeaders: boolean;
  embedAttachments: boolean;
}

export function EmailPdfDocument({
  message,
  options,
}: {
  message: ParsedMessage;
  options: EmailPdfOptions;
}) {
  const paragraphs = message.bodyText
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const imageAttachments = options.embedAttachments
    ? message.attachments.filter((a) => a.isImage && a.contentType)
    : [];
  const otherAttachments = message.attachments.filter(
    (a) => !imageAttachments.includes(a),
  );

  return (
    <Document
      title={message.subject || "Email"}
      author={message.from}
      creator="MSG to PDF"
      producer="MSG to PDF"
    >
      <Page size="A4" style={styles.page}>
        {options.includeHeaders && (
          <View style={styles.headerBlock}>
            <Text style={styles.subject}>
              {message.subject || "(no subject)"}
            </Text>
            {message.from ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>From</Text>
                <Text style={styles.metaValue}>{message.from}</Text>
              </View>
            ) : null}
            {message.to ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>To</Text>
                <Text style={styles.metaValue}>{message.to}</Text>
              </View>
            ) : null}
            {message.cc ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Cc</Text>
                <Text style={styles.metaValue}>{message.cc}</Text>
              </View>
            ) : null}
            {message.date ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{message.date}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.body}>
          {paragraphs.length === 0 ? (
            <Text style={styles.paragraph}>(empty message)</Text>
          ) : (
            paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))
          )}
        </View>

        {imageAttachments.length > 0 && (
          <View>
            {imageAttachments.map((att, i) => {
              try {
                const src = toDataUrl(att.content, att.contentType!);
                return (
                  <View key={`img-${i}`} style={styles.inlineImageWrap} wrap={false}>
                    <Image src={src} style={styles.inlineImage} />
                    <Text style={styles.inlineImageCaption}>{att.fileName}</Text>
                  </View>
                );
              } catch {
                return null;
              }
            })}
          </View>
        )}

        {otherAttachments.length > 0 && (
          <View style={styles.attachmentSection}>
            <Text style={styles.attachmentHeading}>
              Attachments ({otherAttachments.length})
            </Text>
            {otherAttachments.map((a, i) => (
              <Text key={i} style={styles.attachmentItem}>
                • {a.fileName}
                {a.content?.length
                  ? ` — ${formatBytes(a.content.length)}`
                  : ""}
              </Text>
            ))}
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} · MSG to PDF`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

function formatBytes(bytes: number) {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function renderEmailToPdfBuffer(
  message: ParsedMessage,
  options: EmailPdfOptions,
): Promise<Buffer> {
  return renderToBuffer(
    <EmailPdfDocument message={message} options={options} />,
  );
}
