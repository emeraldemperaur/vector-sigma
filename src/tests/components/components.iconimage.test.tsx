import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageOutput } from '../../components/image/image';
import { FlagIcon } from '../../components/icons/flagicon';
import { Icon } from '../../components/icons/icons';

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

describe('VΣ Component(ImageOutput | Icon | FlagIcon) Tests', () => {

  describe('VΣ Component(ImageOutput)', () => {
    it('ImageOutput :: Rendered an image', () => {
      render(
        <ImageOutput 
          id="profile-img" 
          src="https://example.com/avatar.png" 
          alt="User Avatar" 
        />
      );
      const imgElement = screen.getByAltText('User Avatar');
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute('src', 'https://example.com/avatar.png');
      expect(imgElement).toHaveAttribute('id', 'profile-img');
    });

    it('ImageOutput :: Rendered fallback UI when src is empty', () => {
      render(
        <ImageOutput id="empty-img" src="" alt="Empty Avatar" />
      );
      expect(screen.queryByAltText('Empty Avatar')).not.toBeInTheDocument();
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });

    it('ImageOutput :: Triggered onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(
        <ImageOutput 
          id="click-img" 
          src="https://example.com/avatar.png" 
          onClick={handleClick} 
        />
      );
      const container = screen.getByAltText('Image').parentElement!;
      fireEvent.click(container);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('VΣ Component(FlagIcon)', () => {
    it('FlagIcon :: Rendered country flag (NG)', () => {
      const { container } = render(<FlagIcon country="NG" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('FlagIcon :: Rendered bespoke EU flag', () => {
      const { container } = render(<FlagIcon country="EU" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('FlagIcon :: Rendered fallback div when country parameter invalid', () => {
      const { container } = render(<FlagIcon country={"INVALID" as any} />);
      const svg = container.querySelector('svg');
      const fallbackDiv = container.querySelector('div');
      expect(svg).not.toBeInTheDocument();
      expect(fallbackDiv).toBeInTheDocument();
      expect(fallbackDiv).toHaveStyle({ background: '#eee' });
    });
  });

  describe('VΣ Component(Icon)', () => {
    it('Icon :: Rendered custom mapped Radix icon', () => {
      const { container } = render(<Icon name="sun" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('Icon :: Drilled extra props down to Radix icon', () => {
      const { container } = render(<Icon name="moon" width="32" height="32" color="blue" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('Icon :: Returned null and rendered nothing when invalid icon name provided', () => {
      const { container } = render(<Icon name={"sahelanthropus" as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

});