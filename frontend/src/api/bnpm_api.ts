import { BpmnMessageSchema, UpdateDiagramSchema } from "../schemas/bpmnSchemas";

let socket: WebSocket | null = null;

type InitHandler = (xml: string) => void;

let onInitDiagram: InitHandler | null = null;
let onUpdateDiagram: InitHandler | null = null;

export function connectBpmnSocket(
  url: string,
  handlers?: {
    onInitDiagram?: InitHandler;
    onUpdateDiagram?: InitHandler;
  }
) {
  socket = new WebSocket(url);

  if (handlers?.onInitDiagram) onInitDiagram = handlers.onInitDiagram;
  if (handlers?.onUpdateDiagram) onUpdateDiagram = handlers.onUpdateDiagram;

  socket.onopen = () => console.log("BPMN WebSocket connected");

  socket.onmessage = (event) => {
    try {
      const message = BpmnMessageSchema.parse(JSON.parse(event.data));

      if (message.type === "initDiagram") {
        onInitDiagram?.(message.xml);
      } else if (message.type === "updateDiagram") {
        onUpdateDiagram?.(message.xml);
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
