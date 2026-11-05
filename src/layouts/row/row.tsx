import React from 'react';
import { Grid } from '@radix-ui/themes';

/**
 * RowProps Type
 * @description Configuration properties for the VectorSigma Row grid container.
 * Uses a type intersection to bypass TS2312 with Radix polymorphic component types.
 */
export type RowProps = React.ComponentProps<typeof Grid> & {
  /**
   * Children components (typically `<Column>` instances).
   */
  children: React.ReactNode;

  /**
   * Optional custom SCSS/CSS class selector.
   */
  className?: string;

  /**
   * Spacing gap between columns and rows.
   * Can be a static Radix scale string or responsive breakpoint object.
   * @default "4"
   */
  gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  /**
   * Inline React CSS styles applied to the grid container.
   */
  style?: React.CSSProperties;
};

export const Row = ({
  children,
  className,
  gap = "4",
  style,
  ...props
}: RowProps) => {

  const responsiveGap = typeof gap === 'string'
    ? ({ initial: gap === '0' || gap === '1' || gap === '2' ? gap : '3', sm: gap } as any)
    : gap;

  return (
    <Grid
      columns="12"
      gap={responsiveGap}
      width="100%"
      className={className}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};