import React from "react";
import { Theme } from "@radix-ui/themes";
import './styles/main.scss';

export const vectorSigma = (name: String) => {
    return (
         <>
            <Theme>
                Vector {name}
            </Theme>
         </>
    )
}