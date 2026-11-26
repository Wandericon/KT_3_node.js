import { useEffect } from "react";
import { useProductStore } from "./store/productStore";

export default function App() {
  const products = useProductStore((s) => s.products);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container">
      <h1>Каталог товаров</h1>

      <div className="buttons">
        <button onClick={() => fetchProducts()}>Обновить</button>
        <button onClick={() => fetchProducts(true)}>Вызвать ошибку</button>
      </div>

      {products.status === "idle" && <p>Нажмите «Обновить», чтобы загрузить товары</p>}

      {products.status === "loading" && (
        <div className="loader">
          <div className="spinner" />
          <span>Загрузка...</span>
        </div>
      )}

      {products.status === "error" && (
        <div className="error">
          <b>Ошибка:</b> {products.error}
        </div>
      )}

      {products.status === "success" && (
        <div className="grid">
          {products.data.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p className="price">{p.price.toLocaleString("ru-RU")} ₽</p>
              <p className="category">{p.category}</p>
              {p.description && <p>{p.description}</p>}
              <p className={p.in_stock ? "in-stock" : "out-of-stock"}>
                {p.in_stock ? "В наличии" : "Нет в наличии"}
              </p>
              <small>
                Добавлен: {new Date(p.created_at).toLocaleDateString("ru-RU")}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
