import React, { useEffect } from 'react';
import { XFormSchema, XFormType, XFormQuery, SectionSchema } from './utils/voltron';
import { normalizeXForm } from './utils/minerva'; 
import { Teletraan1, Teletraan1Props } from './teletraan1';
import { z } from "zod";
import { Theme } from '@radix-ui/themes';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import './styles/main.scss';

// ==========================================
// FORMIK OBSERVER (Syncs React State to Class Instance)
// ==========================================
const FormikStateObserver = ({ instance }: { instance: VectorSigma }) => {
    const { values, errors, dirty } = useFormikContext<Record<string, any>>();

    useEffect(() => {
        // Sync values and errors back to the class instance
        instance.values = values;
        instance.errors = errors;

        // Transition status code from 0 (Empty) to 1 (In Progress) when user starts typing
        if (dirty && instance.statusCode === 0) {
            instance.statusCode = 1;
            instance.timeInProgress = Date.now();
        }
    }, [values, errors, dirty, instance]);

    return null; // This component doesn't render anything visually
};


// ==========================================
// VECTORSIGMA CLASS
// ==========================================
export class VectorSigma {
    public isValid: boolean = false;
    public formObject: XFormType;

    // Instance attributes for state tracking
    public values: Record<string, any> = {};
    public errors: Record<string, any> = {};
    public statusCode: 0 | 1 | 2 = 0; // 0 = Created/Empty, 1 = In Progress, 2 = Submitted
    public timeCreated: number;
    public timeInProgress: number | null = null;
    public timeSubmitted: number | null = null;
    public isSubmitting: boolean;

