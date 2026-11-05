/**
 * Traverses up the DOM from a specific element to find the first non-transparent background.
 * @param element - The HTML element to start searching from
 */
export const getNearestBackgroundColor = (element: HTMLElement | null): string => {
  let current: HTMLElement | null = element;

  while (current) {
    const style = window.getComputedStyle(current);
    const color = style.backgroundColor;

    // Check if color is valid and not transparent
    if (
      color && 
      color !== 'rgba(0, 0, 0, 0)' && 
      color !== 'transparent'
    ) {
      return color;
    }

    // Move up to parent
    current = current.parentElement;
  }

  // Fallback if no background found all the way to <html>
  return '#ffffff';
};


export const getNearestParentBackground = (element: HTMLElement | null): string => {
  let current = element;
  while (current) {
    const style = window.getComputedStyle(current);
    const color = style.backgroundColor;
    // Ignore transparent or unset backgrounds
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      return color;
    }
    current = current.parentElement;
  }
  return '#e0e5ec'; // Fallback default grey
};


export const adjustColor = (color: string, amount: number): string => {
  let usePound = false;
  if (color.startsWith('#')) {
    color = color.slice(1);
    usePound = true;
  }
  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g)?.map(Number);
    if (!rgb) return color;
    return `rgb(${Math.max(0, Math.min(255, rgb[0] + amount))}, ${Math.max(0, Math.min(255, rgb[1] + amount))}, ${Math.max(0, Math.min(255, rgb[2] + amount))})`;
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);

  return (usePound ? '#' : '') + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Allowed extensions mapped to MIME types for 'accept' attribute
export const ACCEPTED_FORMATS = [
  "image/jpeg", "image/png", "image/gif", // Images
  "application/pdf", // PDF
  ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word
  ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
  ".csv", "text/csv", // CSV
  "text/plain", // TXT
  "application/json", // JSON
  ".zip", "application/zip", "application/x-zip-compressed" // ZIP
].join(',');

export const ACCEPTED_EXTENSIONS = [
  ".jpeg", ".jpg", ".pdf", ".png", ".gif", 
  ".docx", ".xlsx", ".csv", ".txt", ".json", ".zip"
].join(",");

// Byte Formatter
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

/**
 * Universal option entity for all VectorSigma selection primitives 
 * (`Dropdown`, `OptionSelect`, `MultipleSelect`, `RadioGroupInput`).
 *
 * @description Standardized data transfer object (DTO) representing a single selectable choice.
 * Separates internal identity, UI presentation, and Formik form state payload.
 *
 * @example
 * ```typescript
 * const deploymentRegions: InputOption[] = [
 *   {
 *     optionid: "us-east-1",
 *     optionvalue: "us-east-1",
 *     text: "US East (N. Virginia)",
 *     tag: "Recommended",
 *     note: "Lowest latency cluster",
 *     score: 98,
 *   },
 *   {
 *     optionid: "eu-central-1",
 *     optionvalue: "eu-central-1",
 *     text: "Europe (Frankfurt)",
 *     tag: "GDPR Compliant",
 *     optionurl: "[https://docs.vectorsigma.io/clusters/eu-central-1](https://docs.vectorsigma.io/clusters/eu-central-1)",
 *   }
 * ];
 * ```
 */
export interface InputOption {
  /**
   * Unique structural identifier used strictly for React reconciliation (`key` prop)
   * and DOM node identification.
   * 
   * @remarks Does NOT represent the form state value (see `optionvalue`).
   * @example "opt-region-useast1"
   */
  optionid: number | string;

  /**
   * The human-readable label rendered in the UI (dropdown item text, radio label, tile heading).
   * 
   * @example "US East (N. Virginia)"
   */
  text: string;

  /**
   * The actual data payload committed to Formik state when this option is selected.
   * 
   * @remarks Can be a string, numeric identifier, or boolean toggle.
   * @example "us-east-1"
   */
  optionvalue: string | number | boolean;

  /**
   * Optional badge or pill label displayed alongside the option text in rich lists and card tiles.
   * 
   * @example "Beta"
   * @example "Recommended"
   */
  tag?: string;

  /**
   * Optional numerical weighting or evaluation metric.
   * 
   * @remarks Used for algorithmic sorting, weighted risk scoring, or recommendation rank.
   * @example 95
   */
  score?: number;

  /**
   * Optional secondary descriptive copy, subtitle, or tooltip text accompanying the option.
   * 
   * @example "Optimized for latency-critical distributed workloads."
   */
  note?: string;

  /**
   * Optional external URL bound to the option item.
   * 
   * @remarks When present, clicking the option or secondary anchor triggers navigation in a new tab.
   * @example "https://docs.vectorsigma.io/regions/us-east-1"
   */
  optionurl?: string;
}

export const InputOptionsPlaceholder = {
  optionid: crypto.randomUUID(),
  text: "loremipsum",
  optionvalue: "__RESET__",
  tag: "DEBUG",
  score: 0,
  note: "None",
  optionUrl: ""
}