import axios from "axios";
import { create } from "zustand";
import { api } from "../api/client";
import type { Product, RequestState } from "../types/product";

interface ProductStore {
  products: RequestState<Product[]>;
  fetchProducts: (fail?: boolean) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: { status: "idle" },

  fetchProducts: async (fail = false) => {
    set({ products: { status: "loading" } });
    try {
      const response = await api.get<Product[]>("/products", {
        params: { fail },
      });
      set({ products: { status: "success", data: response.data } });
    } catch (err) {
      let message = "Неизвестная ошибка";
      if (axios.isAxiosError(err)) {
        message = err.response
          ? err.response.data?.detail ?? `Ошибка сервера (${err.response.status})`
          : "Не удалось связаться с сервером";
      }
      set({ products: { status: "error", error: message } });
    }
  },
}));
