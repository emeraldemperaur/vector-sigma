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