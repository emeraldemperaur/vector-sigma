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

export interface InputOption {
   /**
   * * The required unique option id for the Input Option item. 
   * * @example
   * optionid="versin-gtr-x-1000"
   */
   optionid: number | string;
   /**
   * * The required text for the Input Option item. 
   * * @example
   * text="Versin' GTR-X"
   */
   text: string; 
   /**
   * * The required option value for the Input Option item. 
   * * @example
   * optionvalue="VGTRX-1000"
   */
   optionvalue: string | number | boolean;
   /**
   * * The optional tag for the Input Option item. 
   * * @example
   * tag="HINT"
   */
   tag?: string;
   /**
   * * The optional meta numerical score for the Input Option item. 
   * * @example
   * score={10}
   */
   score?: number;
  /**
   * * The optional meta note for the Input Option item. 
   * * @example
   * note="This is an example hint note for the Input Option item."
   */
   note?: string; 
   /**
   * * The optional meta optionurl for the Input Option item. 
   * * @example
   * optionurl="https://github.com/emeraldemperaur/vector-sigma"
   */
   optionurl?: string;
}

export const InputOptionsPlaceholder = {
  optionid: crypto.randomUUID(),
  text: "",
  optionvalue: "",
  tag: "",
  score: 0,
  note: "",
  optionUrl: ""
}