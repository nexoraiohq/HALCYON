/** KSh price formatting shared by cards, admin list and pages. */
export const formatPrice = (n: number) =>
  n >= 1_000_000
    ? `KSh ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    : `KSh ${Math.round(n).toLocaleString("en-US")}`;
