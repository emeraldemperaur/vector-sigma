import { XFormQuery, XFormType } from "./voltron";

export const avatarInputType = ["avatar", "avatarinput", "avatar-input", "input-avatar", "inputavatar"];
export const buttonInputType = ["button", "buttoninput", "button-input", "input-button", "inputbutton"];
export const checkboxInputType = ["checkbox", "checkboxes", "checkboxinput", "chechbox-input", "input-checkbox", "inputcheckbox"];
export const datePickerInputType = ["datepicker", "datepickerinput", "datepicker-input", "input-datepicker", "inputdatepicker"];
export const dateRangePickerInputType = ["daterangepicker", "daterangepickerinput", "daterangepicker-input", "input-daterangepicker", "inputdaterangepicker"];
export const dateTimePickerInputType = ["datetimepicker", "datetimepickerinput", "datetimepicker-input", "input-datetimepicker", "inputdatetimepicker"];
export const dropdownInputType = ["dropdown", "dropdowninput", "dropdown-input", "input-dropdown", "inputdropdown"];
export const fileInputType = ["file", "fileinput", "file-input", "input-file", "inputfile"];
export const fileMultipleInputType = ["filemultiple", "filemultipleinput", "filemultiple-input", "input-filemultiple", "inputfilemultiple"];
export const imageOutputType = ["image", "imageoutput", "image-output", "output-image", "outputimage"];
export const textInputType = ["text", "textinput", "text-input", "input-text", "inputtext"];
export const passwordInputType = ["password", "passwordinput", "password-input", "input-password", "inputpassword"];
export const phoneInputType = ["phone", "phoneinput", "phone-input", "input-phone", "inputphone"];
export const creditCardInputType = ["creditcard", "creditcardinput", "creditcard-input", "input-creditcard", "inputcreditcard"];
export const currencyInputType = ["currency", "currencyinput", "currency-input", "input-currency", "inputcurrency"];
export const stockInputType = ["stock", "stockinput", "stock-input", "input-stock", "inputstock"];
export const radioInputType = ["radio", "radioinput", "radio-input", "input-radio", "inputradio", "radiogroup", "radiogroup-input"];
export const selectInputType = ["select", "selectinput", "select-input", "input-select", "inputselect", "optionselect", "optionselect-input", "input-optionselect"];
export const selectMultipleInputType = ["selectmultiple", "selectmultipleinput", "selectmultiple-input", "input-selectmultiple", "inputselectmultiple"];
export const sliderInputType = ["slider", "sliderinput", "slider-input", "input-slider", "inputslider"];
export const rangeSliderInputType = ["range", "rangeslider", "rangeinput", "rangesliderinput", "rangeslider-input", "range-input", "input-rangeslider", "inputrangeslider"];
export const toggleInputType = ["toggle", "switch", "toggleinput", "toggle-input", "input-toggle", "inputtoggle"];
export const sectionTitleOutputType = ["title", "xtitle", "sectiontitle", "titlesection"];
export const conditionalInputType = ["conditional", "conditionaltoggle", "conditionalcheckbox", "conditionalselect", "conditional-toggle", "conditional-select", "conditional-checkbox"];

// --- Helper to extract Formik initial values from the clean schema ---
 export const generateInitialValues = (schema: XFormType) => {
    const initials: Record<string, any> = {};
    
    const traverseQueries = (queries: XFormQuery[]) => {
      queries.forEach(query => {
        // Assign defaultValue if exists or assign empty string/null
        initials[query.inputAlias] = query.defaultValue ?? "";
        
        // Nested/toggled input, recursive value extract
        if (query.toggledInput) {
          traverseQueries([query.toggledInput]);
        }
      });
    };

    schema.model.forEach(section => traverseQueries(section.queries));
    return initials;
  };
