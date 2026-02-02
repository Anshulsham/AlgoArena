import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from './utils/axiosClient'; // Import your existing axios instance

// --- 1. RUN CODE THUNK ---
export const runCode = createAsyncThunk(
    "submission/run",
    async ({ problemId, code, language }, { rejectWithValue }) => {
        try {
            // Adjust the URL if needed to match your backend route structure
            const response = await axiosClient.post(`/submission/run/${problemId}`, { 
                code, 
                language 
            });
            return response.data;
        } catch (error) {
            // ✅ FIX: Extract only the message string to prevent Redux crash
            const errorMessage = 
                error.response?.data?.message || 
                error.response?.data?.error ||   
                "Execution failed";
            
            return rejectWithValue(errorMessage);
        }
    }
);

// --- 2. SUBMIT CODE THUNK ---
export const submitCode = createAsyncThunk(
    "submission/submit",
    async ({ problemId, code, language }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, { 
                code, 
                language 
            });
            return response.data;
        } catch (error) {
            // ✅ FIX: Same safe error handling here
            const errorMessage = 
                error.response?.data?.message || 
                error.response?.data?.error || 
                "Submission failed";
            
            return rejectWithValue(errorMessage);
        }
    }
);

const submissionSlice = createSlice({
    name: "submission",
    initialState: {
        loading: false,
        result: null, // Stores the output of the code run
        error: null,
        verdict: null // Stores "Accepted" or "Wrong Answer" for submissions
    },
    reducers: {
        // Optional: clear output when switching problems
        clearOutput: (state) => {
            state.result = null;
            state.error = null;
            state.verdict = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Run Code Cases ---
            .addCase(runCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.result = null;
            })
            .addCase(runCode.fulfilled, (state, action) => {
                state.loading = false;
                state.result = action.payload; // Contains stdout, time, etc.
            })
            .addCase(runCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // This is now a simple string!
            })

            // --- Submit Code Cases ---
            .addCase(submitCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.verdict = null;
            })
            .addCase(submitCode.fulfilled, (state, action) => {
                state.loading = false;
                state.verdict = action.payload; // Contains "Accepted", "Wrong Answer"
            })
            .addCase(submitCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearOutput } = submissionSlice.actions;
export default submissionSlice.reducer;