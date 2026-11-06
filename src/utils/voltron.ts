// voltron.ts
import { z } from "zod";

/**
 * Base keywords that automatically generate standard permutations:
 * `b`, `${b}input`, `${b}-input`, `input-${b}`, `input${b}`
 */
const BASES = [
  "checkbox",
  "radio",
  "select",
  "selectmultiple",
  "dropdown",
  "optionselect",
  "multiselect",
  "countrydropdown",
  "countryselect",
  "countrymultiselect",
  "slider",
  "range",
  "rangeslider",
  "currency",
  "stock",
  "number",
  "text",
  "email",
  "password",
  "phone",
  "url",
  "creditcard",
  "textarea",
  "toggle",
  "switch",
  "datepicker",
  "daterangepicker",
  "datetimepicker",
  "timepicker",
  "file",
  "filemultiple",
  "avatar",
  "button"
] as const;

/**
 * Irregular compounds, hyphenated names, and output display elements
 * that cannot be generated solely by the base prefix/suffix pattern.
 */
const STANDALONE = [
  "checkboxes",
  "chechbox-input", 
  "checkboxgroup",
  "checkboxgroup-input",
  "radiogroup",
  "radiogroup-input",
  "radio-input",
  "date-picker",
  "date-range-picker",
  "date-time-picker",
  "time-picker",
  "file-upload",
  "credit-card",
  "credit-card-input",
  "image",
  "imageoutput",
  "image-output",
  "output-image",
  "outputimage",
  "title",
  "xtitle",
  "sectiontitle",
  "titlesection",
  "conditional",
  "conditionaltoggle",
  "conditionalcheckbox",
  "conditionalselect",
  "conditional-toggle",
  "conditional-select",
  "conditional-checkbox",
  "textarea-outline",
  "textarea-material",
  "textarea-neumorphic"
] as const;

const ALL_TYPES = [
  ...STANDALONE,
  ...BASES.flatMap(b => [b, `${b}input`, `${b}-input`, `input-${b}`, `input${b}`])
] as [string, ...string[]];

export const KnownInputTypeEnum = z.enum(ALL_TYPES);
export type KnownInputType = z.infer<typeof KnownInputTypeEnum>;

/**
 * Universal option entity for all VectorSigma selection primitives
 * (`Dropdown`, `OptionSelect`, `MultipleSelect`, `CountrySelect`, `RadioGroupInput`).
 */
export const InputOptionSchema = z.object({
  optionid: z
    .union([z.string(), z.number()])
    .describe(
      "Unique structural identifier used strictly for React DOM reconciliation and key assignment. Does not represent the committed Formik form state payload."
    ),

  text: z
    .string()
    .describe(
      "The human-readable label displayed in the UI (dropdown item label, radio label, tile heading)."
    ),

  optionvalue: z
    .union([z.string(), z.number(), z.boolean()])
    .describe(
      "The actual primitive payload committed to Formik values when this option is selected."
    ),

  tag: z
    .string()
    .optional()
    .describe(
      "Optional badge label or category pill displayed alongside the option in card tiles or rich lists (e.g., 'Recommended', 'Beta')."
    ),

  score: z
    .number()
    .optional()
    .describe(
      "Optional numerical metric or weight for algorithmic ranking, recommendation scoring, or risk assessment."
    ),

  note: z
    .string()
    .optional()
    .describe(
      "Secondary subtitle, hint, or description copy providing contextual guidance for this choice."
    ),

  optionurl: z
    .string()
    .optional()
    .describe(
      "External documentation URL or anchor opened when this option or its helper anchor is triggered."
    ),
});

export type InputOption = z.infer<typeof InputOptionSchema>;

/**
 * TypeScript definition for a single form query/input node, supporting recursive sub-queries.
 */
export type XFormQuery = {
  queryId: number | string;
  inputType: KnownInputType | (string & {});
  inputAlias: string;
  inputLabel: string;
  inputPlaceholder?: string;
  newRow?: boolean;
  inputWidth: number;
  inputHeight?: number | string;
  isRequired?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  errorText?: string;
  defaultValue?: any;
  queryResponse?: any;
  inputOptions?: InputOption[];
  triggerValue?: any;
  toggledInput?: XFormQuery | null;
  minValue?: number | string;
  maxValue?: number | string;
  stepValue?: number | string;
  minStepsBetweenThumbs?: number;
  inputVariant?: string;
  enableSearch?: boolean;
  readOnly?: boolean;
};

/**
 * Schema for a single interactive form query/input node.
 */
