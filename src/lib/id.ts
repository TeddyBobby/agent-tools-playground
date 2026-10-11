// Generate a unique id that works in every deployment context.
//
// `crypto.randomUUID()` is only available in secure contexts (HTTPS or
// localhost). When the app is served over plain HTTP — a LAN IP during
// development, a bare-IP staging box, or a reverse proxy without TLS — the
// method is `undefined` and calling it throws
// `TypeError: crypto.randomUUID is not a function`, which crashes the import
// flow. The fallback below builds an RFC 4122 v4 UUID from
// `crypto.getRandomValues`, which MDN documents as the only Crypto member
// usable from an insecure context, so importing a trace never breaks.

export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // crypto.getRandomValues is available in insecure contexts too; only fall
  // back to Math.random when even that is missing (minimal globals in some
  // test runners / embedded webviews).
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set the version (4) and variant (RFC 4122) bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last resort: a Math.random-based v4-shaped id. Not cryptographically
  // strong, but unique enough for a client-side session label.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
