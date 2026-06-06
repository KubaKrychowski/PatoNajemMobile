import offersReducer, { setSearch, setTab, setSortBy, setPriceRange, resetFilters } from '../store/offersSlice';

const initialState = {
  filters: { tab: 'wszystkie' as const, search: '', sortBy: 'date' as const, sort: 'desc' as const },
};

describe('offersSlice', () => {
  test('zwraca stan początkowy', () => {
    expect(offersReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  test('setSearch aktualizuje frazę wyszukiwania', () => {
    const state = offersReducer(initialState, setSearch('Mokotów'));
    expect(state.filters.search).toBe('Mokotów');
  });

  test('setTab zmienia aktywny tab', () => {
    const state = offersReducer(initialState, setTab('dostepne'));
    expect(state.filters.tab).toBe('dostepne');
  });

  test('setSortBy zmienia kryterium sortowania', () => {
    const state = offersReducer(initialState, setSortBy('patoPoints'));
    expect(state.filters.sortBy).toBe('patoPoints');
  });

  test('setPriceRange ustawia zakres cen', () => {
    const state = offersReducer(initialState, setPriceRange({ min: 1000, max: 3000 }));
    expect(state.filters.priceMin).toBe(1000);
    expect(state.filters.priceMax).toBe(3000);
  });

  test('resetFilters przywraca stan początkowy', () => {
    let state = offersReducer(initialState, setSearch('test'));
    state = offersReducer(state, setTab('wynajete'));
    state = offersReducer(state, resetFilters());
    expect(state).toEqual(initialState);
  });
});
