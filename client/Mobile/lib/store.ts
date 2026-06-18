import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Product type: new farmer-management fields added ──────────────────────
// (Add these fields to the existing Product type in lib/store.ts)

export type ProductStatus = "Available" | "Out of Stock" | "Hidden";
export type ProductCategory = "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice" | string;

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  maxStock: number;        // NEW — used for the stock progress bar on farmer side
  sold: number;
  rate: number;
  reviewCount: number;
  farmName: string;
  farmerId: string;
  category: ProductCategory;
  image: any;
  createdAt: number;
  freshness: string;
  status: ProductStatus;   // NEW — farmer-controlled visibility/availability
  description: string;     // NEW — shown on buyer product-detail page
};

export type CartProductLine = {
  id: string;       // product id
  name: string;
  price: number;
  unit: string;
  image: any;
  quantity: number;
  isFresh: boolean;
};

export type CartFarmGroup = {
  farmerId: string;
  farmName: string;
  products: CartProductLine[];
};

export type Review = {
  id: string;
  productId: string;
  orderId: string;
  productRating: number;
  farmerRating: number;
  deliveryRating: number;
  text: string;
  photos: string[];
  createdAt: number;
};

export type OrderItem = {
  productId: string;
  productName: string;
  farmerId: string;
  farmName: string;
  image: any;
  price: number;
  quantity: number;
  reviewed: boolean;
};

export type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  delivery: "pickup" | "delivery";
  payment: "qr" | "cod";
  subTotal: number;
  deliveryFee: number;
  total: number;
  createdAt: number;
};

// ─── Storage keys ───────────────────────────────────────────────────────────

const KEYS = {
  PRODUCTS: "store:products",
  CART: "store:cart",
  ORDERS: "store:orders",
  REVIEWS: "store:reviews",
};


// ─── Seed data: backfilled with the three new fields ────────────────────────
// (Replace the existing SEED_PRODUCTS array with this version — same products,
// same ids, just three extra fields per entry so existing buyer-side reads
// keep working unchanged.)