    /**
     * Initializes the VectorSigma instance.
     * @param initializer A JSON string or a JavaScript object matching XFormType.
     * If left empty, initializes a blank form object for use with Builder methods.
     */
    constructor(initializer?: string | XFormType | unknown) {
        this.timeCreated = Date.now();
        
        // Setup default skeleton for the builder pattern
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
     * Safely validates the input against the XFormSchema.
     * Throws developer-friendly errors if the JSON is malformed or violates the schema.
     */
    private validateAndSet(input: unknown) {
        let dataToValidate = input;

        if (typeof input === 'string') {
            try {
                dataToValidate = JSON.parse(input);
            } catch (error) {
                throw new Error(`VectorSigma Validation Error: Invalid JSON string provided.\nDetails: ${(error as Error).message}`);
            }
        }

        const result = XFormSchema.safeParse(dataToValidate);
        this.isValid = result.success;

        if (result.success) {
            this.formObject = result.data;
            console.log(`VectorSigma: JSON Validation successful for form "${this.formObject.name}".`);
        } else {
            const errorMessages = result.error.issues.map(
                issue => `  - Path: [${issue.path.join('.') || 'root'}] -> ${issue.message}`
            ).join('\n');

            throw new Error(`VectorSigma Validation Error: Invalid xForm Object Schema.\n${errorMessages}`);
        }
    }

    /**
     * Traverses the schema to extract Formik InitialValues and Yup Validation logic.
     */
    private buildFormikConfig(sanitizedData: XFormType) {
        const initialValues: Record<string, any> = {};
        const shape: Record<string, any> = {};

        const arrayTypes = [
            'checkboxgroup-input', 
            'selectmultiple-input', 
            'filemultiple-input'
        ];
        
        const booleanTypes = [
            'toggle-input', 
            'conditional-toggle', 
            'conditional-checkbox'
        ];

        const traverseQueries = (queries: XFormQuery[]) => {
            queries.forEach(q => {
                const normalizedType = q.inputType.toLowerCase();
                const isArray = arrayTypes.includes(normalizedType);
                const isBoolean = booleanTypes.includes(normalizedType);

                if (q.defaultValue !== undefined && q.defaultValue !== null) {
                    initialValues[q.inputAlias] = q.defaultValue;
                } else if (isArray) {
                    initialValues[q.inputAlias] = []; // Checkboxes, Multi-Selects
                } else if (isBoolean) {
                    initialValues[q.inputAlias] = false; // Toggles
                } else {
                    initialValues[q.inputAlias] = ""; // Text, Dropdowns, Radios, OptionSelect
                }

                let validator: any = isArray ? Yup.array() : isBoolean ? Yup.boolean() : Yup.string();

                if (q.isRequired) {
                    if (isArray) {
                        validator = validator.min(1, q.errorText || `${q.inputLabel || 'This field'} is required`);
                    } else if (isBoolean) {
                        validator = validator.oneOf([true], q.errorText || `${q.inputLabel || 'This toggle'} must be checked`);
                    } else {
                        validator = validator.required(q.errorText || `${q.inputLabel || 'This field'} is required`);
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

        this.values = initialValues;

        return {
            initialValues,
            validationSchema: Yup.object().shape(shape)
        };
    }

    // ==========================================
    // BUILDER PATTERN METHODS
    // ==========================================

    public setUUID(uuid: string): this {
        this.formObject.uuid = uuid;
        return this;
    }

    public setName(name: string): this {
        this.formObject.name = name;
        return this;
    }

    public setBrand(color: string, logo?: string, logoPosition?: 'left' | 'center' | 'right'): this {
        this.formObject.brandColor = color;
        if (logo) this.formObject.logo = logo;
        if (logoPosition) this.formObject.logoPosition = logoPosition;
        return this;
    }

    public addSection(section: z.infer<typeof SectionSchema>): this {
        this.formObject.model.push(section);
        return this;
    }

    public createSection(sectionId: string, title: string, icon?: string): this {
        this.formObject.model.push({ sectionId, title, icon, queries: [] });
        return this;
    }

    public addQueryToSection(sectionId: string, query: XFormQuery): this {
        const section = this.formObject.model.find(s => s.sectionId === sectionId);
        if (!section) {
            throw new Error(`VectorSigma Builder Error: Section with ID "${sectionId}" not found.`);
        }
        section.queries.push(query);
        return this;
    }

    // ==========================================
    // RENDER METHODS
    // ==========================================

    /**
     * Transforms the initialized xForm JSON/JS object by normalizing it and returning a `<Teletraan1/>` component.
     */
    public transform(teletraanProps?: Omit<Teletraan1Props, 'xFormModel'>): React.ReactElement {
        // Run a final validation check
        this.validateAndSet(this.formObject); 
        
        // Sanitize the object
        const sanitizedData = normalizeXForm(this.formObject);

        // Generate dynamic initialValues and Yup Schema
        const { initialValues, validationSchema } = this.buildFormikConfig(sanitizedData);
        
        return (
            <Theme>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                        // Update tracking metrics on successful submit
                        this.statusCode = 2;
                        this.timeSubmitted = Date.now();
                        
                        console.log(`VectorSigma Form Submitted: [${sanitizedData.name}]`, values);
                        
                        // Fire external onFinish handler if passed into Teletraan1 props
                        if (teletraanProps?.onFinish) {
                            teletraanProps.onFinish();
                        }

                        actions.setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            {isSubmitting ? this.isSubmitting = isSubmitting : null}
                            {/* Hidden observer bridges Formik state to this Class Instance */}
                            <FormikStateObserver instance={this} />

                            {/* Dynamically Aligned Logo Row */}
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

                            {/* Render Teletraan Form UI */}
                            <Teletraan1 xFormModel={sanitizedData} {...teletraanProps} />
                            
                        </Form>
                    )}
                </Formik>
            </Theme>
        );
    }

    /**
     * `render()` is the final method in the builder pattern chain.
     */
    public render(teletraanProps?: Omit<Teletraan1Props, 'xFormModel'>): React.ReactElement {
        return this.transform(teletraanProps);
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    public toJSON(): string {
        return JSON.stringify(this.formObject, null, 2);
    }
    
    public getObject(): XFormType {
        return this.formObject;
    }
}