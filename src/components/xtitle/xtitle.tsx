import React from "react";
import { Row } from "layouts/row/row";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss'

export const xTitle = (
    alias: string, title: string, iconname: string, textColor: string = "#FFFFFF", 
    backgroundColor: string = "#000000", fontFamily: string) => {
    return(
    <>
    <Row>
        <Column span={12} newLine={true}>
            <div style={{ backgroundColor: backgroundColor}} className='core-input-section-ribbon'>
                        <p style={{color: textColor, fontFamily: fontFamily ? fontFamily : 'inherit'}} className='core-input-section-text'>
                            <Icon name={iconname}/>&nbsp;{title}
                        </p>
            </div>
        </Column>
    </Row>
    </>
    )
};