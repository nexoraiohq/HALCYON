/** KSh price formatting shared by cards, admin list and pages. */
export const formatPrice = (n: number) => {
  if (n < 1_000_000) return `KSh ${Math.round(n).toLocaleString("en-US")}`;
  const s = (n / 1_000_000).toFixed(1);
  return `KSh ${s.endsWith(".0") ? s.slice(0, -2) : s}M`;
};
