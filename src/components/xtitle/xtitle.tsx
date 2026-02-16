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
    className
}: TitleProps) => {
    return (
        <Column span={width} newLine={newRow}>
            <Flex 
                direction="column" 
                gap="2" 
                className={className}
                style={{ 
                    width: '100%', 
                    marginBottom: 'var(--space-2)',
                    textAlign: align 
                }} 
            >
                <Heading
                    size={size}
                    weight="bold"
                    style={{
                        width: '100%',
                        color: 'var(--gray-12)',
                        lineHeight: '1.2'
                    }}
                >
                    {title}
                </Heading>
                
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