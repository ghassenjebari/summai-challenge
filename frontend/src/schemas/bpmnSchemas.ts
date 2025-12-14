import { z } from "zod";

export const InitDiagramSchema = z.object({
  type: z.enum(["initDiagram"]),
  xml: z.string(),
});

export const UpdateDiagramSchema = z.object({
  type: z.enum(["updateDiagram"]),
  xml: z.string(),
});

export const BpmnMessageSchema = z.discriminatedUnion("type", [
  InitDiagramSchema,
  UpdateDiagramSchema,
]);

export type BpmnMessage = z.infer<typeof BpmnMessageSchema>;