const SEED_PRODUCTS: Product[] = [
  { id: "1",  name: "Fresh Farm Tomatoes", price: 120, unit: "kg", stock: 45, maxStock: 60,  sold: 32, rate: 4.8, reviewCount: 32, farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/tomato.jpg"),     createdAt: Date.now() - 86400000,  freshness: "3",  status: "Available", description: "Hand-picked vine-ripened tomatoes, harvested fresh." },
  { id: "2",  name: "Fresh Eggplant",      price: 80,  unit: "kg", stock: 32, maxStock: 50,  sold: 18, rate: 4.6, reviewCount: 18, farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/eggplant.jpg"),   createdAt: Date.now() - 518400000, freshness: "5",  status: "Available", description: "Glossy, firm eggplants, great for grilling or stews." },
  { id: "3",  name: "Fresh Farm Eggs",     price: 10,  unit: "pc", stock: 250,maxStock: 300, sold: 88, rate: 4.9, reviewCount: 88, farmName: "Golden Poultry Farm", farmerId: "f2", category: "Egg & Poultry", image: require("@/assets/images/egg.jpg"),        createdAt: Date.now() - 43200000,  freshness: "14", status: "Available", description: "Farm-fresh eggs collected daily from free-range hens." },
  { id: "4",  name: "Premium White Rice",  price: 200, unit: "kg", stock: 20, maxStock: 100, sold: 21, rate: 4.5, reviewCount: 21, farmName: "Bulacan Organic Farm",farmerId: "f3", category: "Rice",          image: require("@/assets/images/rice.jpg"),       createdAt: Date.now() - 864000000, freshness: "7",  status: "Available", description: "Premium milled white rice, sourced from local paddies." },
  { id: "5",  name: "Organic Brown Rice",  price: 60,  unit: "kg", stock: 50, maxStock: 100, sold: 15, rate: 4.3, reviewCount: 15, farmName: "Bulacan Organic Farm",farmerId: "f3", category: "Rice",          image: require("@/assets/images/rice.jpg"),       createdAt: Date.now() - 518400000, freshness: "5",  status: "Available", description: "Unpolished organic brown rice, rich in fiber." },
  { id: "6",  name: "Native Egg",          price: 15,  unit: "pc", stock: 6,  maxStock: 100, sold: 9,  rate: 4.7, reviewCount: 9,  farmName: "Golden Poultry Farm", farmerId: "f2", category: "Egg & Poultry", image: require("@/assets/images/egg.jpg"),        createdAt: Date.now() - 21600000,  freshness: "14", status: "Available", description: "Native free-range eggs with deep orange yolks." },
  { id: "7",  name: "Fresh Pumpkin",       price: 60,  unit: "kg", stock: 50, maxStock: 60,  sold: 11, rate: 4.4, reviewCount: 11, farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/pumpkin.jpg"),    createdAt: Date.now() - 3600000,   freshness: "4",  status: "Available", description: "Sweet, dense pumpkin perfect for soups and pies." },
  { id: "8",  name: "Fresh Banana",        price: 80,  unit: "kg", stock: 22, maxStock: 40,  sold: 54, rate: 4.6, reviewCount: 54, farmName: "Golden Orchard Farm", farmerId: "f4", category: "Fruits",         image: require("@/assets/images/banana.jpg"),     createdAt: Date.now() - 86400000,  freshness: "4",  status: "Available", description: "Sweet, ripe bananas picked at peak ripeness." },
  { id: "9",  name: "Fresh Orange",        price: 60,  unit: "kg", stock: 50, maxStock: 70,  sold: 21, rate: 4.3, reviewCount: 21, farmName: "Golden Orchard Farm", farmerId: "f4", category: "Fruits",         image: require("@/assets/images/orange.jpg"),     createdAt: Date.now() - 864000000, freshness: "7",  status: "Available", description: "Juicy oranges, great for fresh juice or snacking." },
  { id: "10", name: "Native Okra",         price: 45,  unit: "kg", stock: 4,  maxStock: 30,  sold: 5,  rate: 4.0, reviewCount: 5,  farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/okra.jpg"),       createdAt: Date.now() - 259200000, freshness: "2",  status: "Available", description: "Tender okra pods, locally grown." },
  { id: "11", name: "Cherry Tomatoes",     price: 85,  unit: "kg", stock: 20, maxStock: 40,  sold: 27, rate: 4.6, reviewCount: 27, farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/tomato.jpg"),     createdAt: Date.now() - 3600000,   freshness: "3",  status: "Available", description: "Sweet bite-sized cherry tomatoes, great for salads." },
  { id: "12", name: "Long Eggplant",       price: 70,  unit: "kg", stock: 30, maxStock: 50,  sold: 13, rate: 4.1, reviewCount: 13, farmName: "Green Valley Farm",   farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/eggplant.jpg"),   createdAt: Date.now() - 518400000, freshness: "3",  status: "Available", description: "Long, slender eggplants with a mild, sweet flavor." },
  { id: "13", name: "Fresh Mango",         price: 60,  unit: "kg", stock: 50, maxStock: 70,  sold: 18, rate: 4.5, reviewCount: 18, farmName: "Golden Orchard Farm", farmerId: "f4", category: "Fruits",         image: require("@/assets/images/mango.jpg"),      createdAt: Date.now() - 86400000,  freshness: "5",  status: "Available", description: "Sweet carabao mangoes, a Philippine favorite." },
  { id: "14", name: "Native Green Grapes", price: 200, unit: "kg", stock: 22, maxStock: 30,  sold: 9,  rate: 4.2, reviewCount: 9,  farmName: "Golden Orchard Farm", farmerId: "f4", category: "Fruits",         image: require("@/assets/images/greengrape.jpg"), createdAt: Date.now() - 604800000, freshness: "6",  status: "Available", description: "Crisp, tart green grapes, sold in small batches." },
];

// ─── Internal helpers ───────────────────────────────────────────────────────

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const isFresh = (p: { createdAt?: number; freshness?: string }): boolean => {
  if (!p.createdAt || !p.freshness) return false;
  return Date.now() - p.createdAt < parseInt(p.freshness) * 86_400_000;
};

// ─── Products ───────────────────────────────────────────────────────────────

// ─── New functions: append these to lib/store.ts ─────────────────────────────
// (getProducts, getProductById, applyPurchase, etc. all stay exactly as before)

export async function createProduct(
  farmerId: string,
  farmName: string,
  data: Omit<Product, "id" | "farmerId" | "farmName" | "sold" | "rate" | "reviewCount" | "createdAt">
): Promise<Product> {
  const products = await getProducts();
  const newProduct: Product = {
    ...data,
    id: Date.now().toString(),
    farmerId,
    farmName,
    sold: 0,
    rate: 0,
    reviewCount: 0,
    createdAt: Date.now(),
  };
  const updated = [...products, newProduct];
  await writeJSON(KEYS.PRODUCTS, updated);
  return newProduct;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const products = await getProducts();
  const updated = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
  await writeJSON(KEYS.PRODUCTS, updated);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  const updated = products.filter((p) => p.id !== id);
  await writeJSON(KEYS.PRODUCTS, updated);
  // Reviews tied to a deleted product are intentionally left in place —
  // the farmer-side delete modal warns about this, but actual review
  // cleanup is a separate decision (e.g. soft-delete) you may want later.
}

export async function restockProduct(id: string, newStock: number): Promise<void> {
  await updateProduct(id, { stock: newStock });
}

export async function getProductsByFarmer(farmerId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.farmerId === farmerId);
}

// ─── getProducts() merge logic needs to widen slightly ──────────────────────
// Your existing getProducts() merges stored numeric fields back onto the seed
// images. Since farmers can now ADD entirely new products (not in SEED_PRODUCTS),
// the merge must also include products that only exist in storage. Replace the
// existing getProducts() with this version:

export async function getProducts(): Promise<Product[]> {
  const existing = await AsyncStorage.getItem(KEYS.PRODUCTS);
  if (!existing) {
    await writeJSON(KEYS.PRODUCTS, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }

  const stored: Product[] = JSON.parse(existing);

  // Seed products: keep the require()'d image, overlay live fields from storage
  const merged = SEED_PRODUCTS.map((seed) => {
    const match = stored.find((s) => s.id === seed.id);
    return match ? { ...seed, ...match, image: seed.image } : seed;
  });

  // Farmer-created products (ids not in SEED_PRODUCTS) — these only exist in
  // storage, so their image is whatever was stored (a { uri } object from
  // the image picker, presumably — require() sources can't round-trip JSON).
  const seedIds = new Set(SEED_PRODUCTS.map((s) => s.id));
  const farmerCreated = stored.filter((s) => !seedIds.has(s.id));

  return [...merged, ...farmerCreated];
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

// Decrease stock + increase sold for purchased items (called on checkout)
export async function applyPurchase(items: { productId: string; quantity: number }[]) {
  const products = await getProducts();
  const updated = products.map((p) => {
    const purchased = items.find((i) => i.productId === p.id);
    if (!purchased) return p;
    return {
      ...p,
      stock: Math.max(0, p.stock - purchased.quantity),
      sold: p.sold + purchased.quantity,
    };
  });
  await writeJSON(KEYS.PRODUCTS, updated);
}

// Recompute a product's rate/reviewCount after a new review is added
async function bumpProductRating(productId: string, newRating: number) {
  const products = await getProducts();
  const updated = products.map((p) => {
    if (p.id !== productId) return p;
    const newCount = p.reviewCount + 1;
    const newAvg = (p.rate * p.reviewCount + newRating) / newCount;
    return { ...p, rate: Math.round(newAvg * 10) / 10, reviewCount: newCount };
  });
  await writeJSON(KEYS.PRODUCTS, updated);
}

// ─── Cart ───────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartFarmGroup[]> {
  return readJSON<CartFarmGroup[]>(KEYS.CART, []);
}

async function saveCart(cart: CartFarmGroup[]) {
  await writeJSON(KEYS.CART, cart);
}

export async function addToCart(product: Product, quantity: number) {
  const cart = await getCart();
  const farmGroup = cart.find((f) => f.farmerId === product.farmerId);
  const line: CartProductLine = {
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.image,
    quantity,
    isFresh: isFresh(product),
  };

  if (!farmGroup) {
    cart.push({ farmerId: product.farmerId, farmName: product.farmName, products: [line] });
  } else {
    const existingLine = farmGroup.products.find((p) => p.id === product.id);
    if (existingLine) {
      existingLine.quantity += quantity;
    } else {
      farmGroup.products.push(line);
    }
  }

  await saveCart(cart);
  return cart;
}

export async function updateCartQty(farmerId: string, productId: string, quantity: number) {
  const cart = await getCart();
  const updated = cart
    .map((f) =>
      f.farmerId === farmerId
        ? { ...f, products: f.products.map((p) => (p.id === productId ? { ...p, quantity } : p)) }
        : f
    )
    .filter((f) => f.products.length > 0);
  await saveCart(updated);
  return updated;
}

export async function removeFromCart(farmerId: string, productId: string) {
  const cart = await getCart();
  const updated = cart
    .map((f) => (f.farmerId === farmerId ? { ...f, products: f.products.filter((p) => p.id !== productId) } : f))
    .filter((f) => f.products.length > 0);
  await saveCart(updated);
  return updated;
}

export async function clearCartItems(productIds: Set<string>) {
  const cart = await getCart();
  const updated = cart
    .map((f) => ({ ...f, products: f.products.filter((p) => !productIds.has(p.id)) }))
    .filter((f) => f.products.length > 0);
  await saveCart(updated);
  return updated;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return readJSON<Order[]>(KEYS.ORDERS, []);
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const orders = await getOrders();
  const newOrder: Order = { ...order, id: `ORD-${Date.now()}`, createdAt: Date.now() };
  orders.unshift(newOrder);
  await writeJSON(KEYS.ORDERS, orders);

  // Apply stock/sold updates immediately on order creation
  await applyPurchase(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));

  return newOrder;
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === orderId);
}

async function markOrderItemReviewed(orderId: string, productId: string) {
  const orders = await getOrders();
  const updated = orders.map((o) =>
    o.id === orderId
      ? { ...o, items: o.items.map((i) => (i.productId === productId ? { ...i, reviewed: true } : i)) }
      : o
  );
  await writeJSON(KEYS.ORDERS, updated);
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const all = await readJSON<Review[]>(KEYS.REVIEWS, []);
  return all.filter((r) => r.productId === productId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function submitReview(review: Omit<Review, "id" | "createdAt">) {
  const all = await readJSON<Review[]>(KEYS.REVIEWS, []);
  const newReview: Review = { ...review, id: `REV-${Date.now()}-${review.productId}`, createdAt: Date.now() };
  all.push(newReview);
  await writeJSON(KEYS.REVIEWS, all);

  await bumpProductRating(review.productId, review.productRating);
  await markOrderItemReviewed(review.orderId, review.productId);

  return newReview;
}
