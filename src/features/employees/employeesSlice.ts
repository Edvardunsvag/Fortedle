import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import { fetchEmployees, AuthenticationError } from './api';
import { clearToken } from '@/features/auth';
import type { Employee, EmployeesState, DataSource } from './types';
import type { RootState } from '@/app/store';

const initialState: EmployeesState = {
  employees: [],
  status: 'idle',
  error: null,
  dataSource: 'mock',
};

export const loadEmployees = createAppAsyncThunk(
  'employees/loadEmployees',
  async (
    { dataSource, accessToken }: { dataSource: DataSource; accessToken?: string | null },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const employees = await fetchEmployees(dataSource, accessToken);
      return { employees, dataSource };
    } catch (error) {
      // If it's an authentication error, clear the token to trigger login flow
      if (error instanceof AuthenticationError) {
        dispatch(clearToken());
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load employees'
      );
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setDataSource: (state, action: PayloadAction<DataSource>) => {
      state.dataSource = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload.employees;
        state.dataSource = action.payload.dataSource;
      })
      .addCase(loadEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load employees';
      });
  },
});

export const { setDataSource } = employeesSlice.actions;

export const selectEmployees = (state: RootState): Employee[] =>
  state.employees.employees;

export const selectEmployeesStatus = (state: RootState): EmployeesState['status'] =>
  state.employees.status;

export const selectEmployeesError = (state: RootState): string | null =>
  state.employees.error;

export const selectDataSource = (state: RootState): DataSource =>
  state.employees.dataSource;

export const selectEmployeeById = (state: RootState, id: string): Employee | undefined =>
  state.employees.employees.find((emp) => emp.id === id);

export const selectEmployeeByName = (state: RootState, name: string): Employee | undefined =>
  state.employees.employees.find(
    (emp) => emp.name.toLowerCase() === name.toLowerCase()
  );

export default employeesSlice.reducer;

