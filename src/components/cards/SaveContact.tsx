"use client";

import type { ICard } from "@/types/card.types";
import { Button } from "@/components/ui/button";
import { downloadVCard, generateVCard } from "@/lib/vcard-generator";

export function SaveContact({
  card,
  onSave,
}: {
  card: ICard;
  onSave?: () => void;
}) {
  return (
    <Button
      className="bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 hover:brightness-110"
      onClick={() => {
        downloadVCard(card.username, generateVCard(card));
        onSave?.();
      }}
    >
      Save Contact
    </Button>
  );
}
