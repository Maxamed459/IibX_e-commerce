import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
type AuthState = { accessToken: string | null; refreshToken: string | null; user: User | null; hydrated: boolean };
const initialState: AuthState = { accessToken: null, refreshToken: null, user: null, hydrated: false };
const authSlice = createSlice({ name: "auth", initialState, reducers: {
  setCredentials: (state, action: PayloadAction<{access:string;refresh?:string;user?:User}>) => {
    state.accessToken=action.payload.access; state.refreshToken=action.payload.refresh ?? state.refreshToken;
    state.user=action.payload.user ?? null; state.hydrated=true;
    if (typeof window !== "undefined") { localStorage.setItem("fashion_access",action.payload.access); if(action.payload.refresh) localStorage.setItem("fashion_refresh",action.payload.refresh); if(action.payload.user) localStorage.setItem("fashion_user",JSON.stringify(action.payload.user)); }
  },
  setAccessToken: (state, action: PayloadAction<string>) => { state.accessToken=action.payload; state.hydrated=true; if(typeof window!=="undefined") localStorage.setItem("fashion_access",action.payload); },
  hydrateAuth: (state, action: PayloadAction<{accessToken:string|null;refreshToken:string|null;user:User|null}>) => { state.accessToken=action.payload.accessToken; state.refreshToken=action.payload.refreshToken; state.user=action.payload.user; state.hydrated=true; },
  logout: (state) => { state.accessToken=null; state.refreshToken=null; state.user=null; state.hydrated=true; if(typeof window!=="undefined"){localStorage.removeItem("fashion_access");localStorage.removeItem("fashion_refresh");localStorage.removeItem("fashion_user");} }
}});
export const {setCredentials,setAccessToken,hydrateAuth,logout}=authSlice.actions;
export const store=configureStore({reducer:{auth:authSlice.reducer,[api.reducerPath]:api.reducer},middleware:(gDM)=>gDM().concat(api.middleware)});
export type RootState=ReturnType<typeof store.getState>;
export type AppDispatch=typeof store.dispatch;