export const QuerySchema: z.ZodType<XFormQuery> = z.lazy(() =>
  z.object({
    queryId: z
      .union([z.number(), z.string()])
      .describe("Unique integer or UUID identifying this question node within the form section."),

    inputType: z
      .union([KnownInputTypeEnum, z.string()])
      .describe(
        "Component primitive to render. Validated against all known Voltaire and Teletraan1 input types."
      ),

    inputAlias: z
      .string()
      .regex(/^[a-zA-Z0-9_.-]+$/, {
        message: "inputAlias must be a clean, valid alphanumeric identifier",
      })
      .describe(
        "Formik state key, input name attribute, and JSON submission payload key (e.g., 'primaryEmail', 'cloudProvider', 'retentionDays')."
      ),

    inputLabel: z
      .string()
      .min(1)
      .describe("Primary label rendered directly above the input element."),

    inputPlaceholder: z
      .string()
      .optional()
      .describe("Muted placeholder text rendered when the input has no value."),

    newRow: z
      .boolean()
      .optional()
      .default(false)
      .describe("Forces the grid column to break onto a new row (starts at column 1 of the 12-column grid)."),

    inputWidth: z
      .coerce
      .number()
      .int()
      .transform(val => (val > 12 ? 12 : val < 1 ? 1 : val))
      .catch(12) 
      .default(12)
      .describe("Responsive grid span across a 12-column grid (1-12). Stacks to 12 automatically on mobile viewports."),

    inputHeight: z
      .union([z.number(), z.string()])
      .optional()
      .describe("Vertical pixel height override for multi-line textareas, code editors, or ImageOutput height."),

    isRequired: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this field requires a non-empty, non-null value before form submission can proceed."),

    isHinted: z
      .boolean()
      .optional()
      .default(false)
      .describe("Renders an interactive help/tooltip icon adjacent to the input label."),

    hintText: z
      .string()
      .optional()
      .describe("Descriptive guidance copy revealed when the user hovers or taps the hint tooltip."),

    hintUrl: z
      .string()
      .optional()
      .describe("External documentation or guide URL opened when clicking the hint tooltip icon."),

    errorText: z
      .string()
      .optional()
      .describe("Explicit validation error message overriding standard automated Yup/Zod schema messages."),

    defaultValue: z
      .any()
      .optional()
      .describe(
        "Initial value hydrated into Formik state upon mount. Must match the input type: array for multi-selects/ranges, number for sliders, boolean for toggles, string for text/images."
      ),

    queryResponse: z
      .any()
      .nullable()
      .optional()
      .describe(
        "Stores the final submitted value hydrated by `VectorSigma.hydrateQueryResponses()`. For select fields, this holds the resolved `InputOption` object."
      ),

    inputOptions: z
      .array(InputOptionSchema)
      .optional()
      .describe("Array of selectable choices for selection primitives ('dropdown', 'optionselect', 'multiselect', 'radio')."),

    triggerValue: z
      .any()
      .optional()
      .describe("The matching field value that dynamically reveals the nested `toggledInput` sub-query."),

    toggledInput: z
      .lazy(() => QuerySchema)
      .nullable()
      .optional()
      .describe("Conditional sub-query revealed recursively when this input's value matches `triggerValue`."),

    minValue: z
      .union([z.number(), z.string()])
      .optional()
      .describe("Lower numerical boundary for slider, range, or numeric controls."),

    maxValue: z
      .union([z.number(), z.string()])
      .optional()
      .describe("Upper numerical boundary for slider, range, or numeric controls."),

    stepValue: z
      .union([z.number(), z.string()])
      .optional()
      .describe("Granularity step interval for numeric and slider controls (e.g., 0.5, 1, 10)."),

    minStepsBetweenThumbs: z
      .number()
      .nonnegative()
      .optional()
      .describe("Minimum distance required between thumbs in dual-thumb range sliders ('rangeslider')."),

    inputVariant: z
      .string()
      .optional()
      .describe("Aesthetic theme override for this component ('outline', 'material', 'neumorphic')."),

    enableSearch: z
      .boolean()
      .optional()
      .describe("Incorporates an interactive text search filter inside 'optionselect' or 'multiselect' popovers."),

    readOnly: z
      .boolean()
      .optional()
      .describe("Disables user interaction and applies muted read-only styling."),
  })
);

/**
 * Logical section grouping queries into thematic cards or accordion panels.
 */
export const SectionSchema = z.object({
  sectionId: z
    .union([z.string(), z.number()])
    .transform(String)
    .describe("Unique slug or ID for this section, utilized by Codex steppers and Accordions (e.g., 'billing-info')."),

  title: z
    .string()
    .min(1)
    .describe("Section heading rendered above the section queries."),

  subtitle: z
    .string()
    .optional()
    .describe("Secondary explanatory copy or instructions for completing this section."),

  icon: z
    .string()
    .optional()
    .describe("Name of the icon rendered next to the section title (e.g., 'user', 'shield', 'layers')."),

  queries: z
    .array(QuerySchema)
    .describe("Ordered list of query input nodes belonging to this section."),
});

export type Section = z.infer<typeof SectionSchema>;

/**
 * Top-level form document definition representing an entire VectorSigma xForm model.
 */
export const XFormSchema = z.object({
  uuid: z
    .string()
    .describe("Universal unique identifier for the form instance."),

  name: z
    .string()
    .min(1)
    .describe("Administrative and display name of the form (e.g., 'Enterprise Workspace Onboarding')."),

  logo: z
    .string()
    .optional()
    .describe("URL, asset path, or base64 data URI of the brand logo image rendered in the form header."),

  brandColor: z
    .string()
    .optional()
    .describe("Primary brand color (hex, rgb, or CSS token) used for focus borders, indicators, and buttons."),

  logoPosition: z
    .enum(["left", "center", "right"])
    .default("left")
    .optional()
    .describe("Horizontal alignment of the logo image within the header banner."),

  model: z
    .array(SectionSchema)
    .min(1)
    .describe("The ordered collection of sections and interactive queries that constitute the form."),
});

export type XFormType = z.infer<typeof XFormSchema>;