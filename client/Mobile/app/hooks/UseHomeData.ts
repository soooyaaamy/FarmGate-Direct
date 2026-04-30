/**
 * useHomeData.ts — Full mock data + API-ready hook
 * Set EXPO_PUBLIC_API_URL in .env to connect a real backend.
 */
import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
export const LOW_STOCK_THRESHOLD = 10;

export interface StockProduct { id: string; name: string; stock: number; unit: string; image: string | null; emoji?: string }
export interface TopProduct { rank: number; id: string; name: string; sold: number; revenue: number; pct: number; image: string | null; emoji?: string }
export type OrderStatus = "New" | "Packing" | "Ready" | "Delivered" | "Cancelled";
export interface RecentOrder { id: string; customerName: string; initials: string; item: string; price: string; status: OrderStatus; avatarColor: string }
export interface OrderDetail extends RecentOrder { address: string; phone: string; orderDate: string; items: { name: string; qty: number; price: number }[]; timeline: { status: OrderStatus; time: string; done: boolean }[] }
export interface HourlySale { hour: string; amount: number }
export interface DailySale  { day:  string; amount: number }
export interface WeeklySale { week: string; amount: number }
export interface SalesData { weekly: DailySale[]; monthly: WeeklySale[]; weeklyTotals: Record<string, number>; monthlyTotals: Record<string, number>; drillDown: { byWeek: Record<string, DailySale[]>; byDay: Record<string, HourlySale[]> } }
export interface BadgeCounts { messages: number; orders: number; deliveries: number }
interface HomeData { sales: SalesData | null; topProducts: TopProduct[]; recentOrders: RecentOrder[]; lowStockProducts: StockProduct[]; totalOrders: number; badgeCounts: BadgeCounts; loading: boolean; error: string | null; refresh: () => void; updateProductStock: (id: string, newStock: number) => Promise<void>; getOrderById: (id: string) => OrderDetail | undefined }

const MOCK_SALES: SalesData = {
  weekly: [{ day: "Mon", amount: 1800 }, { day: "Tue", amount: 2600 }, { day: "Wed", amount: 2200 }, { day: "Thu", amount: 3400 }, { day: "Fri", amount: 2750 }, { day: "Sat", amount: 3900 }, { day: "Sun", amount: 2200 }],
  monthly: [{ week: "Wk 1", amount: 12500 }, { week: "Wk 2", amount: 15200 }, { week: "Wk 3", amount: 13800 }, { week: "Wk 4", amount: 18450 }],
  weeklyTotals: { current: 18850, previous: 16800 },
  monthlyTotals: { current: 59950, previous: 53200 },
  drillDown: {
    byWeek: {
      "Wk 1": [{ day: "Mon", amount: 1200 }, { day: "Tue", amount: 1900 }, { day: "Wed", amount: 1700 }, { day: "Thu", amount: 2100 }, { day: "Fri", amount: 1800 }, { day: "Sat", amount: 2500 }, { day: "Sun", amount: 1300 }],
      "Wk 2": [{ day: "Mon", amount: 1600 }, { day: "Tue", amount: 2200 }, { day: "Wed", amount: 2400 }, { day: "Thu", amount: 2700 }, { day: "Fri", amount: 2100 }, { day: "Sat", amount: 2900 }, { day: "Sun", amount: 1300 }],
      "Wk 3": [{ day: "Mon", amount: 1400 }, { day: "Tue", amount: 2100 }, { day: "Wed", amount: 1900 }, { day: "Thu", amount: 2600 }, { day: "Fri", amount: 2000 }, { day: "Sat", amount: 2600 }, { day: "Sun", amount: 1200 }],
      "Wk 4": [{ day: "Mon", amount: 1800 }, { day: "Tue", amount: 2600 }, { day: "Wed", amount: 2200 }, { day: "Thu", amount: 3400 }, { day: "Fri", amount: 2750 }, { day: "Sat", amount: 3900 }, { day: "Sun", amount: 1800 }],
    },
    byDay: {
      Mon: [{ hour: "6am", amount: 150 }, { hour: "7am", amount: 320 }, { hour: "8am", amount: 480 }, { hour: "9am", amount: 390 }, { hour: "10am", amount: 210 }, { hour: "11am", amount: 180 }, { hour: "12pm", amount: 90 }],
      Tue: [{ hour: "6am", amount: 200 }, { hour: "7am", amount: 450 }, { hour: "8am", amount: 620 }, { hour: "9am", amount: 530 }, { hour: "10am", amount: 380 }, { hour: "11am", amount: 270 }, { hour: "12pm", amount: 150 }],
      Sat: [{ hour: "6am", amount: 310 }, { hour: "7am", amount: 720 }, { hour: "8am", amount: 950 }, { hour: "9am", amount: 810 }, { hour: "10am", amount: 590 }, { hour: "11am", amount: 420 }, { hour: "12pm", amount: 100 }],
    },
  },
};

