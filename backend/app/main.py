import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.action_items import router as action_items_router
from app.routes.chapters import router as chapters_router
from app.routes.meetings import router as meetings_router

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Fireflies Clone API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings_router)
app.include_router(action_items_router)
app.include_router(chapters_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"status": "ok", "service": "fireflies-clone-api"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
