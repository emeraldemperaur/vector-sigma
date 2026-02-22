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
  defaultValue: z.any().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  stepValue: z.number().or(z.float64()).optional(),
  newRow: z.boolean(),
  inputWidth: z.number(),
  inputHeight: z.number().optional(),
  isRequired: z.boolean(),
  isHinted: z.boolean(),
  hintText: z.string().nullish(),
  hintUrl: z.url().nullish(),
  queryResponse: z.any().nullable(),
  inputOptions: z.array(InputOptionSchema).nullable().optional(),
  toggledInput: z.any().nullable().optional(),
  toggleTrigger: z.any().nullable().optional(),
  errorText: z.string().optional()
});


const QuerySchema = z.object({
  queryId: z.number().or(z.uuid()),
  inputType: z.string(),
  inputAlias: z.string(),
  inputLabel: z.string(),
  inputPlaceholder: z.string(),
  defaultValue: z.any().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  stepValue: z.number().or(z.float64()).optional(),
  newRow: z.boolean(),
  inputWidth: z.number(),
  inputHeight: z.number().optional(),
  isRequired: z.boolean(),
  isHinted: z.boolean(),
  hintText: z.string().nullable(),
  hintUrl: z.url().nullable(),
  queryResponse: z.any().nullable(),
  inputOptions: z.array(InputOptionSchema).optional(),
  toggledInput: NestedQuerySchema.nullable().optional(),
  toggleTrigger: z.any().nullable().optional(),
  errorText: z.string().optional()
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
  logo: z.string().nullable(),
  brandcolor: z.string().nullable(),
  logoPosition: z.string().nullable(), 
  model: z.array(SectionSchema),
});

export type xForm = z.infer<typeof xFormSchema>;
export type xFormSection = z.infer<typeof SectionSchema>;
export type xFormQuery = z.infer<typeof QuerySchema>;
export type xFormNestedQuery = z.infer<typeof NestedQuerySchema>;
export type xFormInputOption = z.infer<typeof InputOptionSchema>;
