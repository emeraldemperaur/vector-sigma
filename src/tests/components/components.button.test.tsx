import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { ButtonInput } from '../../components/button/button';

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn((color, amount) => '#dddddd'),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<Theme>{ui}</Theme>);
};


describe('VΣ Component(ButtonInput | Input) Tests', () => {
  
  it('ButtonInput :: Rendered inner child content', () => {
    renderWithTheme(
      <ButtonInput alias="submitBtn" width={12}>
        Click Me
      </ButtonInput>
    );

    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
  });


  it('ButtonInput :: Rendered neumorphic variant', () => {
    renderWithTheme(
      <ButtonInput alias="neuBtn" width={12} inputtype="button-neumorphic">
        Neumorphic
      </ButtonInput>
    );

    const button = screen.getByRole('button', { name: 'Neumorphic' });
    expect(button).toBeInTheDocument();
    expect(button.classList.contains('neumorphic-btn')).toBe(true);
  });
 
});