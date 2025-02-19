import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CourseState {
    courseName: string;
    totalPrice: number;
    monthsArray: number[];
    numberOfMonths: number;
    monthlyPayment: number;
    dueDate: string;
    paymentLink: string
}

const initialState: CourseState = {
    courseName: '',
    totalPrice: 0,
    monthsArray: [],
    numberOfMonths: 0,
    monthlyPayment: 0,
    dueDate: '',
    paymentLink: ''
}

export const courseSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      // Corrected setUserField with proper typing
      setCourse: (state, action: PayloadAction<Partial<CourseState>>) => {
        return { ...state, ...action.payload };
      },
      clearCourse: () => initialState,
    },
});

export const { setCourse, clearCourse } = courseSlice.actions;

export default courseSlice.reducer;