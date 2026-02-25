import { Principal } from '@dfinity/principal';

/**
 * Formats a Principal to a truncated display string.
 * e.g. "xxxxx-xxxxx-xxxxx-xxxxx-cai" → "xxxxx-...-cai"
 */
export function formatPrincipal(principal: Principal | string): string {
  const str = typeof principal === 'string' ? principal : principal.toString();
  if (str.length <= 20) return str;
  const parts = str.split('-');
  if (parts.length <= 3) {
    // Fallback: show first 8 and last 8 chars
    return `${str.slice(0, 8)}...${str.slice(-8)}`;
  }
  // Show first 2 segments and last segment
  const first = parts.slice(0, 2).join('-');
  const last = parts[parts.length - 1];
  return `${first}-...-${last}`;
}
