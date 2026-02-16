import React from "react";
import { Heading, Separator, Flex, Text } from '@radix-ui/themes';
import { Column } from "layouts/column/column"; 
import '../../styles/main.scss';

interface TitleProps {
    title: string;
    width?: number;       
    newRow?: boolean;     
    size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    subsize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    subtitle?: string;
    align?: "left" | "center" | "right";
    withSeparator?: boolean;
    className?: string;
    backgroundcolor?: string;
    icon?: React.ReactNode;
}

export const SectionTitle = ({
    title,
    width = 12, 
    newRow = true, 
    size = "5",
    subsize = "2",
    subtitle,
    align = "left",
    withSeparator = true,
    className,
    backgroundcolor,
    icon
}: TitleProps) => {
    const justifyMap = {
        left: 'start',
        center: 'center',
        right: 'end'
    };

    return (
        <Column span={width} newLine={newRow}>
            <Flex 
                direction="column" 
                gap="2" 
                className={className}
                style={{ 
                    width: '100%', 
                    marginBottom: 'var(--space-2)',
                    textAlign: align,
                    backgroundColor: backgroundcolor || 'transparent',
                    padding: backgroundcolor ? 'var(--space-3) var(--space-4)' : '0',
                    borderRadius: backgroundcolor ? 'var(--radius-3)' : '0',
                }} 
            >
                <Flex 
                    align="center" 
                    justify={justifyMap[align] as "start" | "center" | "end"} 
                    gap="3"
                    style={{ width: '100%' }}
                >
                    {icon && (
                        <Flex align="center" justify="center" style={{ color: 'var(--gray-12)' }}>
                            {icon}
                        </Flex>
                    )}
                    
                    <Heading
                        size={size}
                        weight="bold"
                        style={{
                            color: 'var(--gray-12)',
                            lineHeight: '1.2'
                        }}
                    >
                        {title}
                    </Heading>
                </Flex>
                
                {subtitle && (
                    <Text size={subsize} color="gray" style={{ maxWidth: '80%', margin: align === 'center' ? '0 auto' : undefined }}>
                        {subtitle}
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