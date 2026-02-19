import { parseUuidFormat } from '../../utils/uuidparser';

describe('VΣ Utility(uuidParser) Test', () => {

  test('uuidParser() :: Returned default [4, 4, 4, 4] if string does not start with uuid', () => {
    expect(parseUuidFormat('id-1-2-3')).toEqual([4, 4, 4, 4]);
    expect(parseUuidFormat('')).toEqual([4, 4, 4, 4]);
  });

  test('uuidParser() :: Parsed valid uuid format', () => {
    expect(parseUuidFormat('uuid-8-4-4-4-12')).toEqual([8, 4, 4, 4, 12]);
    expect(parseUuidFormat('UUID-1-2-3')).toEqual([1, 2, 3]);
  });

  test('uuidParser() :: Returned default [4, 4, 4, 4] if any part is not a number', () => {
    expect(parseUuidFormat('uuid-8-abc-4')).toEqual([4, 4, 4, 4]);
    expect(parseUuidFormat('uuid-8--4')).toEqual([4, 4, 4, 4]); // Empty part is NaN
  });

  test('uuidParser() :: Returned variant number of uuid segments', () => {
    expect(parseUuidFormat('uuid-2-2')).toEqual([2, 2]);
    expect(parseUuidFormat('uuid-10')).toEqual([10]);
  });

});