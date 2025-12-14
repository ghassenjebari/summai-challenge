import { useEffect, useMemo, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import {connectBpmnSocket, disconnectBpmnSocket, sendDiagramUpdate} from "../api/bnpm_api";
import { Group, Badge, Paper, Text, Avatar, Stack, Title, Box } from "@mantine/core";

export default function Bpmn_editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<any>(null);
  const applyingRemoteUpdateRef = useRef(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const avatars = useMemo(() => connectedUsers.map(name => (
    <Avatar key={name} name={name} alt={name} color="initials" allowedInitialsColors={['blue','red']} />
  )), [connectedUsers]);


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
    onUsersUpdate: (users) => setConnectedUsers(users), 
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
  <Stack>
    <Group justify="space-between" align="center">
      <Title order={2}>BPMN Editor</Title>
      <Group gap="xs">
        {avatars}
      </Group>
    </Group>
    <Box
      ref={containerRef}
      w="100%"
      h={600}
      p="sm"
      style={{ border: "1px solid #ccc" }} 
    />
  </Stack>
);
}
