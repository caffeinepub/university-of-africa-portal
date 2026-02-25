/**
 * Nigerian Naira currency formatter using Intl.NumberFormat
 * Accepts amount in kobo (smallest unit) or as a plain number/bigint
 * and returns formatted string like ₦150,000.00
 */
export function formatNaira(amount: number | bigint): string {
  const numericAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Format a raw kobo amount (bigint from backend) to Naira display string
 * Backend stores amounts as whole Naira (not kobo), so we display as-is
 */
export function formatNairaFromBackend(amount: bigint): string {
  return formatNaira(Number(amount));
}