const COLORS = ["#166534","#1e40af","#92400e","#6b21a8","#be185d"];
const MOCK_ORDERS: OrderDetail[] = [
  { id: "ord-001", customerName: "Maria Santos", initials: "MS", item: "Organic Tomatoes · 5 kg", price: "₱350", status: "New", avatarColor: COLORS[0], address: "123 Mabini St, Hagonoy, Bulacan", phone: "09171234567", orderDate: "Apr 29, 2026 · 9:14 AM", items: [{ name: "Organic Tomatoes", qty: 5, price: 70 }], timeline: [{ status: "New", time: "9:14 AM", done: true }, { status: "Packing", time: "—", done: false }, { status: "Ready", time: "—", done: false }, { status: "Delivered", time: "—", done: false }] },
  { id: "ord-002", customerName: "Juan Dela Cruz", initials: "JD", item: "Eggplant · 3 kg", price: "₱180", status: "Packing", avatarColor: COLORS[1], address: "45 Rizal Ave, Calumpit, Bulacan", phone: "09281112233", orderDate: "Apr 29, 2026 · 8:50 AM", items: [{ name: "Eggplant", qty: 3, price: 60 }], timeline: [{ status: "New", time: "8:50 AM", done: true }, { status: "Packing", time: "9:05 AM", done: true }, { status: "Ready", time: "—", done: false }, { status: "Delivered", time: "—", done: false }] },
  { id: "ord-003", customerName: "Rosa Lim", initials: "RL", item: "Sweet Corn · 10 pcs", price: "₱120", status: "Delivered", avatarColor: COLORS[2], address: "88 Quezon Blvd, Malolos", phone: "09155678900", orderDate: "Apr 28, 2026 · 7:20 AM", items: [{ name: "Sweet Corn", qty: 10, price: 12 }], timeline: [{ status: "New", time: "7:20 AM", done: true }, { status: "Packing", time: "7:35 AM", done: true }, { status: "Ready", time: "7:55 AM", done: true }, { status: "Delivered", time: "9:10 AM", done: true }] },
  { id: "ord-004", customerName: "Carlo Reyes", initials: "CR", item: "Mango · 10 pcs", price: "₱200", status: "New", avatarColor: COLORS[3], address: "12 Del Pilar St, Bocaue", phone: "09209876543", orderDate: "Apr 29, 2026 · 10:02 AM", items: [{ name: "Carabao Mango", qty: 10, price: 20 }], timeline: [{ status: "New", time: "10:02 AM", done: true }, { status: "Packing", time: "—", done: false }, { status: "Ready", time: "—", done: false }, { status: "Delivered", time: "—", done: false }] },
  { id: "ord-005", customerName: "Ana Villanueva", initials: "AV", item: "Bitter Melon · 2 kg", price: "₱90", status: "Ready", avatarColor: COLORS[4], address: "66 Gomez St, Plaridel", phone: "09334455667", orderDate: "Apr 29, 2026 · 6:45 AM", items: [{ name: "Bitter Melon", qty: 2, price: 45 }], timeline: [{ status: "New", time: "6:45 AM", done: true }, { status: "Packing", time: "7:00 AM", done: true }, { status: "Ready", time: "7:20 AM", done: true }, { status: "Delivered", time: "—", done: false }] },
];

