from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routers import simplifier_router




@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App starting...")
    yield
    print("App shutting down...")


app = FastAPI(lifespan=lifespan, root_path="/api")


app.include_router(simplifier_router.app)


