import React, { useEffect } from 'react';
import { XFormSchema, XFormType, XFormQuery, SectionSchema } from './utils/voltron';
import { normalizeXForm } from './utils/minerva'; 
import { Teletraan1, Teletraan1Props } from './teletraan1';
import { z } from "zod";
import { Theme, Button, Flex, ThemeProps } from '@radix-ui/themes';
import { Formik, Form, useFormikContext, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import './styles/main.scss';

export interface VectorSigmaRenderProps<T extends Record<string, any> = Record<string, any>> extends Omit<Teletraan1Props, 'xFormModel'> {
    /**
     * * Optional callback fired when the form is submitted and passes validation.
     * Receives normalized xForm form values, developer access to Formik action helper methods, and the VectorSigma class instance.
     * * @example
     * onSubmit={async (values, actions, instance) => {
        // Send data to API
        await axios.post('/api/upload', instance.getxForm());
        await axios.post('/api/submit', values);
        // Track completion time using 'instance'
        console.log(`Form completed in ${(instance.timeSubmitted! - instance.timeCreated) / 1000}s`);
        // Clear form after success
        actions.resetForm(); 
    }}
     */
    onSubmit?: (
        values: T, 
        actions: FormikHelpers<T>, 
        instance: VectorSigma<T>
    ) => void | Promise<any>;
    /**
     * * Optional Radix UI Theme configuration. 
     * Enables developer theming extensibility to align xForm appearance with an extant application design system.
     * * https://www.radix-ui.com/themes/docs/components/theme
     * @example
     * theme={{ appearance: 'dark', accentColor: 'ruby', radius: 'large' }}
     */
    theme?: Omit<ThemeProps, 'children'>;
    /**
     * * Optional toggle to disable the default xForm bottom submit button.
     * Allows developers to implement custom Submit, Save or Validate buttons outside xForm component.
     * @example
     * buttonOverride={true}
     */
    buttonOverride?: boolean;
}

const FormikStateObserver = <T extends Record<string, any>>({ instance }: { instance: VectorSigma<T> }) => {
    const formikContext = useFormikContext<T>();
    
    useEffect(() => {
        instance.values = formikContext.values as Partial<T>;
        instance.errors = formikContext.errors;
        
        if (!instance.actions) {
            instance.actions = {
                submitForm: formikContext.submitForm,
                resetForm: formikContext.resetForm,
                setValues: formikContext.setValues,
                setFieldValue: formikContext.setFieldValue,
                setFieldError: formikContext.setFieldError,
                setFieldTouched: formikContext.setFieldTouched,
                validateForm: formikContext.validateForm,
                setSubmitting: formikContext.setSubmitting,
            };
        }

        // Status code 0 (Empty) to 
        // Status code 1 (In Progress) :: user typing detected
        if (formikContext.dirty && instance.statusCode === 0) {
            instance.statusCode = 1;
            instance.timeInProgress = Date.now();
        }
    }, [formikContext, instance]);

    return null; 
};

export interface VectorSigmaActions<T> {
    submitForm: () => Promise<void | undefined>;
    resetForm: (nextState?: Partial<import('formik').FormikState<T>>) => void;
    setValues: (values: React.SetStateAction<T>, shouldValidate?: boolean) => Promise<void | import('formik').FormikErrors<T>>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | import('formik').FormikErrors<T>>;
    setFieldError: (field: string, message: string | undefined) => void;
    setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => Promise<void | import('formik').FormikErrors<T>>;
    validateForm: (values?: any) => Promise<import('formik').FormikErrors<T>>;
    setSubmitting: (isSubmitting: boolean) => void;
}

export class VectorSigma<T extends Record<string, any> = Record<string, any>> {
    public isValid: boolean = false;
    public formObject: XFormType;
    public values: Partial<T> = {};
    public errors: Record<string, any> = {};
    public actions: VectorSigmaActions<T> | null = null;
    public statusCode: 0 | 1 | 2 = 0; // 0 = Created/Empty | 1 = In Progress | 2 = Submitted
    public timeCreated: number;
    public timeInProgress: number | null = null;
    public timeSubmitted: number | null = null;
    public isSubmitting: boolean = false;

    /**
     * Initializes VectorSigma instance.
     * @param initializer JSON string literal or a JavaScript {} matching XFormType.
     * When undefined, initializes base xForm object scaffold for use with VectorSigma builder methods.
     */
    constructor(initializer?: string | XFormType | unknown) {
        this.timeCreated = Date.now();
        this.formObject = {
            uuid: crypto.randomUUID ? crypto.randomUUID() : `form-${Date.now()}`,
            name: 'Untitled Form',
            model: []
        };

        if (initializer) {
            this.validateAndSet(initializer);
        }
    }

    /**
     * Validates JSON juxtaposed with the XFormSchema.
     * Raises DX (developer-friendly) errors if the JSON malformed or violates XFormSchema.
     */
    private validateAndSet(input: unknown) {
        let dataToValidate = input;

        if (typeof input === 'string') {
            try {
                dataToValidate = JSON.parse(input);
            } catch (error) {
                throw new Error(`VectorSigma Validation Error: Invalid xForm JSON string provided.\nDetails: ${(error as Error).message}`);
            }
        }

        const result = XFormSchema.safeParse(dataToValidate);
        this.isValid = result.success;

        if (result.success) {
            this.formObject = result.data;
            console.log(`VectorSigma: JSON Validation successful for xForm "${this.formObject.name}".`);
        } else {
            const errorMessages = result.error.issues.map(
                issue => `  - Path: [${issue.path.join('.') || 'root'}] -> ${issue.message}`
            ).join('\n');

            throw new Error(`VectorSigma Validation Error: Invalid xForm Object Schema.\n${errorMessages}`);
        }
    }

    /**
     * Extrapolates Formik InitialValues and Yup Schema based on inputType value data type.
     */
    private buildFormikConfig(sanitizedData: XFormType) {
        const initialValues: Record<string, any> = {};
        const shape: Record<string, any> = {};

        const arrayTypes = [
            "checkbox", "checkboxes", "checkboxinput", "chechbox-input", "input-checkbox", "inputcheckbox", "checkboxgroup-input",
            "filemultiple", "filemultipleinput", "filemultiple-input", "input-filemultiple", "inputfilemultiple",
            "selectmultiple", "selectmultipleinput", "selectmultiple-input", "input-selectmultiple", "inputselectmultiple",
            "countrymultiselect", "countrymultiselectinput", "countrymultiselect-input", "input-countrymultiselect", "inputcountrymultiselect",
            "range", "rangeslider", "rangeinput", "rangesliderinput", "rangeslider-input", "range-input", "input-rangeslider", "inputrangeslider",
            "slider", "sliderinput", "slider-input", "input-slider", "inputslider"
        ];

        const booleanTypes = [
            "toggle", "switch", "toggleinput", "toggle-input", "input-toggle", "inputtoggle",
            "conditionaltoggle", "conditionalcheckbox", "conditional-toggle", "conditional-checkbox"
        ];

        const numberTypes = [
            "currency", "currencyinput", "currency-input", "input-currency", "inputcurrency",
            "stock", "stockinput", "stock-input", "input-stock", "inputstock"
        ];

        const traverseQueries = (queries: XFormQuery[]) => {
            queries.forEach(q => {
                const normalizedType = q.inputType.toLowerCase();

                const isArray = arrayTypes.includes(normalizedType);
                const isBoolean = booleanTypes.includes(normalizedType);
                const isNumber = numberTypes.includes(normalizedType);

                if (q.defaultValue !== undefined && q.defaultValue !== null) {
                    initialValues[q.inputAlias] = q.defaultValue;
                } else if (isArray) {
                    initialValues[q.inputAlias] = []; 
                } else if (isBoolean) {
                    initialValues[q.inputAlias] = false; 
                } else if (isNumber) {
                    initialValues[q.inputAlias] = 0; 
                } else {
                    initialValues[q.inputAlias] = ""; 
                }

                let validator: any;
                if (isArray) {
                    validator = Yup.array();
                } else if (isBoolean) {
                    validator = Yup.boolean();
                } else if (isNumber) {
                    validator = Yup.number();
                } else {
                    validator = Yup.string();
                }

                if (q.isRequired) {
                    const errorMsg = q.errorText || `${q.inputLabel || 'This field'} is required`;
                    if (isArray) {
                        validator = validator.min(1, errorMsg);
                    } else if (isBoolean) {
                        validator = validator.oneOf([true], errorMsg);
                    } else {
                        validator = validator.required(errorMsg);
                    }
                } else {
                    validator = validator.nullable().notRequired();
                }

                shape[q.inputAlias] = validator;

                if (q.toggledInput) {
                    traverseQueries([q.toggledInput]);
                }
            });
        };

        sanitizedData.model.forEach(section => traverseQueries(section.queries));

        this.values = initialValues as Partial<T>;

        return {
            initialValues,
            validationSchema: Yup.object().shape(shape)
        };
    }

    /**
     * Traverses xForm schema object and injects Formik values into respective input queryResponse attributes by `inputAlias`.
     */
    private hydrateQueryResponses(submittedValues: T) {
        const traverseAndHydrate = (queries: XFormQuery[]) => {
            queries.forEach(query => {
                const formikValue = submittedValues[query.inputAlias];   
                query.queryResponse = formikValue !== undefined ? formikValue : null;
                if (query.toggledInput) {
                    traverseAndHydrate([query.toggledInput]);
                }
            });
        };

        this.formObject.model.forEach(section => {
            traverseAndHydrate(section.queries);
        });
    }

    // ==========================================
    // VΣ BUILDER PATTERN METHODS
    // ==========================================

    /**
     * VΣ builder method to set the xForm model's unique universal identifier (uuid) attribute.
     * @param uuid unique universal identifier for xForm object.
     * @example 
     * const xForm97 = new VectorSigma()
     * .setUUID("the-uuid-is-sahelanthropus")
     */
    public setUUID(uuid: string): this {
        this.formObject.uuid = uuid;
        return this;
    }
    /**
     * VΣ builder method to set the xForm model's name attribute.
     * @param name name for xForm object.
     * @example
     * const xForm97 = new VectorSigma()
     * .setName("Wakanda Citizenship Form")
     */
    public setName(name: string): this {
        this.formObject.name = name;
        return this;
    }
    /**
     * VΣ builder method to set the xForm model's branding attribute.
     * @param color brand color hex string for xForm object.
     * @param logo logo image url for xForm object.
     * @param logoPosition logo position for xForm object.
     * @example
     * const xForm97 = new VectorSigma()
     * .setBrand("#000000", brandLogoUrlRef, 'right')
     */
    public setBrand(color: string, logo?: string, logoPosition?: 'left' | 'center' | 'right'): this {
        this.formObject.brandColor = color;
        if (logo) this.formObject.logo = logo;
        if (logoPosition) this.formObject.logoPosition = logoPosition;
        return this;
    }
    /**
     * VΣ builder method to add a Section object to the xForm model.
     * @param section valid schema section object for xForm model.
     * @example 
     * const xForm97 = new VectorSigma()
     * .setBrand("#000000", brandLogoUrlRef, 'right')
     * .addSection({
            sectionId: "bio-data",
            title: "Personal Information",
            icon: "user",
            queries: [
                {
                    queryId: 303,
                    inputType: "text-input",
                    inputAlias: "wakandanName",
                    inputLabel: "Wakandan Name",
                    inputWidth: 7,
                    newRow: false,
                    isRequired: true,
                    errorText: "Wakandan name is required for citizenship applications"
                }
            ]
        })
     */
    public addSection(section: z.infer<typeof SectionSchema>): this {
        this.formObject.model.push(section);
        return this;
    }
    /**
     * VΣ builder method to create a Section object in the xForm model.
     * @param sectionId sectionId string for the xForm model section.
     * @param title title string for the xForm model section.
     * @param subtitle optional subtitle string for the xForm model section.
     * @param icon xForm icon name for the xForm model section.
     * @example 
     * const xForm97 = new VectorSigma()
     * .setBrand("#000000", brandLogoUrlRef, 'right')
     * .createSection('bio-data', 'Personal Information', 'Help us learn more to deliver a bespoke experience', 'user')
     */
    public createSection(sectionId: string, title: string, subtitle?: string, icon?: string): this {
        this.formObject.model.push({ sectionId, title, subtitle, icon, queries: [] });
        return this;
    }
    /**
     * VΣ builder method to add a Query object to the xForm model section by sectionId.
     * @param sectionId sectionId string for the target xForm model section.
     * @param query valid schema query object for the xForm model section.
     * @example 
     * const xForm97 = new VectorSigma()
     * .setBrand("#000000", brandLogoUrlRef, 'right')
     * .createSection('bio-data', 'Personal Information', 'user')
     * .addQueryToSection('bio-data', {
            queryId: 100,
            inputType: 'password-input',
            inputAlias: 'wakanadaPassport',
            inputLabel: 'Wakandan Passport Number',
            inputWidth: 6,
            newRow: false,
            isRequired: true,
            errorText: "A valid passport number is required for citizenship application"
        })
     */
    public addQueryToSection(sectionId: string, query: XFormQuery): this {
        const section = this.formObject.model.find(s => s.sectionId === sectionId);
        if (!section) {
            throw new Error(`VectorSigma Builder Error: Section with ID "${sectionId}" not found.`);
        }
        section.queries.push(query);
        return this;
    }

    // ==========================================
    // VΣ RENDER METHODS
    // ==========================================

    /**
     * VΣ `transform()` method for use with initialized JSON/Object
     * * Apt for integration with JSON data fetched from a backend API or localhost .json file.
     * * Transforms the initialized xForm JSON/JS object, normalizing attribute fields and returning a `<Teletraan1/>` component.
     * @param options VectorSigmaRenderProps -- `VectorSigma` and `Teletraan1` props for VΣ render matrix.
     * @example .transform({ 
         displayMode: 'codex', 
         readOnlyMode: false,
         brandColor: '#800020',
         onSubmit: async (values, actions, instance) => { // <-- onSubmit callback function passed into VectorSigma props
            // Use Case: Send extant xForm object to API
            await axios.post('/api/submit', instance.getxForm());
            // Use Case: Submit and clear form after success
            actions.submitForm();
            actions.resetForm(); 
            },
         onFinish: () => handleFormFinish() // <-- onFinish callback function passed into Teletraan1 (Codex only) props
      })})
     */
    public transform(options?: VectorSigmaRenderProps<T>): React.ReactElement {
        this.validateAndSet(this.formObject); 
        const sanitizedData = normalizeXForm(this.formObject);

        const { initialValues, validationSchema } = this.buildFormikConfig(sanitizedData);
        const isCodexMode = options?.displayMode === 'codex';
        const themeConfig: ThemeProps = {
            appearance: 'inherit', 
            accentColor: 'blue',
            radius: 'medium',
            ...options?.theme
        };
        
        return (
            <Theme {...themeConfig}>
                <Formik<T>
                    initialValues={initialValues as unknown as T}
                    validationSchema={validationSchema}
                    onSubmit={async (values, actions) => {
                        try {
                            this.statusCode = 2;
                            this.timeSubmitted = Date.now();
                            this.hydrateQueryResponses(values);
                            console.log(`VectorSigma xForm Submitted: [${sanitizedData.name}]`, values);
                            
                            if (options?.onSubmit) {
                                await options.onSubmit(values, actions, this);
                            }
                            
                            if (options?.onFinish) {
                                options.onFinish(values as any, actions as any, this as any);
                            }
                        } catch (error) {
                            console.error(`VectorSigma xForm Submission Error:`, error);
                        } finally {
                            actions.setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            {isSubmitting ? this.isSubmitting = isSubmitting : null}
                            <FormikStateObserver<T> instance={this} />

                            {sanitizedData.logo && (
                                <div style={{ display: 'flex', width: '100%', marginBottom: '24px', 
                                    justifyContent: 
                                        sanitizedData.logoPosition === 'center' ? 'center' :
                                        sanitizedData.logoPosition === 'right' ? 'flex-end' : 
                                        'flex-start'
                                }}>
                                    <img 
                                        src={sanitizedData.logo} 
                                        alt={`${sanitizedData.name || 'Form'} Logo`} 
                                        style={{ maxHeight: '64px', maxWidth: '100%', objectFit: 'contain' }} 
                                    />
                                </div>
                            )}

                            <Teletraan1 brandColor={sanitizedData.brandColor} xFormModel={sanitizedData} {...options} />
                            
                            {!isCodexMode && !options?.readOnlyMode && !options?.buttonOverride && (
                                <Flex 
                                    mt="6" 
                                    justify="end" 
                                    style={{ width: '100%', paddingTop: '20px', borderTop: '1px solid var(--gray-5)' }}
                                >
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        style={{ 
                                            cursor: isSubmitting ? 'wait' : 'pointer',
                                            padding: '0 24px',
                                            ...(sanitizedData.brandColor ? 
                                                { backgroundColor: sanitizedData.brandColor, color: '#fff' } 
                                                : 
                                                { backgroundColor: '#000000', color: '#fff' })
                                        }}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </Flex>
                            )}
                            
                        </Form>
                    )}
                </Formik>
            </Theme>
        );
    }

    /**
     * VΣ `render()` method for use with VectorSigma object builder
     * * Apt for dynamically creating forms via code.
     * * `render()` is the final method in the Vector Sigma builder pattern chain.
     * @param options VectorSigmaRenderProps -- `VectorSigma` and `Teletraan1` props for VΣ render matrix.
     * @example .render({ 
         displayMode: 'dual', 
         brandColor: '#800020',
         readOnlyMode: false,
         onSubmit: async (values, actions, instance) => { // <-- onSubmit callback function passed into VectorSigma props
            // Use Case: Send hydrated xForm object to API
            await axios.post('/api/submit', instance.getxForm());
            // Use Case: Submit and clear form after success
            actions.submitForm();
            actions.resetForm(); 
            },
         onFinish: () => handleFormFinish() // <-- onFinish callback function passed into Teletraan1 (Codex) props
      })})
     */
    public render(options?: VectorSigmaRenderProps<T>): React.ReactElement {
        return this.transform(options);
    }

    // ==========================================
    // VΣ UTILITY METHODS
    // ==========================================

    /**
     * VΣ `toJSON()` utility method for retrieving the extant VectorSigma xForm JSON string
     * @example toJSON()
     */
    public toJSON(): string {
        return JSON.stringify(this.formObject, null, 2);
    }
    /**
     * VΣ `getxForm()` utility method for retrieving the extant VectorSigma xForm {}
     * @example getxForm()
     */
    public getxForm(): XFormType {
        return this.formObject;
    }
}