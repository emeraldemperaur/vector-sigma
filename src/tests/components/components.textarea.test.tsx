import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { TextAreaInput } from '../../components/input/inputTextArea';

beforeAll(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
}));

const renderWithFormik = (ui: React.ReactElement, initialValues = {}, formikProps = {}) => {
  return render(
    <Theme>
      <Formik initialValues={initialValues} onSubmit={jest.fn()} {...formikProps}>
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

describe('VΣ Component(TextArea) Tests', () => {

  it('TextArea :: Rendered with label and placeholder', () => {
    renderWithFormik(
      <TextAreaInput 
        alias="bio" 
        width={12} 
        inputLabel="Biography" 
        placeholder="Tell us about yourself..." 
      />
    );

    expect(screen.getByText('Biography')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument();
  });

  it('TextArea :: Handled typing and updated value state', async () => {
    renderWithFormik(
      <TextAreaInput alias="notes" width={12} placeholder="Meeting notes" />,
      { notes: '' }
    );

    const textarea = screen.getByPlaceholderText('Meeting notes') as HTMLTextAreaElement;
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Discussed project Matrix.' } });
    });
    
    expect(textarea.value).toBe('Discussed project Matrix.');
  });

  it('TextArea :: Displayed an error message for required field', async () => {
    await act(async () => {
      renderWithFormik(
        <TextAreaInput alias="bio" width={12} errorText="Biography is required!" />,
        { bio: '' },
        { initialErrors: { bio: 'Required' }, initialTouched: { bio: true } }
      );
    });

    const errorMessage = await screen.findByText('Biography is required!');
    expect(errorMessage).toBeInTheDocument();
  });

  it('TextArea :: Disabled interaction when readOnly', () => {
    renderWithFormik(
      <TextAreaInput alias="notes" placeholder="Read only notes" readOnly width={12}/>
    );

    const textarea = screen.getByPlaceholderText('Read only notes');
    // HTML TextAreas use readonly attribute
    expect(textarea).toHaveAttribute('readonly');
  });

  it('TextArea :: Rendered neumorphic variant', () => {
    renderWithFormik(
      <TextAreaInput 
        alias="notes" 
        width={12} 
        inputtype="textarea-neumorphic" 
        placeholder="Neu text area" 
      />
    );

    const textarea = screen.getByPlaceholderText('Neu text area');
    const wrapper = textarea.closest('.rt-TextAreaRoot');
    
    expect(wrapper?.className).toMatch(/neumorphic/i);
  });

  it('TextArea :: Configured custom rows', () => {
    renderWithFormik(
      <TextAreaInput alias="notes" placeholder="Custom rows" rows={8} width={12}/>
    );

    const textarea = screen.getByPlaceholderText('Custom rows');
    expect(textarea).toHaveAttribute('rows', '8');
  });

});