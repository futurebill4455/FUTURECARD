"use client";

import type { IPaymentInfo } from "@/types/card.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { MediaUpload } from "@/components/forms/ImageUpload";

export function PaymentDetailsForm({
  value,
  onChange,
}: {
  value: IPaymentInfo;
  onChange: (next: IPaymentInfo) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Shown when visitors tap <strong>Pay Now</strong> on your public card.
        Upload a UPI QR and add your UPI ID / mobile for easy copy.
      </p>

      <MediaUpload
        label="Payment QR code"
        kind="image"
        value={value.qrCodeImage || ""}
        onChange={(url) => onChange({ ...value, qrCodeImage: url })}
        hint="Upload your UPI / payment QR code image (PNG or JPG)."
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="upiId">UPI ID</Label>
          <Input
            id="upiId"
            placeholder="business@upi"
            value={value.upiId || ""}
            onChange={(e) => onChange({ ...value, upiId: e.target.value })}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upiMobile">UPI mobile number</Label>
          <Input
            id="upiMobile"
            placeholder="+91 98765 43210"
            value={value.upiMobile || ""}
            onChange={(e) => onChange({ ...value, upiMobile: e.target.value })}
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      </div>
    </div>
  );
}
