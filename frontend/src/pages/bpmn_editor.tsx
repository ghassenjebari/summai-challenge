import { useEffect, useMemo, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import { connectBpmnSocket, disconnectBpmnSocket } from "../sockets/bpmn_socket_handler";
import { Group, Avatar, Stack, Title, Box } from "@mantine/core";
import { env } from "../utils/settings";
import { handleChange, handleDblClick, handleElementClick, handleInitDiagram, handleSelectionChanged, handleUpdateDiagram } from "../utils/bpmn_event_handlers";

export default function Bpmn_editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<any>(null);
  const applyingRemoteUpdateRef = useRef(false);
  const lockedElementsRef = useRef<Record<string, string>>({});
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [lockedElements, setLockedElements] = useState<Record<string, string>>({});
  const avatars = useMemo(() => connectedUsers.map(name => (
    <Avatar key={name} name={name} alt={name} color="initials" allowedInitialsColors={['blue','red']} />
  )), [connectedUsers]);


  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new Modeler({ container: containerRef.current });
    modelerRef.current = modeler;
    const eventBus = modeler.get("eventBus");

    connectBpmnSocket(`${env.VITE_API_URL}/ws/bpmn`, {
      onInitDiagram: handleInitDiagram(modelerRef),
      onUpdateDiagram: handleUpdateDiagram(modelerRef, applyingRemoteUpdateRef),
      onUsersUpdate: setConnectedUsers,
      onLockedElementsUpdate: setLockedElements,
    });

    const commandStackHandler = () => handleChange(modelerRef, applyingRemoteUpdateRef);
    const elementClickHandler = (e: any) => handleElementClick(e.element, lockedElementsRef.current);
    const selectionChangedHandler = handleSelectionChanged;
    const elementDblClickHandler = (event: any) => handleDblClick(event, lockedElementsRef);


    eventBus.on("commandStack.changed", commandStackHandler);
    eventBus.on("element.click", elementClickHandler);
    eventBus.on("selection.changed", selectionChangedHandler);
    eventBus.on("element.dblclick", 10000, elementDblClickHandler);

    return () => {
      eventBus.off("commandStack.changed", commandStackHandler);
      eventBus.off("element.click", elementClickHandler);
      eventBus.off("selection.changed", selectionChangedHandler);
      eventBus.off("element.dblclick", elementDblClickHandler);


      modeler.destroy();
      modelerRef.current = null;
    disconnectBpmnSocket()
    };
}, []); 

useEffect(() => {
  lockedElementsRef.current = lockedElements;
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
