import { BpmnMessageSchema, UpdateDiagramSchema } from "../schemas/bpmnSchemas";

let socket: WebSocket | null = null;

type InitHandler = (xml: string) => void;
type UsersHandler = (users: string[]) => void;

let onInitDiagram: InitHandler | null = null;
let onUpdateDiagram: InitHandler | null = null;
let onUsersUpdate: UsersHandler | null = null;

export function connectBpmnSocket(
  url: string,
  handlers?: {
    onInitDiagram?: InitHandler;
    onUpdateDiagram?: InitHandler;
    onUsersUpdate?: UsersHandler;
  }
) {
  socket = new WebSocket(url);

  if (handlers?.onInitDiagram) onInitDiagram = handlers.onInitDiagram;
  if (handlers?.onUpdateDiagram) onUpdateDiagram = handlers.onUpdateDiagram;
  if (handlers?.onUsersUpdate) onUsersUpdate = handlers.onUsersUpdate;

  socket.onopen = () => console.log("BPMN WebSocket connected");

  socket.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);
      const message = BpmnMessageSchema.safeParse(raw);
      if (message.success) {
        if (message.data.type === "initDiagram") {
          onInitDiagram?.(message.data.xml);
        } else if (message.data.type === "updateDiagram") {
          onUpdateDiagram?.(message.data.xml);
        }
        return;
      }

      if (raw.type === "users" && Array.isArray(raw.users)) {
        onUsersUpdate?.(raw.users);
      }
    } catch (err) {
      console.error("Invalid BPMN WS message", err);
    }
  };

  socket.onerror = (err) => console.error("BPMN WebSocket error", err);
  socket.onclose = () => {
    console.log("BPMN WebSocket closed");
    socket = null;
  };

  return socket;
}


export function sendDiagramUpdate(xml: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const message = UpdateDiagramSchema.parse({
    type: "updateDiagram",
    xml,
  });

  socket.send(JSON.stringify(message));
}

export function disconnectBpmnSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    socket = null;
    console.log("BPMN WebSocket disconnected manually");
  }
}
