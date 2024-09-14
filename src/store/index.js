import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "./reducers/authentication";
import { persistStore ,persistReducer} from "redux-persist";
import storage from "redux-persist/lib/storage/session";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["menus"],
};
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    authentication: authenticationReducer,
  })
);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"], // Ignore the persist action
      },
    }),
});

export const persistor = persistStore(store);