import React from 'react';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { SectionTitle } from '../../components/xtitle/xtitle'; 

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
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
});

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<Theme>{ui}</Theme>);
};

describe('VΣ Component(SectionTitle) Test', () => {

  it('SectionTitle :: Rendered title', () => {
    renderWithTheme(<SectionTitle title="VΣ User Questionnaire" />);

    const titleElement = screen.getByText('VΣ User Questionnaire');
    expect(titleElement).toBeInTheDocument();
    
    expect(titleElement.tagName).toMatch(/^H[1-6]$/);
  });

  it('SectionTitle :: Rendered subtitle', () => {
    renderWithTheme(
      <SectionTitle 
        title="Main Title" 
        subTitle="This is a description." 
      />
    );

    expect(screen.getByText('This is a description.')).toBeInTheDocument();
  });

  it('SectionTitle :: Rendered custom icon provided', () => {
    renderWithTheme(
      <SectionTitle 
        title="Settings" 
        icon={<span data-testid="custom-icon">⚙️</span>} 
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('SectionTitle :: Disabled separator when withSeparator is false', () => {
    renderWithTheme(
      <SectionTitle 
        title="Title without Separator" 
        withSeparator={false} 
      />
    );

    const separator = screen.queryByRole('separator');
    expect(separator).not.toBeInTheDocument();
  });

  it('SectionTitle :: Rendered title with specified text alignment', () => {
    const { container } = renderWithTheme(
      <SectionTitle title="Centered Title" align="center" />
    );

    const flexContainer = container.querySelector('.rt-Flex');
    expect(flexContainer).toHaveStyle({ textAlign: 'center' });
  });

});