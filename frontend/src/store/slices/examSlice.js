import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  attemptId: null,
  currentQuestionIndex: 0,
  responses: {},
  markedForReview: {},
  timeRemaining: 0,
  startTime: null,
  endTime: null,
  isSubmitted: false,
  testState: 'not_started', // not_started, in_progress, submitted
  autoSaveEnabled: true
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    initExam: (state, action) => {
      state.attemptId = action.payload.attemptId;
      state.currentQuestionIndex = action.payload.currentQuestionIndex || 0;
      state.responses = {};
      state.markedForReview = {};
      (action.payload.responses || []).forEach((response) => {
        const questionId = String(response.questionId);
        state.responses[questionId] = {
          selectedOption: response.selectedOption ?? null,
          markedForReview: Boolean(response.markedForReview)
        };
        state.markedForReview[questionId] = Boolean(response.markedForReview);
      });
      state.timeRemaining = action.payload.timeRemaining ?? action.payload.totalTime * 60;
      state.startTime = action.payload.startTime || new Date().toISOString();
      state.testState = 'in_progress';
      state.isSubmitted = false;
      state.endTime = null;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    saveResponse: (state, action) => {
      const { questionId, selectedOption, markedForReview: marked } = action.payload;
      state.responses[questionId] = {
        selectedOption,
        markedForReview: marked || false,
        timestamp: new Date()
      };
      state.markedForReview[questionId] = Boolean(marked);
    },
    toggleMarkForReview: (state, action) => {
      const { questionId, marked } = action.payload;
      state.markedForReview[questionId] = Boolean(marked);
    },
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    submitExam: (state) => {
      state.testState = 'submitted';
      state.isSubmitted = true;
      state.endTime = new Date();
    },
    resetExam: (state) => {
      return initialState;
    }
  }
});

export const {
  initExam,
  setCurrentQuestion,
  saveResponse,
  toggleMarkForReview,
  updateTimeRemaining,
  submitExam,
  resetExam
} = examSlice.actions;

export default examSlice.reducer;
