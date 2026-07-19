// 4-digit team passcode helpers.
// The code is stored only as a SHA-256 hash so the plaintext never leaves
// the admin's browser and is never present in DB rows or API responses.

export const PASSCODE_LENGTH = 4;

export function normalizePasscode(input: string): string {
  return input.replace(/\D/g, '').slice(0, PASSCODE_LENGTH);
}

export function isValidPasscodeFormat(input: string): boolean {
  return new RegExp(`^\\d{${PASSCODE_LENGTH}}$`).test(input);
}

export async function hashPasscode(code: string): Promise<string> {
  const data = new TextEncoder().encode(`myj:${code}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPasscode(
  input: string,
  storedHash: string | null,
): Promise<boolean> {
  if (!storedHash) return false;
  if (!isValidPasscodeFormat(input)) return false;
  const h = await hashPasscode(input);
  // constant-ish time compare
  if (h.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}
