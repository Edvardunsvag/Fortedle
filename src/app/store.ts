import { configureStore } from '@reduxjs/toolkit';
import { FeatureKey } from '@/shared/redux/enums';
import { employeesReducer } from '@/features/employees';
import { gameReducer } from '@/features/game';
import { navigationReducer } from '@/features/navigation';
import { authReducer } from '@/features/auth';
import { leaderboardReducer } from '@/features/leaderboard';
import { i18nReducer } from '@/features/i18n';

export const store = configureStore({
  reducer: {
    [FeatureKey.Employees]: employeesReducer,
    [FeatureKey.Game]: gameReducer,
    [FeatureKey.Navigation]: navigationReducer,
    [FeatureKey.Auth]: authReducer,
    [FeatureKey.Leaderboard]: leaderboardReducer,
    [FeatureKey.I18n]: i18nReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

