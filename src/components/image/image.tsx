import React, { ReactNode } from 'react';
import { Box, Flex, Text, AspectRatio } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
export type ImageDesign = 'outline' | 'material' | 'neumorphic';
export type ImageLayout = 'normal' | 'rounded' | 'squared';

export interface ImageDisplayProps {
  id: string | number;
  src: string;
  alt?: string;
  design?: ImageDesign  & {};
  layout?: ImageLayout  & {};
  aspectratio?: number; // 16/9, 4/3, 1
  height?: string | number; 
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const getStyles = (design: ImageDesign, layout: ImageLayout): React.CSSProperties => {
  let borderRadius = 'var(--radius-3)'; 
  if (layout === 'squared') borderRadius = '0';
  if (layout === 'rounded') borderRadius = '16px';

  let visualStyles: React.CSSProperties = {};

  if (design === 'neumorphic') {
    visualStyles = {
      backgroundColor: '#e0e5ec',
      border: 'none',
      boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
    };
  } else if (design === 'material') {
    visualStyles = {
      backgroundColor: 'var(--gray-2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--gray-4)',
    };
  } else {
    visualStyles = {
      backgroundColor: 'var(--gray-1)',
      border: '1px solid var(--gray-6)',
    };
  }

  return {
    borderRadius,
    ...visualStyles,
    position: 'relative',
    overflow: 'hidden',
    display: 'block', 
  };
};

export const ImageOutput = ({
  id, src, 
  alt = "Image",
  design = 'outline',
  layout = 'normal',
  aspectratio = 16 / 9,
  height,
  width = '100%',
  className,
  style,
  onClick,
}: ImageDisplayProps) => {
  const containerStyles = getStyles(design, layout);
  const iconColor = design === 'neumorphic' ? '#555' : 'var(--gray-9)';

  const content = (
    <Box
      className={className}
      style={{
        ...containerStyles,
        width,
        height: height || 'auto',
        ...style,
      }}
      onClick={onClick}
    >
      {src ? (
        <img
          id={String(id)}
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: design === 'neumorphic' ? 'transparent' : 'var(--gray-3)',
            minHeight: height || '100%', 
          }}
        >
          <Flex direction="column" align="center" gap="2">
            <Icon name='image' width="32" height="32" color={iconColor} style={{ opacity: 0.5 }} />
            <Text size="1" color="gray">No Image</Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );

  if (height) {
    return content;
  }

  return (
    <Box style={{ width }}>
      <AspectRatio ratio={aspectratio}>
        {content}
      </AspectRatio>
    </Box>
  );
};