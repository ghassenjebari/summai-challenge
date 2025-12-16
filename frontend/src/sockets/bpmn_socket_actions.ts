import { socket, clientIdRef } from './bpmn_socket_handler';
import { UpdateDiagramSchema, LockElementSchema, UnlockElementSchema } from '../schemas/bpmn_socket_schemas';

export const handleInitDiagram = (modelerRef: any) => async (xml: string) => {
  console.log("Init diagram received");
  try {
    await modelerRef.current.importXML(xml);
    modelerRef.current.get("canvas").zoom("fit-viewport");
  } catch (err) {
    console.error("Failed to import XML:", err);
  }
};

export const handleUpdateDiagram = (modelerRef: any, applyingRemoteUpdateRef: any) => async (xml: string) => {
  console.log("Update diagram received");
  applyingRemoteUpdateRef.current = true;
  try {
    await modelerRef.current.importXML(xml);
    modelerRef.current.get("canvas").zoom("fit-viewport");
  } catch (err) {
    console.error("Failed to apply remote update:", err);
  } finally {
    applyingRemoteUpdateRef.current = false;
  }
};


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
