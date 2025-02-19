import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import User from '../../models/User';

// Define the User State Interface
interface UserState {
  isLoading: boolean
  isLoggedIn: boolean
  user: User 
  error: string
}

const initialState: UserState = {
  isLoading: false,
  isLoggedIn: false,
  user: {
    firstName: '',
    lastName: '',
    phone: '',
    iin: '',
    email: '',
  },
  error: ""
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
      userLoading: (state) => {
          state.isLoading = true;
      },

      userCreated: (state, action) => {
          state.isLoading = false;
          state.error = '';
          state.user = action.payload;
      },

      userLoggedIn: (state, _) => {
        state.isLoggedIn = true
      },

      updateUserField(state, action: PayloadAction<{ key: keyof UserState | keyof User; value: any }>) {
        const { key, value } = action.payload;
        if (key in state) {
          (state as any)[key] = value;
        } else {
          (state.user as any)[key] = value;
        }
      },

      userClosed: () => {
          return initialState;
      },

      userError: (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
      }
  }
})

export const { userLoading, userCreated, userLoggedIn, updateUserField, userClosed, userError } = userSlice.actions;

export default userSlice.reducer