"use client";

import type { IThemeColors } from "@/types/card.types";
import { DEFAULT_THEME } from "@/types/card.types";
import { Label } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";

const PRESETS: Array<{ name: string; theme: IThemeColors }> = [
  {
    name: "Neon Void",
    theme: {
      backgroundColor: "#07131a",
      headerColor: "#042f2e",
      buttonColor: "#2dd4bf",
    },
  },
  {
    name: "Cyan Pulse",
    theme: {
      backgroundColor: "#061525",
      headerColor: "#0c4a6e",
      buttonColor: "#38bdf8",
    },
  },
  {
    name: "Emerald Grid",
    theme: {
      backgroundColor: "#04140f",
      headerColor: "#064e3b",
      buttonColor: "#34d399",
    },
  },
  {
    name: "Classic Rose",
    theme: {
      backgroundColor: "#FFF1F2",
      headerColor: "#BE123C",
      buttonColor: "#E11D48",
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
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold transition hover:border-teal-400/40 hover:bg-teal-400/10"
          >
            <span
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
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
          label="Accent"
          value={value.buttonColor}
          onChange={(buttonColor) => onChange({ ...value, buttonColor })}
        />
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
          className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
