import React, { ReactNode, useEffect, useRef, useState, createContext, useContext, useId } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { Flex, Text, Box } from '@radix-ui/themes';
import { Column } from "layouts/column/column"; 
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type AccordionDesign = 'material' | 'outline' | 'neumorphic';

interface AccordionContextValue {
  design: AccordionDesign;
  brandcolor?: string;
  titleColor?: string;
}

const AccordionContext = createContext<AccordionContextValue>({ design: 'outline' });

export interface AccordionProps {
  /**
   * The design variation of the Accordion.
   * - `outline`: Minimalist enterprise border rules (Default).
   * - `material`: Cohere-inspired elevated card surface with indicator accent borders.
   * - `neumorphic`: n8n-inspired soft-UI discrete extruded panels.
   * @default "outline"
   * @example design="neumorphic"
   */
  design?: AccordionDesign;

  /**
   * The sectionId of the item that should be open by default.
   * Renders all accordion sections in closed state if undefined.
   * @example defaultOpenId="section-1"
   */
  defaultOpenId?: string;

  /**
   * Option to allow multiple sections to be open at the same time.
   * When false, opening one section automatically closes others.
   * @default false
   * @example allowMultiple={true}
   */
  allowMultiple?: boolean;

  /**
   * Option to pass a custom hex, rgb, or css variable to color the background
   * of the AccordionItem headers.
   * @example brandcolor="var(--accent-3)"
   */
  brandcolor?: string;

  /**
   * Option to specify the text and icon color of the AccordionItem headers.
   * Useful when using a dark brandcolor to ensure legibility.
   * @example titleColor="#ffffff"
   */
  titleColor?: string;

  /**
   * The required viewport column width for the Accordion component (1 - 12).
   * Stacks to full-width automatically on small mobile viewports.
   * @default 12
   * @example width={12}
   */
  width?: number;

  /**
   * Option to render Accordion component on a new row.
   * @default false
   * @example newRow
   */
  newRow?: boolean;

  /**
   * Option to specify the .scss class selector for the Accordion.
   * @example className="teletraan-1-accordion"
   */
  className?: string;

  /**
   * Option to inject custom CSS to the Accordion wrapper.
   * @example style={{ margin: "20px 0" }}
   */
  style?: React.CSSProperties;

  /**
   * The AccordionItem child components.
   */
  children: ReactNode;
}

export interface AccordionItemProps {
  /**
   * The unique identifier for this specific accordion section.
   * @example sectionId="faq-1"
   */
  sectionId: string;

  /**
   * The header or trigger text for this accordion section.
   * @example title="What is the VΣ Protocol?"
   */
  title: ReactNode | string;

  /**
   * The subheader or trigger text for this accordion section.
   * @example subtitle="Get in touch to learn more"
   */
  subtitle?: ReactNode | string;

  /**
   * The content revealed when the section is opened.
   */
  children: ReactNode;

  /**
   * Option to disable an accordion item section.
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  /**
   * Option to append a custom icon to the left of the title.
   * @example icon={<Icon name="info" />}
   */
  icon?: ReactNode;
}

