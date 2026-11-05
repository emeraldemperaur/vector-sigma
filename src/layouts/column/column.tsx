import React from 'react';
import { Box } from '@radix-ui/themes';

export type ColSize = number | "auto" | boolean;

/**
 * ColumnProps Interface
 * @description Configuration properties for the VectorSigma Column grid layout component.
 * Provides mobile-first automatic stacking (12 columns on mobile devices) while strictly
 * preserving desktop multi-column spans (`span`, `sm`, `md`, `lg`, `xl`) and new-row breaks.
 */
export interface ColumnProps extends Omit<React.ComponentProps<typeof Box>, 'span'> {
  /**
   * The number of columns to span on a 12-column grid.
   * - On mobile viewports (< 768px): Automatically stacks to full-width (12 columns)
   *   to prevent input squeezing and horizontal overflow.
   * - On tablet/desktop viewports (>= 768px): Spans the exact specified column width.
   * @example 6 // Half-width on desktop, full-width on mobile
   * @example 12 // Full-width across all viewports
   */
  span?: number;

  /**
   * Forces the column to break onto a new grid line starting at column 1.
   * @default false
   */
  newLine?: boolean;

  /**
   * Optional explicit column span override for the base mobile viewport (0px+).
   * Overrides the automatic full-width mobile behavior when explicitly provided.
   * @example 6 // Force half-width even on small phones
   */
  initial?: ColSize;

  /**
   * Optional explicit column span override for phablets / large phones (520px+).
   * @example 6
   */
  xs?: ColSize;

  /**
   * Optional explicit column span override for tablet portrait viewports (768px+).
   * @example 6
   */
  sm?: ColSize;

  /**
   * Optional explicit column span override for standard desktop / tablet landscape (1024px+).
   * @example 4
   */
  md?: ColSize;

  /**
   * Optional explicit column span override for wide desktop displays (1280px+).
   * @example 3
   */
  lg?: ColSize;

  /**
   * Optional explicit column span override for ultra-wide displays (1640px+).
   * @example 2
   */
  xl?: ColSize;

  /**
   * Children components rendered inside the Column.
   */
  children?: React.ReactNode;
}

export type ColProps = ColumnProps;

export const Column = ({
  newLine = false,
  span,
  initial,
  xs,
  sm,
  md,
  lg,
  xl,
  children,
  style,
  ...props
}: ColumnProps) => {

  const toSpanString = (val?: ColSize): string | undefined => {
    if (val === undefined || val === null) return undefined;
    if (val === "auto") return "auto";
    if (val === true || val === 12) return "span 12";
    if (val === false) return undefined;
    const num = Number(val);
    if (isNaN(num) || num <= 0) return undefined;
    return `span ${Math.min(12, Math.max(1, num))}`;
  };

  const formatGridCol = (spanStr?: string, isNewLine?: boolean): string | undefined => {
    if (!spanStr) return undefined;
    return isNewLine ? `1 / ${spanStr}` : spanStr;
  };

  
  const initialSpan = toSpanString(initial) 
    || (xs !== undefined && xs !== true ? toSpanString(xs) : undefined)
    || (span === 12 ? "span 12" : "span 12");

  const xsSpan = toSpanString(xs);

  const smSpan = toSpanString(sm) 
    || (span !== undefined ? (span <= 4 ? "span 6" : toSpanString(span)) : undefined);

  const mdSpan = toSpanString(md) || toSpanString(span);

  const lgSpan = toSpanString(lg);
  const xlSpan = toSpanString(xl);

  return (
    <Box
      {...props}
      gridColumn={{
        initial: formatGridCol(initialSpan, newLine),
        xs: formatGridCol(xsSpan, newLine),
        sm: formatGridCol(smSpan, newLine),
        md: formatGridCol(mdSpan, newLine),
        lg: formatGridCol(lgSpan, newLine),
        xl: formatGridCol(xlSpan, newLine),
      }}
      style={{
        minWidth: 0, 
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </Box>
  );
};