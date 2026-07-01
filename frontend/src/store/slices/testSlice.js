import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tests: [],
  currentTest: null,
  selectedFilters: {
    subject: '',
    chapter: '',
    difficulty: [],
    source: ''
  },
  loading: false,
  error: null
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTests: (state, action) => {
      state.tests = action.payload;
    },
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    },
    setFilters: (state, action) => {
      state.selectedFilters = { ...state.selectedFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.selectedFilters = initialState.selectedFilters;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { setTests, setCurrentTest, setFilters, resetFilters, setLoading, setError, clearError } = testSlice.actions;
export default testSlice.reducer;
