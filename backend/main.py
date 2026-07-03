from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.models_loader import load_all_models
from backend.routers import predict

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once at startup — load all 5 models into memory
    load_all_models()
    yield
    # Runs at shutdown (nothing to clean up)

app = FastAPI(
    title="HealthTwin AI",
    description="Personalized Predictive Health System using Digital Twin",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
from backend.routers import simulate
app.include_router(simulate.router)

@app.get("/")
def root():
    return {
        "message": "HealthTwin AI API is running",
        "models_loaded": 5,
        "docs": "/docs"
    }
