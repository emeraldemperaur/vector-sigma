import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { Teletraan1 } from '../../teletraan1'; 
import { XFormType } from 'utils/voltron';

const protoXFormModel: XFormType = {
    uuid: 'test-form-uuid-123',
    name: 'VΣ Orion Test Form',
    model: [
        {
            sectionId: 'section-1',
            title: 'AI Agent Identity',
            subtitle: 'Enter your credentials',
            icon: 'user',
            queries: [
                {
                    queryId: 1,
                    inputAlias: 'agentName',
                    inputType: 'text',
                    inputLabel: 'VΣ AI Agent Name',
                    inputWidth: 12,
                    defaultValue: '',
                    inputPlaceholder: 'Enter a VΣ AI agent name',
                }
            ]
        }
    ]
};

const FormikWrapper = ({ children }: { children: React.ReactNode }) => (
    <Formik initialValues={{ agentName: '' }} onSubmit={jest.fn()}>
        {children}
    </Formik>
);

describe('VΣ Orchestrator(Teletraan1) Tests', () => {

    it('Teletraan1 :: Rendered codice display mode by default', () => {
        render(
            <FormikWrapper>
                <Teletraan1 xFormModel={protoXFormModel} />
            </FormikWrapper>
        );

        expect(screen.getByText('AI Agent Identity')).toBeInTheDocument();
        expect(screen.getByText('Enter your credentials')).toBeInTheDocument();
        expect(screen.getByText('VΣ AI Agent Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter a VΣ AI agent name')).toBeInTheDocument();
    });

    it('Teletraan1 :: Disabled input components when readOnlyMode == true', () => {
        render(
            <FormikWrapper>
                <Teletraan1 xFormModel={protoXFormModel} readOnlyMode={true} />
            </FormikWrapper>
        );

        const input = screen.getByPlaceholderText('Enter a VΣ AI agent name');
        expect(input).toHaveAttribute('readonly'); 
    });

    it('Teletraan1 :: Renders accordion display mode', () => {
        render(
            <FormikWrapper>
                <Teletraan1 xFormModel={protoXFormModel} displayMode="accordion" />
            </FormikWrapper>
        );

        const accordionTrigger = screen.getByRole('button', { name: /AI Agent Identity/i });
        expect(accordionTrigger).toBeInTheDocument();
    });

    it('Teletraan1 :: Rendered dual display mode toggle', () => {
        render(
            <FormikWrapper>
                <Teletraan1 xFormModel={protoXFormModel} displayMode="dual" />
            </FormikWrapper>
        );
        const toggleCheckbox = screen.getByRole('checkbox', { hidden: true });
        expect(toggleCheckbox).toBeInTheDocument();
    });
});