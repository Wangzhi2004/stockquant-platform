import asyncio
import json
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.data.akshare_client import AKShareClient

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "indices": set(),
            "hot_stocks": set(),
            "portfolio": set(),
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        self.active_connections[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        disconnected = set()
        for conn in self.active_connections[channel]:
            try:
                await conn.send_json(message)
            except Exception:
                disconnected.add(conn)
        for conn in disconnected:
            self.active_connections[channel].discard(conn)


manager = ConnectionManager()


@router.websocket("/ws/indices")
async def indices_websocket(websocket: WebSocket):
    await manager.connect(websocket, "indices")
    client = AKShareClient()
    try:
        while True:
            try:
                indices = [
                    {"code": "000001", "name": "上证指数"},
                    {"code": "399001", "name": "深证成指"},
                    {"code": "399006", "name": "创业板指"},
                    {"code": "000688", "name": "科创50"},
                    {"code": "000300", "name": "沪深300"},
                ]
                result = []
                for idx in indices:
                    try:
                        quote = client.get_index_quote(idx["code"])
                        result.append({
                            "code": idx["code"],
                            "name": idx["name"],
                            "price": float(quote["price"]),
                            "change": float(quote["change"]),
                            "change_pct": float(quote["change_pct"]),
                        })
                    except Exception:
                        continue
                await manager.broadcast("indices", {
                    "type": "indices_update",
                    "data": result,
                    "timestamp": asyncio.get_event_loop().time(),
                })
            except Exception as e:
                await manager.broadcast("indices", {"type": "error", "message": str(e)})
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "indices")


@router.websocket("/ws/hot-stocks")
async def hot_stocks_websocket(websocket: WebSocket):
    await manager.connect(websocket, "hot_stocks")
    client = AKShareClient()
    try:
        while True:
            try:
                df = client.get_stock_list()
                hot = []
                for _, row in df.nlargest(20, "涨跌幅").iterrows():
                    hot.append({
                        "code": str(row.get("代码", "")),
                        "name": str(row.get("名称", "")),
                        "price": float(row.get("最新价", 0)),
                        "change_pct": float(row.get("涨跌幅", 0)),
                        "volume": int(row.get("成交量", 0)),
                    })
                await manager.broadcast("hot_stocks", {
                    "type": "hot_stocks_update",
                    "data": hot,
                    "timestamp": asyncio.get_event_loop().time(),
                })
            except Exception as e:
                await manager.broadcast("hot_stocks", {"type": "error", "message": str(e)})
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "hot_stocks")
