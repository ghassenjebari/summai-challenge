import { socket, clientIdRef } from './bpmn_socket_handler';
import { UpdateDiagramSchema, LockElementSchema, UnlockElementSchema } from '../schemas/bpmn_socket_schemas';


export function sendDiagramUpdate(xml: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const message = UpdateDiagramSchema.parse({ type: "updateDiagram", xml });
  console.log("Sending diagram update:", message);
  socket.send(JSON.stringify(message));
}

export function lockElement(elementId: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN || !clientIdRef.current) return;
  const message = LockElementSchema.parse({ type: "lockElement", elementId, user: clientIdRef.current });
  console.log("Sending lockElement:", message);
  socket.send(JSON.stringify(message));
}

export function unlockElement(elementId: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const message = UnlockElementSchema.parse({ type: "unlockElement", elementId });
  console.log("Sending unlockElement:", message);
  socket.send(JSON.stringify(message));
}
