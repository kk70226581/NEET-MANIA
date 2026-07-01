import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import testReducer from './slices/testSlice';
import examReducer from './slices/examSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    test: testReducer,
    exam: examReducer
  }
});
