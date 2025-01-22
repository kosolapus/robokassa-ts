import { sortCustomFields } from '../hash';

test('hash custom params added alphabetically', () => {
  const result = sortCustomFields({
    shp_beta: 123,
    Shp_alpha: 123,
    shp_delta: '4',
    Shp_custom: 'Кириллица',
    shp_empty: 'lat',
  });
  expect(result[0]).toEqual('Shp_alpha=123');
  expect(result[1]).toEqual('shp_beta=123');
  expect(result[2]).toEqual(
    'Shp_custom=%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%BB%D0%B8%D1%86%D0%B0'
  );
  expect(result[3]).toEqual('shp_delta=4');
  expect(result[4]).toEqual('shp_empty=lat');
});
