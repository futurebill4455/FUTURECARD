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
      className="bg-teal-700 hover:bg-teal-800"
      onClick={() => {
        downloadVCard(card.username, generateVCard(card));
        onSave?.();
      }}
    >
      Save Contact
    </Button>
  );
}