export const Accordion = ({
  design = 'outline',
  defaultOpenId = "",
  allowMultiple = false,
  brandcolor,
  titleColor,
  width = 12,
  newRow,
  className,
  style,
  children
}: AccordionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (design === 'neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = brandcolor || (parentBg && parentBg !== 'transparent' ? parentBg : '#ecf0f3');
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [design, brandcolor]);

  const sharedRootProps = {
    className: `vs-accordion-root vs-accordion-root-${design} ${className || ''}`,
    children
  };

  return (
    <AccordionContext.Provider value={{ design, brandcolor, titleColor }}>
      <Column span={width} newLine={newRow}>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            fontFamily: "'Libre Franklin', sans-serif",
            ...(brandcolor ? { '--accordion-header-bg': brandcolor } : {}),
            ...(titleColor ? { '--accordion-title-color': titleColor } : {}),
            ...neuVars,
            ...style,
          } as React.CSSProperties}
        >
          <style>
            {`
              .vs-accordion-root {
                width: 100%;
                box-sizing: border-box;
                font-family: inherit;
              }

              @keyframes vs-accordion-slide-down {
                from { height: 0; opacity: 0; }
                to { height: var(--radix-accordion-content-height); opacity: 1; }
              }
              @keyframes vs-accordion-slide-up {
                from { height: var(--radix-accordion-content-height); opacity: 1; }
                to { height: 0; opacity: 0; }
              }

              .vs-accordion-content {
                overflow: hidden;
              }
              .vs-accordion-content[data-state='open'] {
                animation: vs-accordion-slide-down 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .vs-accordion-content[data-state='closed'] {
                animation: vs-accordion-slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }

              .vs-accordion-trigger {
                all: unset;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                padding: 14px 18px;
                box-sizing: border-box;
                cursor: pointer;
                user-select: none;
                transition: filter 0.15s ease, background-color 0.15s ease;
                background-color: var(--accordion-header-bg, transparent);
              }
              .vs-accordion-trigger:focus-visible {
                outline: 2px solid var(--accent-9);
                outline-offset: -2px;
              }
              .vs-accordion-trigger:disabled {
                cursor: not-allowed;
                opacity: 0.5;
              }

              .vs-accordion-chevron {
                transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
                color: var(--accordion-title-color, var(--gray-11));
                flex-shrink: 0;
                margin-left: 12px;
              }
              .vs-accordion-trigger[data-state='open'] .vs-accordion-chevron {
                transform: rotate(180deg);
                color: var(--accordion-title-color, var(--accent-9));
              }

              /* 
                 FIX: Use brightness filter on hover instead of hardcoded background colors 
                 so custom brand colors are preserved and remain legible.
              */
              .vs-accordion-trigger:hover:not(:disabled) {
                 filter: brightness(0.92);
              }

              .vs-accordion-root-outline {
                border: 1px solid var(--gray-6);
                border-radius: 8px;
                background-color: transparent;
                overflow: hidden;
              }
              .vs-accordion-item-outline {
                border-bottom: 1px solid var(--gray-6);
                transition: background-color 0.15s ease;
              }
              .vs-accordion-item-outline:last-child {
                border-bottom: none;
              }

              .vs-accordion-root-material {
                border-radius: 8px;
                background-color: var(--color-surface);
                box-shadow: 0 2px 5px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
                border: 1px solid var(--gray-5);
                overflow: hidden;
              }
              .vs-accordion-item-material {
                border-bottom: 1px solid var(--gray-4);
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                border-left: 3px solid transparent;
              }
              .vs-accordion-item-material:last-child {
                border-bottom: none;
              }
              .vs-accordion-item-material[data-state='open'] {
                border-left-color: var(--accent-9);
                background-color: var(--color-surface);
              }

              .vs-accordion-root-neumorphic {
                display: flex;
                flex-direction: column;
                gap: 14px;
              }
              .vs-accordion-item-neumorphic {
                background-color: var(--neu-bg);
                border-radius: 12px;
                box-shadow: 6px 6px 14px var(--neu-shadow-dark), -6px -6px 14px var(--neu-shadow-light);
                overflow: hidden;
                transition: box-shadow 0.25s ease, transform 0.2s ease;
              }
              .vs-accordion-item-neumorphic:not([data-disabled]):hover {
                box-shadow: 4px 4px 10px var(--neu-shadow-dark), -4px -4px 10px var(--neu-shadow-light);
              }
              .vs-accordion-item-neumorphic .vs-accordion-divider {
                height: 1px;
                margin: 0 18px;
                background: var(--neu-bg);
                box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light);
              }

              /* Content Padding Area */
              .vs-accordion-body {
                padding: 16px 20px 20px 20px;
                box-sizing: border-box;
              }
            `}
          </style>

          {allowMultiple ? (
            <RadixAccordion.Root
              type="multiple"
              defaultValue={defaultOpenId ? [defaultOpenId] : undefined}
              {...sharedRootProps}
            />
          ) : (
            <RadixAccordion.Root
              type="single"
              collapsible={true}
              defaultValue={defaultOpenId || undefined}
              {...sharedRootProps}
            />
          )}
        </div>
      </Column>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({
  sectionId,
  title,
  subtitle,
  children,
  disabled = false,
  icon,
}: AccordionItemProps) => {
  const { design } = useContext(AccordionContext);
  const headerId = useId();

  return (
    <RadixAccordion.Item
      value={sectionId}
      disabled={disabled}
      className={`vs-accordion-item-${design}`}
    >
      <RadixAccordion.Header style={{ margin: 0, padding: 0 }}>
        <RadixAccordion.Trigger
          id={headerId}
          className="vs-accordion-trigger"
          aria-disabled={disabled}
        >
          <Flex
            align="center"
            gap="3"
            style={{
              flex: 1,
              minWidth: 0,
              paddingRight: '8px',
            }}
          >
            {icon && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--accordion-title-color, var(--accent-9))',
                }}
              >
                {icon}
              </Box>
            )}

            <Flex
              direction={{ initial: 'column', sm: subtitle ? 'row' : 'column' }}
              align={{ initial: 'start', sm: subtitle ? 'baseline' : 'start' }}
              gap={{ initial: '1', sm: subtitle ? '3' : '0' }}
              style={{
                minWidth: 0,
                overflow: 'hidden',
                flexWrap: 'wrap',
              }}
            >
              <Text
                size="3"
                weight="bold"
                style={{
                  color: 'var(--accordion-title-color, var(--gray-12))',
                  lineHeight: '1.3',
                  wordBreak: 'break-word',
                }}
              >
                {title}
              </Text>

              {subtitle && (
                <Text
                  size="2"
                  weight="regular"
                  style={{
                    color: 'var(--accordion-title-color, var(--gray-10))',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </Flex>
          </Flex>

          <Icon
            name="chevrondown"
            height="18"
            width="18"
            className="vs-accordion-chevron"
            aria-hidden="true"
          />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>

      <RadixAccordion.Content className="vs-accordion-content">
        {design === 'neumorphic' && <div className="vs-accordion-divider" aria-hidden="true" />}
        <Box className="vs-accordion-body">
          <Text size="2" color="gray" as="div">
            {children}
          </Text>
        </Box>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
};