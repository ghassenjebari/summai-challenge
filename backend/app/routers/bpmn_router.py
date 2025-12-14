import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from app.utils.bpmn_util import load_initial_bpmn_xml
from app.websockets.connection_manager import ConnectionManager

app = APIRouter(tags=["BPMN"])

bpmn_xml=load_initial_bpmn_xml()

manager = ConnectionManager()
connected_users = set()

@app.websocket("/ws/bpmn")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    global bpmn_xml
    user_id = str(uuid.uuid4())
    connected_users.add(user_id)
    await websocket.send_text(json.dumps({"type": "initDiagram", "xml": bpmn_xml}))
    await manager.broadcast(json.dumps({"type": "users", "users": list(connected_users)}))
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type")
            xml = msg.get("xml")
            if msg_type == "updateDiagram" and xml:
                bpmn_xml = xml
                await manager.broadcast(data, sender=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        connected_users.remove(user_id)
        await manager.broadcast(json.dumps({"type": "users", "users": list(connected_users)}))
