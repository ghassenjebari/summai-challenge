import { BpmnSocketMessageSchema } from "../schemas/bpmn_socket_schemas";

export let socket: WebSocket | null = null;
export const clientIdRef = { current: null as string | null };

type DiagramHandler = (xml: string) => void;
type UsersHandler = (users: string[]) => void;
type LockedElementsHandler = (locks: Record<string,string>) => void;

let onInitDiagram: DiagramHandler | null = null;
let onUpdateDiagram: DiagramHandler | null = null;
let onUsersUpdate: UsersHandler | null = null;
let onLockedElementsUpdate: LockedElementsHandler | null = null;

export function connectBpmnSocket(
  url: string,
  handlers?: {
    onInitDiagram?: DiagramHandler;
    onUpdateDiagram?: DiagramHandler;
    onUsersUpdate?: UsersHandler;
    onLockedElementsUpdate?: LockedElementsHandler;
  }
) {
  socket = new WebSocket(url);

  if (handlers?.onInitDiagram) onInitDiagram = handlers.onInitDiagram;
  if (handlers?.onUpdateDiagram) onUpdateDiagram = handlers.onUpdateDiagram;
  if (handlers?.onUsersUpdate) onUsersUpdate = handlers.onUsersUpdate;
  if (handlers?.onLockedElementsUpdate) onLockedElementsUpdate = handlers.onLockedElementsUpdate;

  socket.onopen = () => console.log("BPMN WebSocket connected");

  socket.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);
      const message = BpmnSocketMessageSchema.safeParse(raw);

      if (message.success) {
        switch (message.data.type) {
          case "initDiagram":
            console.log("Init diagram received");
            onInitDiagram?.(message.data.xml);
            break;

          case "assignUserId":
            clientIdRef.current = (message.data as any).userId;
            console.log("Assigned client UUID:", clientIdRef.current);
            break;

          case "updateDiagram":
            console.log("Update diagram received");
            onUpdateDiagram?.(message.data.xml);
            break;

          case "lockedElements":
            console.log("Locked elements update:", message.data.locks);
            onLockedElementsUpdate?.(message.data.locks);
            break;
          case "users":
            console.log("Users update:", raw.users);
            onUsersUpdate?.(raw.users);
            break;
        }
        return;
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

export function disconnectBpmnSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    socket = null;
    console.log("BPMN WebSocket disconnected manually");
  }
}

