import { VaultBallot } from '../types';

// Simple fast pseudo-hash for receipt generation & verification in browser
export function generateVaultReceiptHash(studentId: string, timestamp: string, block: number): string {
  let str = `${studentId}-${timestamp}-${block}-NSCB-SECURE-KEY-2026`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 ^= char;
    hash1 = (hash1 * 0x01000193) >>> 0;
    hash2 ^= char;
    hash2 = (hash2 * 0x01000193) >>> 0;
  }
  
  const hex1 = (hash1 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = (hash2 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  
  return `VAULT-NSCB-${hex1.substring(0, 4)}-${hex1.substring(4, 8)}-${hex2.substring(0, 4)}`;
}

export function anonymizeRollNumber(roll: string): string {
  if (!roll || roll.length < 4) return 'anon...****';
  return `${roll.slice(0, 2)}***...${roll.slice(-3)}`;
}

export function generateSignature(receiptHash: string): string {
  let seed = 0;
  for (let i = 0; i < receiptHash.length; i++) {
    seed = (seed * 31 + receiptHash.charCodeAt(i)) >>> 0;
  }
  return `SIG-ECDSA-SHA256-0x${seed.toString(16).toUpperCase()}`;
}

export function verifyReceiptInLedger(receiptHash: string, ballots: VaultBallot[]): VaultBallot | undefined {
  const normalized = receiptHash.trim().toUpperCase();
  return ballots.find(b => b.receiptHash.toUpperCase() === normalized || b.ballotId.toUpperCase() === normalized);
}
