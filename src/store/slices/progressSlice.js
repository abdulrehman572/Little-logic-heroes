import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scores: {},        // e.g., { "shape_kingdom_1": 3, "patterns_1": 0 }
  completed: [],      // list of completed activity IDs
  currentModule: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updateScore: (state, action) => {
      const { module, activity, score } = action.payload;
      const key = `${module}_${activity}`;
      state.scores[key] = score;
    },
    completeActivity: (state, action) => {
      const activityId = action.payload;
      if (!state.completed.includes(activityId)) {
        state.completed.push(activityId);
      }
    },
    setCurrentModule: (state, action) => {
      state.currentModule = action.payload;
    }
  }
});

export const { updateScore, completeActivity, setCurrentModule } = progressSlice.actions;
export default progressSlice.reducer;