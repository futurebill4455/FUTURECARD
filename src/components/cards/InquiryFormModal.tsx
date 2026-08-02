"use client";

import { FormEvent, useState } from "react";
import type { ICard } from "@/types/card.types";
import { openWhatsAppInquiry } from "./ServicesSection";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/misc";

export function InquiryFormModal({
  card,
  accent,
  onClose,
  onSubmit,
}: {
  card: ICard;
  accent: string;
  onClose: () => void;
  onSubmit?: () => void;
}) {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please enter your name and message.");
      return;
    }
    const phone = card.whatsappNumber || card.phone;
    const lines = [
      `Hello ${card.companyName}!`,
      ``,
      `New inquiry from your digital card:`,
      `• Name: ${name.trim()}`,
      place.trim() ? `• Place: ${place.trim()}` : null,
      ``,
      `Message:`,
      message.trim(),
    ].filter(Boolean) as string[];

    openWhatsAppInquiry(phone, lines.join("\n"));
    onSubmit?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 text-white" style={{ backgroundColor: accent }}>
          <h3 className="font-display text-xl font-extrabold">Inquiry Form</h3>
          <p className="text-sm opacity-90">
            Send a message to {card.companyName} on WhatsApp
          </p>
        </div>
        <form className="space-y-3 p-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="inq-name">Name *</Label>
            <Input
              id="inq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inq-place">Place</Label>
            <Input
              id="inq-place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="City / area"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inq-msg">Message *</Label>
            <Textarea
              id="inq-msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              required
            />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-extrabold text-white shadow-md"
            style={{ backgroundColor: accent }}
          >
            Send via WhatsApp
          </button>
          <button
            type="button"
            className="w-full rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
