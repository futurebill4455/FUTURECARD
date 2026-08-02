import type { ICard } from "@/types/card.types";

function escape(value: string) {
  return value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export function generateVCard(card: ICard, displayName?: string) {
  const name = displayName || card.companyName;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(name)}`,
    `ORG:${escape(card.companyName)}`,
    `TITLE:${escape(card.jobTitle)}`,
  ];

  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.location?.address) {
    lines.push(`ADR;TYPE=WORK:;;${escape(card.location.address)};;;;`);
  }
  if (card.profileImage) lines.push(`PHOTO;VALUE=URI:${card.profileImage}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".vcf") ? filename : `${filename}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
