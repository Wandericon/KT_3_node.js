import asyncio
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Products API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Product(BaseModel):
    id: int
    name: str
    price: float
    category: str
    in_stock: bool
    description: str | None = None
    created_at: datetime


products_db = [
    Product(id=1, name="Ноутбук Lenovo IdeaPad", price=54990.0, category="electronics",
            in_stock=True, description="15.6 дюймов, 16 ГБ ОЗУ", created_at=datetime(2026, 9, 1, 10, 0)),
    Product(id=2, name="Футболка хлопковая", price=1290.5, category="clothing",
            in_stock=True, description=None, created_at=datetime(2026, 9, 3, 12, 30)),
    Product(id=3, name="Кофе в зернах 1 кг", price=1450.0, category="food",
            in_stock=False, description="Арабика, средняя обжарка", created_at=datetime(2026, 9, 5, 9, 15)),
    Product(id=4, name="Наушники Sony WH-1000XM5", price=29990.0, category="electronics",
            in_stock=True, description="Беспроводные, шумоподавление", created_at=datetime(2026, 9, 10, 18, 45)),
]


@app.get("/products", response_model=list[Product])
async def get_products(fail: bool = False):
    await asyncio.sleep(1.5)
    if fail:
        raise HTTPException(status_code=500, detail="Сервер не смог получить список товаров")
    return products_db
