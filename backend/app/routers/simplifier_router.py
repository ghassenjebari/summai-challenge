from fastapi import APIRouter

app = APIRouter(tags=["Simplify"])

@app.get("/simplify")
async def simplify():
    return {"message": "Hello from simplify router"}