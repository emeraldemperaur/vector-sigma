import { z } from "zod";

export const InputOptionSchema = z.object({
  optionid: z.number(),
  optionvalue: z.union([z.string(), z.number(), z.boolean()]),
  optionurl: z.string().optional(),
  text: z.string(),
  tag: z.string().optional(),
  score: z.number().or(z.float64()).optional(),
  note: z.string().optional(),
});

export type XFormQuery = {
  queryId: number;
  inputType: string;
  inputAlias: string;
  inputLabel: string;
  inputPlaceholder?: string;
  newRow?: boolean;
  inputWidth: number;
  inputHeight?: number;
  isRequired?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  errorText?: string;
  defaultValue?: any;
  queryResponse?: any;
  inputOptions?: z.infer<typeof InputOptionSchema>[];
  triggerValue?: any;
  toggledInput?: XFormQuery | null; 
  
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
};

export const QuerySchema: z.ZodType<XFormQuery> = z.lazy(() =>
  z.object({
    queryId: z.number(),
    inputType: z.string(),
    inputAlias: z.string(),
    inputLabel: z.string(),
    inputPlaceholder: z.string().optional(),
    newRow: z.boolean().optional(),
    inputWidth: z.number(),
    inputHeight: z.number().optional(),
    isRequired: z.boolean().optional(),
    isHinted: z.boolean().optional(),
    hintText: z.string().optional(),
    hintUrl: z.string().optional(),
    errorText: z.string().optional(),
    defaultValue: z.any().optional(),
    queryResponse: z.any().nullable().optional(),
    inputOptions: z.array(InputOptionSchema).optional(),
    triggerValue: z.any().optional(),
    toggledInput: QuerySchema.nullable().optional(),
    
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    stepValue: z.number().optional(),
  })
);

export const SectionSchema = z.object({
  sectionId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  icon: z.string().optional(),
  queries: z.array(QuerySchema),
});

export const XFormSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  brandColor: z.string().optional(),
  logoPosition: z.string().optional(),
  model: z.array(SectionSchema),
});

export type XFormType = z.infer<typeof XFormSchema>;