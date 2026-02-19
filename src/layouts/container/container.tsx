import React from 'react';
import { Box, Container as RadixContainer } from '@radix-ui/themes';
import type { ContainerProps as RadixContainerProps } from '@radix-ui/themes';

interface ContainerProps extends RadixContainerProps {
  /**
     * * Option to enable fluid container width style for the Container component.
     * i.e. 1 - 12
     * * @example
     * width={5}
     */
  fluid?: boolean;
   /**
     * * Required Container child components.
     * * @example
     * children={
     * <Row>
     * <Col><Col>
     * </Row>
     * }
     */ 
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