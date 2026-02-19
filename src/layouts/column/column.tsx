import React from 'react';
import { Box } from '@radix-ui/themes';

type ColSize = number | "auto" | boolean;

type ColProps = React.ComponentProps<typeof Box> & {
  /**
     * * Option to specify a span number for the Column component.
     * i.e. 1 - 12
     * * @example
     * span={6}
     */
  span?: number;
  /**
     * * Option to render Column component on a line.
     * * @example
     * newRow
     */
  newLine?: boolean; 
   /**
     * * Option to enable or specify `xs` viewport column size/breakpoint.
     * * @example
     * xs={3}
     */
  xs?: ColSize;
  /**
     * * Option to enable or specify `sm` viewport column size/breakpoint.
     * * @example
     * sm={4}
     */
  sm?: ColSize;
  /**
     * * Option to enable or specify `md` viewport column size/breakpoint.
     * * @example
     * md={5}
     */
  md?: ColSize;
  /**
     * * Option to enable or specify `lg` viewport column size/breakpoint.
     * * @example
     * lg={6}
     */
  lg?: ColSize;
  /**
     * * Option to enable or specify `xl` viewport column size/breakpoint.
     * * @example
     * xl={6}
     */
  xl?: ColSize;
    /**
     * * Required Column child components.
     * * @example
     * children={
     * <Text/>
     * ......
     * }
     */ 
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