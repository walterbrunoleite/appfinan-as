/**
 * Paleta categórica validada (CVD-safe) para gráficos e categorias.
 * Ordem fixa — nunca reordenar por rank; um novo item pega o próximo slot.
 * Validado com scripts/validate_palette.js (dataviz skill) contra o surface #15131a.
 */
export const CATEGORY_PALETTE = [
  { name: "azul", hex: "#3987e5" },
  { name: "esmeralda", hex: "#199e70" },
  { name: "âmbar", hex: "#c98500" },
  { name: "verde", hex: "#008300" },
  { name: "violeta", hex: "#9085e9" },
  { name: "vermelho", hex: "#e66767" },
  { name: "rosa", hex: "#d55181" },
  { name: "terracota", hex: "#d95926" },
] as const;

export function colorForIndex(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length].hex;
}

/** Status fixo — nunca usado para séries categóricas, sempre com ícone + label junto. */
export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
} as const;
