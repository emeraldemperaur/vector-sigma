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

  const formatGridColumn = (spanValue?: string) => {
    if (!spanValue) return undefined;
    return newLine ? `1 / ${spanValue}` : spanValue;
  };

  const baseSpan = span ? `span ${span}` : (getSpan(xs) || "span 12");

  return (
    <Box
      {...props}
      gridColumn={{
        initial: formatGridColumn(baseSpan),
        xs: formatGridColumn(getSpan(xs)),
        sm: formatGridColumn(getSpan(sm)),
        md: formatGridColumn(getSpan(md)),
        lg: formatGridColumn(getSpan(lg)),
        xl: formatGridColumn(getSpan(xl)),
      }}
    >
      {children}
    </Box>
  );
};