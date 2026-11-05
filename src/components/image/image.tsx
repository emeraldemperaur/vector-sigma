import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text, AspectRatio } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import '../../styles/main.scss';

export type ImageDesign = 'outline' | 'material' | 'neumorphic';
export type ImageLayout = 'normal' | 'rounded' | 'squared';

/**
 * ImageDisplayProps Interface
 * @description Configuration properties for the VectorSigma ImageOutput component.
 * Features enterprise-grade aesthetic variants, fluid aspect ratios, responsive scaling, 
 * dynamic empty states, and LLM-friendly typography/style overrides.
 */
export interface ImageDisplayProps {
  /**
   * The required unique identifier for the ImageOutput component in the DOM.
   * @example "userProfilePicture"
   */
  id: string | number;

  /**
   * The source URL or file path for the image to display.
   * If omitted or null, the component renders an elegant fallback empty state.
   * @example "https://cdn.vectorsigma.io/assets/logo.png"
   */
  src?: string | null;

  /**
   * Alternative text for accessibility and screen readers.
   * @default "Image"
   * @example "Company logo"
   */
  alt?: string;

  /**
   * The aesthetic design language of the image container.
   * - `outline`: Minimalist, crisp border (Default).
   * - `material`: Elevated, sharp drop-shadow.
   * - `neumorphic`: Soft-UI with extruded inset shadows based on the parent background.
   * @default "outline"
   */
  design?: ImageDesign;

  /**
   * The structural layout and corner radius of the image container.
   * - `normal`: Standard UI radius (match global theme).
   * - `rounded`: Pronounced, pill-like 16px radius.
   * - `squared`: Sharp 0px radius corners.
   * @default "normal"
   */
  layout?: ImageLayout;

  /**
   * Forces the image container to maintain a specific aspect ratio.
   * Prevents layout shift during image loading.
   * @example {16 / 9}
   */
  aspectratio?: number; 

  /**
   * Explicit height for the image container. If not provided, it will size automatically 
   * based on the `width` or the `aspectratio`.
   * @example "250px"
   */
  height?: string | number; 

  /**
   * Explicit width for the image container.
   * @default "100%"
   */
  width?: string | number;

  /**
   * Dictates how the image should scale within its container bounds.
   * Extremely useful when paired with fixed `height` or `aspectratio`.
   * @default "cover"
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color (visible behind transparent PNGs or in the empty state) */
    background?: string;
    /** Overrides the border color of the image container */
    stroke?: string;
    /** Overrides the text/icon color used in the empty fallback state */
    textColor?: string;
  };

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outmost wrapping box.
   */
  style?: React.CSSProperties;

  /**
   * Optional click event handler for the image container.
   * Useful for triggering lightboxes or selection states.
   */
  onClick?: () => void;
}

export const ImageOutput = ({
  id, 
  src, 
  alt = "Image",
  design = 'outline',
  layout = 'normal',
  aspectratio, 
  height,
  width = '100%',
  objectFit = 'cover',
  typography,
  className,
  style,
  onClick,
}: ImageDisplayProps) => {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (design === 'neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -15), 
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [design, typography?.background]);

  const typographyVars = {
    '--vs-img-bg': typography?.background || 'var(--gray-2)',
    '--vs-img-stroke': typography?.stroke || 'var(--gray-6)',
    '--vs-img-text': typography?.textColor || 'var(--gray-9)',
  } as React.CSSProperties;

  let borderRadius = 'var(--radius-3)'; 
  if (layout === 'squared') borderRadius = '0px';
  if (layout === 'rounded') borderRadius = '16px';

  const getVisualStyles = (): React.CSSProperties => {
    if (design === 'neumorphic') {
      return {
        backgroundColor: 'var(--neu-bg)',
        border: 'none',
        boxShadow: '6px 6px 16px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light)',
        ...neuVars
      };
    } 
    if (design === 'material') {
      return {
        backgroundColor: 'var(--vs-img-bg)',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${typography?.stroke ? 'var(--vs-img-stroke)' : 'var(--gray-4)'}`,
      };
    } 
    
    return {
      backgroundColor: typography?.background ? 'var(--vs-img-bg)' : 'transparent',
      border: '1px solid var(--vs-img-stroke)',
    };
  };

  const containerStyles: React.CSSProperties = {
    borderRadius,
    overflow: 'hidden', 
    display: 'block', 
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    ...getVisualStyles(),
  };

  const content = (
    <Box
      ref={containerRef}
      className={`vs-image-container ${className || ''}`}
      style={{
        ...containerStyles,
        width: '100%',
        height: height || '100%', 
        ...typographyVars,
        ...style,
      }}
      onClick={onClick}
    >
      <style>
        {`
          .vs-image-container:hover {
            transform: ${onClick ? 'translateY(-2px)' : 'none'};
          }
          .vs-image-media {
            transition: transform 0.4s ease;
          }
        `}
      </style>
      
      {src ? (
        <img
          id={String(id)}
          src={src}
          alt={alt}
          className="vs-image-media"
          style={{
            width: '100%',
            height: '100%', 
            objectFit: objectFit, 
            display: 'block',
            backgroundColor: 'transparent',
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{
            width: '100%',
            height: height || '150px',
            backgroundColor: design === 'neumorphic' ? 'transparent' : (typography?.background ? 'var(--vs-img-bg)' : 'var(--gray-2)'),
            fontFamily: "'Libre Franklin', sans-serif"
          }}
        >
          <Flex direction="column" align="center" gap="2">
            <Icon 
              name='image' 
              width="32" 
              height="32" 
              style={{ color: 'var(--vs-img-text)', opacity: 0.5 }} 
            />
            <Text size="1" weight="medium" style={{ color: 'var(--vs-img-text)', opacity: 0.8 }}>
              No Image
            </Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );

  if (aspectratio) {
    return (
      <Box style={{ width, flexShrink: 0 }}>
        <AspectRatio ratio={aspectratio}>
          {content}
        </AspectRatio>
      </Box>
    );
  }

  return (
    <Box style={{ width, height: height || 'auto', flexShrink: 0 }}>
      {content}
    </Box>
  );
};