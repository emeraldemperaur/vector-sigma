import React from "react";
import { Row } from "layouts/row/row";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import type { TextProps } from '@radix-ui/themes';
import '../../styles/main.scss'

type xTitleProps = TextProps & {
  title: string, iconname?: string, width: number, 
  textColor?: string, backgroundColor: string, newRow?: boolean, fontFamily?: string, 
  subTitle?: string
}

export const SectionTitle = ({
    title, iconname, textColor = "#FFFFFF", 
    backgroundColor = "#000000", 
    fontFamily, ...props}: xTitleProps) => {
    return(
    <>
    <Row>
        <Column span={12} newLine={true}>
            <div id="" style={{ backgroundColor: backgroundColor}} className='core-input-section-ribbon'>
                        <p style={{color: textColor, fontFamily: fontFamily ? fontFamily : 'inherit'}} className='core-input-section-text'>
                            <Icon name={iconname || "input"}/>&nbsp;{title}
                        </p>
                        {props.subTitle ? 
                        <>
                        <p style={{color: textColor, fontFamily: fontFamily ? fontFamily : 'inherit'}} className='core-input-section-text'>
                            {props.subTitle}
                        </p>
                        </> 
                        : null}
            </div>
        </Column>
    </Row>
    </>
    )
};