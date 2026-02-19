import { getNearestBackgroundColor, adjustColor, formatBytes, classNames } from '../../utils/vinci'; 

describe('VΣ Utility(Vinci) Test', () => {

   test('Vinci :: getNearestBackgroundColor() :: Returned fallback for null element', () => {
    expect(getNearestBackgroundColor(null)).toBe('#ffffff');
  });

  test('Vinci :: getNearestBackgroundColor() :: Found parent color when child is transparent', () => {
    document.body.innerHTML = `
      <div id="parent" style="background-color: rgb(255, 0, 0);">
        <div id="child" style="background-color: transparent;"></div>
      </div>
    `;
    const child = document.getElementById('child');
    const result = getNearestBackgroundColor(child);
    expect(result).toBe('rgb(255, 0, 0)');
  });

   test('Vinci :: adjustColor() :: Lightened a Hex color', () => {
    expect(adjustColor('#000000', 10)).toBe('#0a0a0a');
  });

  test('Vinci :: adjustColor() :: Darkened an RGB color', () => {
    expect(adjustColor('rgb(100, 100, 100)', -50)).toBe('rgb(50, 50, 50)');
  });

  test('Vinci :: adjustColor() :: Capped RGB values at 255 and 0', () => {
    expect(adjustColor('#ffffff', 50)).toBe('#ffffff');
    expect(adjustColor('#000000', -50)).toBe('#000000');
  });

   test('Vinci :: formatBytes() :: Formatted bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1500, 3)).toBe('1.465 KB');
  });

   test('Vinci :: classNames() :: Joined multiple strings', () => {
    expect(classNames('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  test('Vinci :: classNames() :: Filtered out falsy values', () => {
    const isActive = false;
    // @ts-ignore - dynamic logic hack
    expect(classNames('btn', isActive && 'active', null, undefined)).toBe('btn');
  });

});