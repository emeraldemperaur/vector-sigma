import { getTimeStamp, getExtantDate, ensureDate } from '../utils/chronos'; 

describe('VΣ Utility(Chronos) Test', () => {
 
  const MOCK_DATE = new Date('2026-01-01T00:00:00.000Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

    test('Chronos :: getTimeStamp() :: Returned the current time in ISO format', () => {
      expect(getTimeStamp()).toBe('2026-01-01T00:00:00.000Z');
    });

    test('Chronos :: getExtantDate() :: Returned only the YYYY-MM-DD portion of the date', () => {
      expect(getExtantDate()).toBe('2026-01-01');
    });

    test('Chronos :: ensureDate() :: Parsed valid ISO string into Date object', () => {
      const input = '2026-01-01T00:00:00.000Z';
      const result = ensureDate(input);
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(input); 
    });

    test('Chronos :: ensureDate() :: Returned Date object for Date object parameter', () => {
      const dateObj = new Date('2026-01-01');
      const result = ensureDate(dateObj);
      
      expect(result).toBeInstanceOf(Date);
      expect(result).toEqual(dateObj);
    });
});