import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfferFilters, OfferFilterTab } from '../types';

interface OffersState {
  filters: OfferFilters;
}

const initialState: OffersState = {
  filters: {
    tab: 'wszystkie',
    search: '',
    sortBy: 'date',
    sort: 'desc',
  },
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setTab: (state, action: PayloadAction<OfferFilterTab>) => {
      state.filters.tab = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'patoPoints'>) => {
      state.filters.sortBy = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      state.filters.priceMin = action.payload.min;
      state.filters.priceMax = action.payload.max;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setSearch, setTab, setSortBy, setPriceRange, resetFilters } = offersSlice.actions;
export default offersSlice.reducer;
