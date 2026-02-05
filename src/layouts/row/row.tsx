import React from 'react';
import { Grid } from '@radix-ui/themes';

interface RowProps {
  children: React.ReactNode;
  className?: string;
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