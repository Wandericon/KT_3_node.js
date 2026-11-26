export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  in_stock: boolean;
  description: string | null;
  created_at: string;
}

export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };
