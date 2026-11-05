import React, { ReactNode, useEffect, useRef, useState, useId } from "react";
import { Heading, Separator, Flex, Text, Box, Badge } from '@radix-ui/themes';
import { Column } from "layouts/column/column"; 
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type SectionTitleDesign = 
  | 'section-outline' 
  | 'section-material' 
  | 'section-neumorphic'
  | 'outline'
  | 'material'
  | 'neumorphic';

/**
 * SectionTitleProps Interface
 * @description Configuration properties for the VectorSigma SectionTitle component.
 * Provides structural section branding, typography hierarchy, optional action badges,
 * and three design language implementations (Outline, Material, n8n Neumorphic).
 */
export interface SectionTitleProps {
  /**
   * Primary headline string rendered in the SectionTitle header.
   * @example "Personal & Account Security"
   */
  title: string;

  /**
   * Grid column span allocation (1 - 12 based on the parent layout).
   * @default 12
   * @example 12
   */
  width?: number;

  /**
   * Forces the section title to break onto a new grid row.
   * @default true
   */
  newRow?: boolean;

  /**
   * Radix UI typography scale size for the primary heading.
   * @default "5"
   */
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  /**
   * Secondary explanatory subtitle or guide text rendered below the headline.
   * @example "Configure authentication preferences and cryptographic keys."
   */
  subTitle?: string;

  /**
   * Radix UI typography scale size for the subtitle.
   * @default "2"
   */
  subsize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  /**
   * Content horizontal alignment across viewports.
   * @default "left"
   */
  align?: "left" | "center" | "right";

  /**
   * Optional contextual pill badge or tag rendered beside the title.
   * @example "Step 2 of 4"
   * @example "Required"
   */
  tag?: string;

  /**
   * Decorative or semantic icon rendered alongside the title headline.
   * Accepts any ReactNode (e.g. `<Icon name="shield" />`).
   */
  icon?: ReactNode;

  /**
   * Toggles the bottom horizontal divider line.
   * @default true
   */
  withSeparator?: boolean;

  /**
   * The aesthetic design variation of the section container and separator.
   * - `section-outline` / `outline`: Minimalist hairline rule with accent indicator (Default).
   * - `section-material` / `material`: Card surface elevation with bottom indicator bar.
   * - `section-neumorphic` / `neumorphic`: n8n-inspired soft-UI recessed groove and extruded icon plate.
   * @default "section-outline"
   */
  variant?: SectionTitleDesign;

  /**
   * Alias for `variant` matching standard VectorSigma prop conventions.
   */
  titleVariant?: SectionTitleDesign;

  /**
   * Explicit background color for the section title block.
   */
  backgroundColor?: string;

  /**
   * Direct color override for the primary title text.
   */
  titleColor?: string;

  /**
   * Direct color override for the subtitle text.
   */
  subtitleColor?: string;

  /**
   * CSS letter-spacing value applied to headings and subtitles.
   * @default "-0.015em"
   */
  letterSpacing?: string;

  /**
   * Centralized typography and color overrides. Allows explicit brand targeting
   * across background, stroke borders, text, and accent indicator colors.
   */
  typography?: {
    /** Overrides container background color */
    background?: string;
    /** Overrides divider line or border stroke color */
    stroke?: string;
    /** Overrides heading text color */
    titleColor?: string;
    /** Overrides subtitle text color */
    subtitleColor?: string;
    /** Overrides accent highlights and indicator bars */
    accent?: string;
  };

  /**
   * Outer vertical margin block applied to the section title (e.g. "24px 0").
   * @default "28px 0"
   */
  marginBlock?: string;

  /**
   * Optional custom SCSS/CSS class selector.
   */
  className?: string;

  /**
   * Inline React CSS styles applied to the outer container.
   */
  style?: React.CSSProperties;
}

export type TitleProps = SectionTitleProps;

export const SectionTitle = ({
  title,
  width = 12,
  newRow = true,
  size = "5",
  subsize = "2",
  subTitle,
  align = "left",
  tag,
  icon,
  withSeparator = true,
  variant,
  titleVariant,
  backgroundColor,
  titleColor,
  subtitleColor,
  letterSpacing = "-0.015em",
  typography,
  marginBlock = "28px 0",
  className,
  style,
}: SectionTitleProps) => {

  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = titleVariant || variant || 'section-outline';

  useEffect(() => {
    if (resolvedVariant.includes('neumorphic') && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || backgroundColor || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -18),
        '--neu-shadow-light': adjustColor(computedBg, 18),
      } as React.CSSProperties);
    }
  }, [resolvedVariant, typography?.background, backgroundColor]);

  const typographyVars = {
    '--vs-st-bg': typography?.background || backgroundColor || 'transparent',
    '--vs-st-stroke': typography?.stroke || 'var(--gray-6)',
    '--vs-st-title': typography?.titleColor || titleColor || 'var(--gray-12)',
    '--vs-st-sub': typography?.subtitleColor || subtitleColor || 'var(--gray-10)',
    '--vs-st-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  } as const;

  const textAlignMap = {
    left: 'left',
    center: 'center',
    right: 'right',
  } as const;

  return (
    <Column span={width} newLine={newRow} style={{ margin: marginBlock }}>
      <Flex
        ref={containerRef}
        direction="column"
        gap="2"
        className={`vs-section-title-root vs-${resolvedVariant} ${className || ''}`}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: "'Libre Franklin', sans-serif",
          textAlign: textAlignMap[align],
          ...typographyVars,
          ...neuVars,
          ...style,
        }}
      >
        <style>
          {`
            .vs-section-title-root {
              transition: all 0.2s ease-in-out;
            }

            .vs-section-heading {
              color: var(--vs-st-title) !important;
              font-family: inherit !important;
              letter-spacing: ${letterSpacing} !important;
              line-height: 1.25 !important;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .vs-section-subtitle {
              color: var(--vs-st-sub) !important;
              font-family: inherit !important;
              line-height: 1.5 !important;
              letter-spacing: normal !important;
            }

            .vs-section-tag {
              font-family: inherit;
              font-weight: 600;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              font-size: 0.7rem;
              padding: 2px 8px;
              border-radius: 9999px;
            }

            .vs-section-icon-plate {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: var(--vs-st-accent);
              transition: transform 0.2s ease;
            }

        
            .vs-section-outline .vs-section-separator {
              height: 1px;
              background-color: var(--vs-st-stroke);
              width: 100%;
              margin-top: 8px;
            }

           
            .vs-section-material {
              background-color: var(--vs-st-bg);
              border-radius: 6px;
              padding: ${backgroundColor || typography?.background ? '16px 20px' : '0'};
              box-shadow: ${backgroundColor || typography?.background ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'};
            }
            .vs-section-material .vs-section-separator-container {
              position: relative;
              width: 100%;
              height: 2px;
              background-color: var(--gray-4);
              margin-top: 8px;
              border-radius: 2px;
              overflow: hidden;
            }
            .vs-section-material .vs-section-separator-accent {
              position: absolute;
              left: ${align === 'right' ? 'auto' : align === 'center' ? 'calc(50% - 24px)' : '0'};
              right: ${align === 'right' ? '0' : 'auto'};
              top: 0;
              bottom: 0;
              width: 48px;
              background-color: var(--vs-st-accent);
              border-radius: 2px;
            }

        
            .vs-section-neumorphic {
              background-color: var(--vs-st-bg);
              border-radius: 12px;
              padding: ${backgroundColor || typography?.background ? '18px 22px' : '0'};
              box-shadow: ${backgroundColor || typography?.background ? '6px 6px 14px var(--neu-shadow-dark), -6px -6px 14px var(--neu-shadow-light)' : 'none'};
            }
            .vs-section-neumorphic .vs-section-icon-plate {
              width: 34px;
              height: 34px;
              border-radius: 10px;
              background-color: var(--neu-bg);
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
            }
            .vs-section-neumorphic .vs-section-separator {
              height: 3px;
              width: 100%;
              margin-top: 10px;
              border-radius: 9999px;
              background: var(--neu-bg);
              box-shadow: inset 1.5px 1.5px 3px var(--neu-shadow-dark), inset -1.5px -1.5px 3px var(--neu-shadow-light);
            }
          `}
        </style>

        <Flex
          align="center"
          justify={justifyMap[align] as any}
          gap="3"
          wrap="wrap"
          style={{ width: '100%' }}
        >
          {icon && (
            <Box className="vs-section-icon-plate">
              {icon}
            </Box>
          )}

          <Heading
            id={titleId}
            as="h2"
            size={size}
            weight="bold"
            className="vs-section-heading"
          >
            {title}
          </Heading>

          {tag && (
            <Badge
              variant={resolvedVariant.includes('neumorphic') ? "surface" : "soft"}
              color="gray"
              className="vs-section-tag"
              style={{
                backgroundColor: resolvedVariant.includes('neumorphic') 
                  ? 'transparent' 
                  : typography?.accent 
                    ? adjustColor(typography.accent, 88) 
                    : undefined,
                color: typography?.accent || 'var(--gray-11)',
                boxShadow: resolvedVariant.includes('neumorphic')
                  ? '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)'
                  : undefined,
              }}
            >
              {tag}
            </Badge>
          )}
        </Flex>

        {subTitle && (
          <Text
            size={subsize}
            className="vs-section-subtitle"
            style={{
              maxWidth: align === 'center' ? '680px' : '820px',
              margin: align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : undefined,
            }}
          >
            {subTitle}
          </Text>
        )}

        {withSeparator && (
          resolvedVariant.includes('material') ? (
            <div className="vs-section-separator-container" aria-hidden="true">
              <div className="vs-section-separator-accent" />
            </div>
          ) : (
            <Separator
              size="4"
              className="vs-section-separator"
              aria-hidden="true"
            />
          )
        )}
      </Flex>
    </Column>
  );
};