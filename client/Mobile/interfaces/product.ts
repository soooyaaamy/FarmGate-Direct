/**
 * interfaces/product.ts
 *
 * Shared Product interface used across Buyer and Farmer modules.
 * All optional fields are marked with `?` so existing code that
 * doesn't supply them keeps compiling without changes.
 */
export interface Product {
  // ── Core ────────────────────────────────────────────────────────────────────
  id: string;
  name: string;
  price: string;          // e.g. "70.00"
  stock: string;          // e.g. "45 kg"
  farmName: string;
  image: any;             // require() or { uri: string }

  // ── Freshness ────────────────────────────────────────────────────────────────
  createdAt?: number;     // Unix ms timestamp
  freshness?: string;     // shelf-life in days, e.g. "3"

  // ── Pricing ──────────────────────────────────────────────────────────────────
  srp?: string;           // suggested retail price, e.g. "85.00"

  // ── Location & fulfilment ────────────────────────────────────────────────────
  distanceKm?: number;
  pickupAvailable?: boolean;

  // ── Sales & stock status ─────────────────────────────────────────────────────
  unitsSold?: number;
  isLowStock?: boolean;

  // ── Ratings (Req 4) ──────────────────────────────────────────────────────────
  rating?: number;        // 0–5
  reviewCount?: number;

  // ── Misc ─────────────────────────────────────────────────────────────────────
  farmerId?: string;
  description?: string;
  category?: string;
  status?: string;
}