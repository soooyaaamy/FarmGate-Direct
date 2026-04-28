type Category = "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  stock: number;
  maxStock: number;
  image: any;
  description?: string;
  freshness?: string;
  status?: string;
}

// ── Shared in-memory store ────────────────────────────────────────────────────
export const productStore: Product[] = [
  { id: "1", name: "Tomatoes", category: "Vegetables", price: 80,  unit: "kg", stock: 20, maxStock: 25,  image: require("../assets/images/tomato.jpg") },
  { id: "2", name: "Eggplant", category: "Vegetables", price: 60,  unit: "kg", stock: 3,  maxStock: 20,  image: require("../assets/images/eggplant.jpg") },
  { id: "3", name: "Banana",   category: "Fruits",     price: 55,  unit: "kg", stock: 2,  maxStock: 15,  image: require("../assets/images/banana.jpg") },
  { id: "4", name: "Mango",    category: "Fruits",     price: 120, unit: "kg", stock: 10, maxStock: 20,  image: require("../assets/images/mango.jpg") },
];