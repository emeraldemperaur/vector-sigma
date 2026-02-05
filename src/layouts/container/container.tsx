import React from 'react';
import { Box, Container as RadixContainer } from '@radix-ui/themes';
import type { ContainerProps as RadixContainerProps } from '@radix-ui/themes';

interface ContainerProps extends RadixContainerProps {
  fluid?: boolean;
  children: React.ReactNode;
}

export const Container = ({ fluid, children, ...props }: ContainerProps) => {
  if (fluid) {
    return (
      <Box width="100%" px="3" className={props.className}>
        {children}
      </Box>
    );
  }
  return (
    <RadixContainer size="3" px="3" {...props}>
      {children}
    </RadixContainer>
  );
};