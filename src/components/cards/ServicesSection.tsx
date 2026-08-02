"use client";

import type { ICard, IServiceItem } from "@/types/card.types";
import { cn } from "@/lib/utils";

export function buildInquiryMessage(
  card: Pick<ICard, "companyName" | "username">,
  service: IServiceItem,
) {
  const lines = [
    `Hello ${card.companyName}!`,
    ``,
    `I am interested in your service/product:`,
    `• ${service.title}`,
  ];
  if (service.price) lines.push(`• Price: ${service.price}`);
  if (service.description) {
    lines.push(``, `Details: ${service.description.slice(0, 280)}`);
  }
  lines.push(``, `Please share more information. Thank you!`);
  return lines.join("\n");
}

export function openWhatsAppInquiry(
  whatsappNumber: string | undefined,
  message: string,
) {
  if (!whatsappNumber) {
    window.alert(
      "This business has not added a WhatsApp number yet. Please use Call or Email.",
    );
    return;
  }
  const phone = whatsappNumber.replace(/\D/g, "");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ServiceDetailModal({
  card,
  service,
  accent,
  onClose,
  onInquiry,
}: {
  card: ICard;
  service: IServiceItem;
  accent: string;
  onClose: () => void;
  onInquiry?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div
            className="flex h-36 items-center justify-center text-4xl font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {service.title.slice(0, 1)}
          </div>
        )}

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-bold">{service.title}</h3>
            {service.price ? (
              <span
                className="shrink-0 rounded-full px-3 py-1 text-sm font-extrabold text-white"
                style={{ backgroundColor: accent }}
              >
                {service.price}
              </span>
            ) : null}
          </div>
          {service.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {service.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No description added.</p>
          )}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98]"
            style={{ backgroundColor: accent }}
            onClick={() => {
              const msg = buildInquiryMessage(card, service);
              openWhatsAppInquiry(card.whatsappNumber, msg);
              onInquiry?.();
            }}
          >
            Inquiry Now on WhatsApp
          </button>
          <button
            type="button"
            className="w-full rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection({
  card,
  accent,
  onSelect,
  className,
}: {
  card: ICard;
  accent: string;
  onSelect: (service: IServiceItem) => void;
  className?: string;
}) {
  const services = card.services?.filter((s) => s.title.trim()) ?? [];
  if (!services.length) return null;

  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Services / Products</h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: accent }}
        >
          {services.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc)}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white/80 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            {svc.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={svc.image}
                alt=""
                className="h-28 w-full object-cover"
              />
            ) : (
              <div
                className="flex h-20 items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {svc.title.slice(0, 1)}
              </div>
            )}
            <div className="space-y-1 p-3">
              <div className="font-semibold leading-snug">{svc.title}</div>
              {svc.price ? (
                <div className="text-sm font-bold" style={{ color: accent }}>
                  {svc.price}
                </div>
              ) : null}
              {svc.description ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {svc.description}
                </p>
              ) : null}
              <span
                className="mt-1 inline-block text-[11px] font-bold uppercase tracking-wide"
                style={{ color: accent }}
              >
                View Service →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
