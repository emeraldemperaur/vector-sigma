import { z } from "zod";

// JSON defintion (schema) for xForm object
const InputOptionSchema = z.object({
  optionId: z.number().or(z.uuid()),
  text: z.string(),
  tag: z.string().nullish(),
  score: z.number().or(z.float64()).nullish(),
  note: z.string().nullish(),
  optionUrl: z.url().nullish(),
});

const NestedQuerySchema = z.object({
  queryId: z.number().or(z.uuid()),
  inputType: z.string(),
  inputAlias: z.string(),
  inputLabel: z.string(),
  inputPlaceholder: z.string(),
  newRow: z.boolean(),
  inputWidth: z.number(),
  isRequired: z.boolean(),
  isHinted: z.boolean(),
  hintText: z.string().nullish(),
  hintUrl: z.url().nullish(),
  queryResponse: z.any().nullable(),
  inputOptions: z.array(InputOptionSchema).nullish(),
});

const QuerySchema = z.object({
  queryId: z.number().or(z.uuid()),
  inputType: z.string(),
  inputAlias: z.string(),
  inputLabel: z.string(),
  inputPlaceholder: z.string(),
  newRow: z.boolean(),
  inputWidth: z.number(),
  isRequired: z.boolean(),
  isHinted: z.boolean(),
  hintText: z.string().nullable(),
  hintUrl: z.url().nullable(),
  queryResponse: z.any().nullable(),
  inputOptions: z.array(InputOptionSchema).optional(),
  toggledInput: NestedQuerySchema.nullable()
});

const SectionSchema = z.object({
  sectionId: z.number(),
  title: z.string(),
  icon: z.string().nullable(),
  queries: z.array(QuerySchema)
});

export const xFormSchema = z.object({
  uuid: z.uuid(),
  name: z.string(),
  model: z.array(SectionSchema),
});

export type xForm = z.infer<typeof xFormSchema>;
export type xFormSection = z.infer<typeof SectionSchema>;
export type xFormQuery = z.infer<typeof QuerySchema>;
export type xFormNestedQuery = z.infer<typeof NestedQuerySchema>;
export type xFormInputOption = z.infer<typeof InputOptionSchema>;
