import React from "react";
import { Heading, Separator, Flex, Text } from '@radix-ui/themes';
import { Column } from "layouts/column/column"; 
import '../../styles/main.scss';

interface TitleProps {
    /**
     * * The required title text for the SectionTitle component. 
     * * @example
     * title="VΣ User Questionnaire"
     */
    title: string;
    /**
     * * The required viewport column width for the Toggle input field.
     * i.e. 1 - 12
     * * @example
     * width={5}
     */
    width?: number;
    /**
     * * Option to render Toggle input field on new row.
     * * @example
     * newRow
     */       
    newRow?: boolean; 
    /**
     * * Option to specify a title font size.
     * * @example
     * size="2"
     */    
    size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
     /**
     * * Option to specify a subtitle text for the SectionTitle component. 
     * * @example
     * subTitle="VΣ AI Reserch Group"
     */
    subTitle?: string;
    /**
     * * Option to specify a subtitle font size.
     * * @example
     * subsize="1"
     */
    subsize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    /**
     * * Option to specify a title text alignment for the SectionTitle component.
     * Default: "left"
     * * @example
     * align="right"
     */
    align?: "left" | "center" | "right";
     /**
     * * Option to render a bottom visual separator for the SectionTitle component.
     * * @example
     * withSeparator
     */
    withSeparator?: boolean;
    /**
     * * Option to specify the .scss class selector for the SectionTitle component.
     * * @example
     * className="teletraan-1-sectiontitle"
     */
    className?: string;
    /**
     * * Option to specify the background color for the SectionTitle component.
     * * @example
     * backgroundColor="#800020"
     */
    backgroundColor?: string;
     /**
    * * Option to render SectionTitle component with icon passed as a ReactNode {}.
    * * @example
    * icon={<Icon name="stack"/>}
    */
    icon?: React.ReactNode;
    /**
     * * Option to specify the title text color for the SectionTitle component.
     * * @example
     * titleColor="#ffffff"
     */
    titleColor?: string;
    /**
     * * Option to specify the subtitle text color for the SectionTitle component.
     * * @example
     * subtitleColor="#ffffff"
     */
    subtitleColor?: string;
    /**
     * * Option to specify the title and subtitle text letter spacing (em) for the SectionTitle component.
     * * @example
     * letterSpacing="0.13em"
     */
    letterSpacing?:string;
}

export const SectionTitle = ({
    title,
    width = 12, 
    newRow = true, 
    size = "5",
    subsize = "2",
    subTitle,
    align = "left",
    letterSpacing = "0.13em",
    withSeparator = true,
    className,
    backgroundColor,
    icon,
    titleColor,
    subtitleColor
}: TitleProps) => {

    const justifyMap = {
        left: 'start',
        center: 'center',
        right: 'end'
    };

    return (
        <Column span={width} newLine={newRow} style={{marginBottom: '33px', marginTop: '33px'}}>
            <Flex 
                direction="column" 
                gap="2" 
                className={className}
                style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    marginTop: '33px',
                    marginBottom: '33px',
                    textAlign: align,
                    backgroundColor: backgroundColor || 'transparent',
                    padding: backgroundColor ? 'var(--space-3) var(--space-4)' : '0',
                    borderRadius: backgroundColor ? 'var(--radius-3)' : '0',
                }} 
            >
                <Flex 
                    align="center" 
                    justify={justifyMap[align] as "start" | "center" | "end"} 
                    gap="3"
                    style={{ width: '100%' }}
                >
                    {icon && (
                        <Flex align="center" justify="center" style={{ color: titleColor || 'var(--gray-12)' }}>
                            {icon}
                        </Flex>
                    )}
                    
                    <Heading
                        size={size}
                        weight="bold"
                        style={{
                            color: titleColor || 'var(--gray-12)',
                            lineHeight: '1.2',
                            letterSpacing: `${letterSpacing}`
                        }}
                    >
                        {title}
                    </Heading>
                </Flex>
                
                {subTitle && (
                    <Text 
                        size={subsize} 
                        style={{ 
                            color: subtitleColor || 'var(--gray-11)',
                            maxWidth: '80%', 
                            margin: align === 'center' ? '0 auto' : undefined, 
                            letterSpacing: `${letterSpacing}`
                        }}
                    >
                        {subTitle}
                    </Text>
                )}

                {withSeparator && (
                    <Separator 
                        size="4" 
                        style={{ 
                            width: '100%', 
                            marginTop: '4px',
                            backgroundColor: 'var(--gray-6)' 
                        }} 
                    />
                )}
            </Flex>
        </Column>
    );
};