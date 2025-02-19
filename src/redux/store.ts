// src/redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api'; // RTK Query API Slice
import userReducer from './slices/userSlice'; // Example reducer
import courseReducer from './slices/courseSlice';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' 


const persistConfig = {
  key: 'root',
  storage,
}

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  userReducer,
  courseReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }).concat([baseApi.middleware])
});

export const persistor = persistStore(store)

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;