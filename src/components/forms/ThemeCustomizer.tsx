"use client";

import type { IThemeColors } from "@/types/card.types";
import { DEFAULT_THEME } from "@/types/card.types";
import { Label } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";

const PRESETS: Array<{ name: string; theme: IThemeColors }> = [
  {
    name: "Rose",
    theme: {
      backgroundColor: "#FFF1F2",
      headerColor: "#BE123C",
      buttonColor: "#E11D48",
    },
  },
  {
    name: "Teal",
    theme: {
      backgroundColor: "#F0FDFA",
      headerColor: "#0F766E",
      buttonColor: "#0D9488",
    },
  },
  {
    name: "Indigo",
    theme: {
      backgroundColor: "#EEF2FF",
      headerColor: "#3730A3",
      buttonColor: "#4F46E5",
    },
  },
  {
    name: "Amber",
    theme: {
      backgroundColor: "#FFFBEB",
      headerColor: "#B45309",
      buttonColor: "#D97706",
    },
  },
];

export function ThemeCustomizer({
  theme,
  onChange,
}: {
  theme: IThemeColors;
  onChange: (theme: IThemeColors) => void;
}) {
  const value = theme || DEFAULT_THEME;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onChange(p.theme)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <span
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.theme.buttonColor }}
            />
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ColorField
          label="Background"
          value={value.backgroundColor}
          onChange={(backgroundColor) => onChange({ ...value, backgroundColor })}
        />
        <ColorField
          label="Header"
          value={value.headerColor}
          onChange={(headerColor) => onChange({ ...value, headerColor })}
        />
        <ColorField
          label="Buttons"
          value={value.buttonColor}
          onChange={(buttonColor) => onChange({ ...value, buttonColor })}
        />
      </div>

      <div
        className="flex items-center gap-2 rounded-xl border p-3"
        style={{ backgroundColor: value.backgroundColor }}
      >
        <div
          className="h-10 flex-1 rounded-lg"
          style={{ backgroundColor: value.headerColor }}
        />
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: value.buttonColor }}
        >
          Sample CTA
        </button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#E11D48"
        />
      </div>
    </div>
  );
}
