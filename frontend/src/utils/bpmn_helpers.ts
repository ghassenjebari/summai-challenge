import Modeler from "bpmn-js/lib/Modeler"; // optional, if you want proper type
import { clientIdRef } from "../sockets/bpmn_socket_handler";

export const applyLockedMarkersIncremental = (
  modeler: Modeler | any,
  prevLocks: Record<string, string>,
  newLocks: Record<string, string>
) => {
  const canvas = modeler.get("canvas");
  const elementRegistry = modeler.get("elementRegistry");

  Object.keys(prevLocks).forEach(id => {
    if (!newLocks[id]) {
      const element = elementRegistry.get(id);
      if (element) canvas.removeMarker(id, "locked");
    }
  });

  Object.keys(newLocks).forEach(id => {
    if (!prevLocks[id]) {
      const element = elementRegistry.get(id);
      if (element) canvas.addMarker(id, "locked");
    }
  });
};


export const withLockCheck = (
  handler: (event: any) => void,
  lockedElementsRef: React.MutableRefObject<Record<string, string>>
) => {
  return (event: any) => {
    const element = event.element;

    // If there's no element, allow the action by default
    if (!element) {
      handler(event);
      return;
    }

    const lockedBy = lockedElementsRef.current[element.id];
    if (lockedBy && lockedBy !== clientIdRef.current) {
      event.preventDefault?.();
      return false; // stop action
    }

    // Continue with original handler
    handler(event);
  };
};
