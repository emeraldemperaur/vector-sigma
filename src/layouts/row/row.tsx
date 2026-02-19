import React from 'react';
import { Grid } from '@radix-ui/themes';

interface RowProps {
  /**
     * * Required Row child components.
     * * @example
     * children={
     * <Col>
     * <Text/>
     * </Col>
     * }
     */ 
  children: React.ReactNode;
   /**
     * * Option to specify the .scss class selector for the Row component.
     * * @example
     * className="teletraan-1-row"
     */
  className?: string;
  /**
     * * Option to specify a buffer spacing for child elements in the Row component.
     * Default: "4"
     * * @example
     * gap="6"
     */
  gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export const Row = ({ children, className, gap = "4" }: RowProps) => {
  return (
    <Grid 
      columns="12" 
      gap={gap} 
      width="auto" 
      className={className}
    >
      {children}
    </Grid>
  );
};