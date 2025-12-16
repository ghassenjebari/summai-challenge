import { clientIdRef } from "../sockets/bpmn_socket_handler";
import { sendDiagramUpdate, lockElement, unlockElement } from "../sockets/bpmn_socket_actions";

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

export const handleChange = async (modelerRef: any, applyingRemoteUpdateRef: any) => {
  if (!modelerRef.current || applyingRemoteUpdateRef.current) return;
  try {
    const { xml } = await modelerRef.current.saveXML({ format: true });
    sendDiagramUpdate(xml);
  } catch (err) {
    console.error("Failed to save XML:", err);
  }
};

export const handleElementClick = (element: any, lockedElements: Record<string, string>) => {
  if (!element.id) return;
  if (lockedElements[element.id] && lockedElements[element.id] !== clientIdRef.current) return;
  lockElement(element.id);
};

export const handleSelectionChanged = (event: any) => {
  const oldSelection = event.oldSelection || [];
  const newSelection = event.newSelection || [];
  oldSelection.forEach((el: any) => {
    if (!newSelection.includes(el)) unlockElement(el.id);
  });
};

export const handleDblClick = (event: any, lockedElementsRef: React.MutableRefObject<Record<string, string>>) => {
  const element = event.element;
  if (!element) return;

  const lockedBy = lockedElementsRef.current[element.id];
  if (lockedBy && lockedBy !== clientIdRef.current) {
    event.preventDefault?.();
    return false;
  }
};

