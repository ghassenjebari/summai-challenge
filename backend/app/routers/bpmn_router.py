import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from app.utils.bpmn_util import load_initial_bpmn_xml
from app.websockets.connection_manager import ConnectionManager

app = APIRouter(tags=["BPMN"])

bpmn_xml=load_initial_bpmn_xml()

manager = ConnectionManager()
connected_users = set()
locked_elements: dict[str, str] = {} 

@app.websocket("/ws/bpmn")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    global bpmn_xml,locked_elements 
    user_id = str(uuid.uuid4())
    connected_users.add(user_id)
    await websocket.send_text(json.dumps({"type": "initDiagram", "xml": bpmn_xml}))
    await websocket.send_text(json.dumps({"type": "assignUserId","userId": user_id}))
    await websocket.send_text(json.dumps({"type": "lockedElements","locks": locked_elements}))
    await manager.broadcast(json.dumps({"type": "users", "users": list(connected_users)}))
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type")
            if msg_type == "updateDiagram":
                xml = msg.get("xml")
                if xml:
                    bpmn_xml = xml
                    await manager.broadcast(data, sender=websocket)
            elif msg_type == "lockElement":
                element_id = msg.get("elementId")
                if element_id:
                    prev_locked = next((eid for eid, uid in locked_elements.items() if uid == user_id), None)
                    if prev_locked:
                        locked_elements.pop(prev_locked)
                    locked_elements[element_id] = user_id
                    await manager.broadcast(json.dumps({
                        "type": "lockedElements",
                        "locks": locked_elements
                    }))

            elif msg_type == "unlockElement":
                element_id = msg.get("elementId")
                if element_id and locked_elements.get(element_id) == user_id:
                    locked_elements.pop(element_id)
                    await manager.broadcast(json.dumps({
                        "type": "lockedElements",
                        "locks": locked_elements
                    }))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        connected_users.remove(user_id)
        locked_elements = {eid: uid for eid, uid in locked_elements.items() if uid != user_id}
        await manager.broadcast(json.dumps({"type": "users", "users": list(connected_users)}))
        await manager.broadcast(json.dumps({"type": "lockedElements", "locks": locked_elements}))
