import { useEffect, useRef } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import {connectBpmnSocket, disconnectBpmnSocket, sendDiagramUpdate} from "../api/bnpm_api";

export default function Bpmn_editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<any>(null);
  const applyingRemoteUpdateRef = useRef(false);


useEffect(() => {
  if (!containerRef.current) return;  

  const modeler = new Modeler({ container: containerRef.current });
  modelerRef.current = modeler;

  connectBpmnSocket("ws://localhost:8000/ws/bpmn", {
    onInitDiagram: async (xml) => {
      try {
        await modeler.importXML(xml);
        modeler.get("canvas").zoom("fit-viewport");
      } catch (err) {
        console.error("Failed to import XML from server:", err);
      }
    },
    onUpdateDiagram: async (xml) => {
      if (!modelerRef.current) return;

      applyingRemoteUpdateRef.current = true;
      try {
        await modelerRef.current.importXML(xml);
        modelerRef.current.get("canvas").zoom("fit-viewport");
      } catch (err) {
        console.error("Failed to apply remote update:", err);
      } finally {
        applyingRemoteUpdateRef.current = false;
      }
    },
  });

  const handleChange = async () => {
    if (!modelerRef.current || applyingRemoteUpdateRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      sendDiagramUpdate(xml);
    } catch (err) {
      console.error("Failed to save XML:", err);
    }
  };

  const eventBus = modeler.get("eventBus");
  eventBus.on("commandStack.changed", handleChange);

  return () => {
    modeler.destroy();
    modelerRef.current = null;
    disconnectBpmnSocket()
  };
}, []);


  return (
      <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #ccc",
          }}
      />
  );
}
