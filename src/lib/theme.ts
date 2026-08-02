import type { CSSProperties } from "react";
import type { ICard, IThemeColors } from "@/types/card.types";
import { DEFAULT_THEME } from "@/types/card.types";

export function resolveTheme(card?: Pick<ICard, "theme"> | null): IThemeColors {
  return {
    backgroundColor:
      card?.theme?.backgroundColor || DEFAULT_THEME.backgroundColor,
    headerColor: card?.theme?.headerColor || DEFAULT_THEME.headerColor,
    buttonColor: card?.theme?.buttonColor || DEFAULT_THEME.buttonColor,
  };
}

export function tintColor(hex: string, amount = 0.88): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "#FFF1F2";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function themeStyleVars(theme: IThemeColors): CSSProperties {
  return {
    ["--card-bg" as string]: theme.backgroundColor,
    ["--card-header" as string]: theme.headerColor,
    ["--card-btn" as string]: theme.buttonColor,
    ["--card-btn-soft" as string]: tintColor(theme.buttonColor, 0.85),
    backgroundColor: theme.backgroundColor,
  };
}
