import { z } from "zod";

export const InitDiagramSchema = z.object({
  type: z.enum(["initDiagram"]),
  xml: z.string(),
});

export const UpdateDiagramSchema = z.object({
  type: z.enum(["updateDiagram"]),
  xml: z.string(),
});

export const LockedElementsSchema = z.object({
  type: z.enum(["lockedElements"]),
  locks: z.record(z.string(), z.string()),
});

export const LockElementSchema = z.object({
  type: z.enum(["lockElement"]),
  elementId: z.string(),
  user: z.string(),
});

export const UnlockElementSchema = z.object({
  type: z.enum(["unlockElement"]),
  elementId: z.string(),
});

export const AssignUserIdSchema = z.object({
  type: z.enum(["assignUserId"]),
  userId: z.string(),
});
export const ConnectedUsersSchema = z.object({
  type: z.enum(["users"]),
  users: z.string().array(),
});

export const BpmnSocketMessageSchema  = z.discriminatedUnion("type", [
  InitDiagramSchema,
  UpdateDiagramSchema,
  LockedElementsSchema,
  LockElementSchema,
  UnlockElementSchema,
  AssignUserIdSchema,
  ConnectedUsersSchema,
]);

export type BpmnSocketMessage  = z.infer<typeof BpmnSocketMessageSchema>;
