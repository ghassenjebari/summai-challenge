import { useEffect, useMemo, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import { clientIdRef, connectBpmnSocket, disconnectBpmnSocket } from "../sockets/bpmn_socket_handler";
import { Group, Avatar, Stack, Title, Box } from "@mantine/core";
import { env } from "../utils/settings";
import { handleInitDiagram, handleUpdateDiagram, lockElement, unlockElement, sendDiagramUpdate } from "../sockets/bpmn_socket_actions";

export default function Bpmn_editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<any>(null);
  const applyingRemoteUpdateRef = useRef(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [lockedElements, setLockedElements] = useState<Record<string, string>>({});
  const avatars = useMemo(() => connectedUsers.map(name => (
    <Avatar key={name} name={name} alt={name} color="initials" allowedInitialsColors={['blue','red']} />
  )), [connectedUsers]);


useEffect(() => {
  if (!containerRef.current) return;

  const modeler = new Modeler({ container: containerRef.current });
  modelerRef.current = modeler;

  connectBpmnSocket(`${env.VITE_API_URL}/ws/bpmn`, {
    onInitDiagram: handleInitDiagram(modelerRef),
    onUpdateDiagram: handleUpdateDiagram(modelerRef, applyingRemoteUpdateRef),
    onUsersUpdate: setConnectedUsers,
    onLockedElementsUpdate: setLockedElements,
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
  const handleElementClick = ({ element }: any) => {
    if (!element.id) return;
    if (lockedElements[element.id] && lockedElements[element.id] !== clientIdRef.current) return;
    lockElement(element.id);
  };

  const handleSelectionChanged = (event: any) => {
    const oldSelection = event.oldSelection || [];
    const newSelection = event.newSelection || [];
    oldSelection.forEach((el: any) => {
      if (!newSelection.includes(el)) unlockElement(el.id);
    });
  };

  eventBus.on("commandStack.changed", handleChange);
  eventBus.on("element.click", handleElementClick);
  eventBus.on("selection.changed", handleSelectionChanged);

  return () => {
    eventBus.off("commandStack.changed", handleChange);
    eventBus.off("element.click", handleElementClick);
    eventBus.off("selection.changed", handleSelectionChanged);
    modeler.destroy();
    modelerRef.current = null;
    disconnectBpmnSocket()
  };
}, []); 

useEffect(() => {
  if (!modelerRef.current) return;

  const canvas = modelerRef.current.get("canvas");
  const elementRegistry = modelerRef.current.get("elementRegistry");

  elementRegistry.forEach((el: any) => canvas.removeMarker(el.id, "locked"));

  Object.keys(lockedElements).forEach((id) => {
    const element = elementRegistry.get(id);
    if (element) canvas.addMarker(id, "locked");
  });
}, [lockedElements]); 

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
      <style>
        {`
          .djs-element.locked .djs-visual > :first-child {
            stroke: red !important;
            stroke-width: 4px !important;
          }
        `}
      </style>
    </Stack>
  );
}
