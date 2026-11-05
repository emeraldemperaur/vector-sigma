import React from 'react';
import { Box, Container as RadixContainer } from '@radix-ui/themes';
import type { ContainerProps as RadixContainerProps, BoxProps } from '@radix-ui/themes';

/**
 * ContainerProps Interface
 * @description Viewport shell for VectorSigma forms and layouts.
 * Supports centered fixed-width enterprise containers and 100% full-width fluid layouts.
 */
export interface ContainerProps extends Omit<RadixContainerProps, 'display'> {
  /**
   * When enabled, expands the container to 100% of the parent width without a max-width constraint.
   * @default false
   */
  fluid?: boolean;

  /**
   * Responsive display override supporting both Container and Box display tokens.
   */
  display?: RadixContainerProps['display'] | BoxProps['display'];

  /**
   * Children components rendered inside the container.
   */
  children: React.ReactNode;
}

export const Container = ({
  fluid = false,
  children,
  size = "3",
  px,
  className,
  style,
  display,
  ...props
}: ContainerProps) => {

  const resolvedPx = px !== undefined ? px : { initial: "3", sm: "4" };

  if (fluid) {
    const boxDisplay = display === 'initial' ? 'block' : (display as BoxProps['display']);

    return (
      <Box
        width="100%"
        px={resolvedPx}
        display={boxDisplay}
        className={className}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof Box>)}
      >
        {children}
      </Box>
    );
  }

  return (
    <RadixContainer
      size={size}
      px={resolvedPx}
      display={display as RadixContainerProps['display']}
      className={className}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </RadixContainer>
  );
};