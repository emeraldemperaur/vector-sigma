import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordion, AccordionItem } from '../../layouts/accordion/accordion';

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
}));

jest.mock('../../components/icons/icons', () => ({
  Icon: () => <span data-testid="mock-icon" />
}));

describe('VΣ Layouts(Accordion) Test', () => {
  
  it('Accordion :: Rendered Accordion item(s) with header(s)', () => {
    render(
      <Accordion>
        <AccordionItem sectionId="item-1" title="Autobots">Optimus Prime</AccordionItem>
        <AccordionItem sectionId="item-2" title="Decepticons">Megatron</AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Autobots')).toBeInTheDocument();
    expect(screen.getByText('Decepticons')).toBeInTheDocument();
  });

  it('Accordion :: Toggled accordion item on click interaction', () => {
    render(
      <Accordion>
        <AccordionItem sectionId="item-1" title="Toggle Me">Hidden Content</AccordionItem>
      </Accordion>
    );

    const triggerBtn = screen.getByRole('button', { name: /Toggle Me/i });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
  });


  it('Accordion :: Rendered with defaultOpenId section in an open state', () => {
    render(
      <Accordion defaultOpenId="item-2">
        <AccordionItem sectionId="item-1" title="Section 1">
          Content 1
        </AccordionItem>
        <AccordionItem sectionId="item-2" title="Section 2">
          Content 2
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole('button', { name: /Section 1/i });
    const trigger2 = screen.getByRole('button', { name: /Section 2/i });
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('Accordion :: Disabled accordion item', () => {
    render(
      <Accordion>
        <AccordionItem sectionId="item-1" title="Disabled Section" disabled>
          You cannot see me
        </AccordionItem>
      </Accordion>
    );

    const triggerBtn = screen.getByRole('button', { name: /Disabled Section/i });

    expect(triggerBtn).toBeDisabled();
  });
});