const MOCK_TOP: TopProduct[] = [
  { rank: 1, id: "p1", name: "Organic Tomatoes", sold: 47, revenue: 7050, pct: 90, image: null, emoji: "🍅" },
  { rank: 2, id: "p2", name: "Sweet Corn",        sold: 38, revenue: 4560, pct: 65, image: null, emoji: "🌽" },
  { rank: 3, id: "p3", name: "Eggplant",           sold: 22, revenue: 2640, pct: 38, image: null, emoji: "🍆" },
  { rank: 4, id: "p4", name: "Kangkong",            sold: 19, revenue: 1140, pct: 30, image: null, emoji: "🥬" },
  { rank: 5, id: "p5", name: "Watermelon",          sold: 17, revenue: 3400, pct: 27, image: null, emoji: "🍉" },
];
const MOCK_LOW: StockProduct[] = [
  { id: "p6", name: "Bitter Melon", stock: 2, unit: "kg", image: null, emoji: "🥒" },
  { id: "p4", name: "Kangkong", stock: 1, unit: "bundle", image: null, emoji: "🥬" },
  { id: "p7", name: "Okra", stock: 4, unit: "kg", image: null, emoji: "🌿" },
];

async function safeFetch(url: string, opts?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); } finally { clearTimeout(t); }
}

export function useHomeData(): HomeData {
  const [sales,   setSales]   = useState<SalesData | null>(null);
  const [top,     setTop]     = useState<TopProduct[]>([]);
  const [orders,  setOrders]  = useState<RecentOrder[]>([]);
  const [low,     setLow]     = useState<StockProduct[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [details] = useState<OrderDetail[]>(MOCK_ORDERS);

  const badges: BadgeCounts = {
    messages: 3,
    orders: orders.filter(o => o.status === "New").length,
    deliveries: orders.filter(o => o.status === "Ready").length,
  };

  const loadMock = useCallback(() => {
    setSales(MOCK_SALES); setTop(MOCK_TOP);
    setOrders(MOCK_ORDERS.map(({ id, customerName, initials, item, price, status, avatarColor }) => ({ id, customerName, initials, item, price, status, avatarColor })));
    setLow(MOCK_LOW); setTotal(121); setError(null);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    if (!API_BASE) { loadMock(); setLoading(false); return; }
    try {
      const [sR, tR, oR, lR] = await Promise.all([safeFetch(`${API_BASE}/dashboard/sales`), safeFetch(`${API_BASE}/products/top-selling?limit=5`), safeFetch(`${API_BASE}/orders/recent?limit=5`), safeFetch(`${API_BASE}/products/low-stock?threshold=${LOW_STOCK_THRESHOLD}`)]);
      if (!sR.ok || !tR.ok || !oR.ok || !lR.ok) throw new Error("API error");
      const [s, t, o, l] = await Promise.all([sR.json(), tR.json(), oR.json(), lR.json()]);
      setSales(s); setTop(t.products ?? []); setOrders(o.orders ?? []); setLow(l.products ?? []); setTotal(o.total ?? 0);
    } catch (e) {
      const isNet = e instanceof Error && (e.name === "AbortError" || e.message.includes("Network"));
      if (!isNet) setError(e instanceof Error ? e.message : "Error");
      loadMock();
    } finally { setLoading(false); }
  }, [loadMock]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateProductStock = useCallback(async (id: string, newStock: number) => {
    setLow(prev => newStock > LOW_STOCK_THRESHOLD ? prev.filter(p => p.id !== id) : prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    if (!API_BASE) return;
    try { await safeFetch(`${API_BASE}/products/${id}/stock`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock: newStock }) }); }
    catch { fetchAll(); }
  }, [fetchAll]);

  return { sales, topProducts: top, recentOrders: orders, lowStockProducts: low, totalOrders: total, badgeCounts: badges, loading, error, refresh: fetchAll, updateProductStock, getOrderById: (id) => details.find(o => o.id === id) };
}