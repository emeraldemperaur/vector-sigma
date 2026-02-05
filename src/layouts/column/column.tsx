import React from 'react';
import { Box } from '@radix-ui/themes';

type ColSize = number | "auto" | boolean;

type ColProps = React.ComponentProps<typeof Box> & {
  span?: number;
  newLine?: boolean; 
  xs?: ColSize;
  sm?: ColSize;
  md?: ColSize;
  lg?: ColSize;
  xl?: ColSize;
  children?: React.ReactNode;
}

export const Column = ({ newLine, span, xs, sm, md, lg, xl, children, ...props }: ColProps) => {
  
  const getSpan = (value?: ColSize) => {
    if (value === undefined) return undefined;
    if (value === "auto") return "auto";
    if (value === true) return "span 12"; 
    return `span ${value}`;
  };

  const baseSize = span ? `span ${span}` : (getSpan(xs) || "span 12");

  return (
    <Box
      {...props}
      // NEW: If newLine is true, force start at column 1
      gridColumnStart={newLine ? "1" : props.gridColumnStart}
      gridColumn={{
        initial: baseSize,
        xs: getSpan(xs),
        sm: getSpan(sm),
        md: getSpan(md),
        lg: getSpan(lg),
        xl: getSpan(xl),
      }}
    >
      {children}
    </Box>
  );
};