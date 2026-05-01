export const APPROVAL_LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: "Nível 1 — até R$ 1.500,00",
  2: "Nível 2 — R$ 1.500,01 a R$ 3.500,00",
  3: "Nível 3 — acima de R$ 3.500,00",
};

export const APPROVAL_LEVEL_SHORT_LABELS: Record<1 | 2 | 3, string> = {
  1: "Nível 1 (até R$ 1.500)",
  2: "Nível 2 (R$ 1.500–3.500)",
  3: "Nível 3 (acima R$ 3.500)",
};

export function getApprovalLevelForValue(totalValue: number): 1 | 2 | 3 {
  if (totalValue <= 1500) return 1;
  if (totalValue <= 3500) return 2;
  return 3;
}
