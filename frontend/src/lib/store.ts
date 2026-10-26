import { configureStore, createSlice, type PayloadAction, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
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

const mutationToastMiddleware: Middleware = () => next => action => {
  const result = next(action);
  if (!action || typeof action !== "object" || !("type" in action) || typeof action.type !== "string" || !action.type.startsWith(`${api.reducerPath}/executeMutation/`)) return result;
  const a = action as { type: string; meta?: { arg?: { endpointName?: string } }; payload?: unknown };
  const endpoint = a.meta?.arg?.endpointName ?? "";
  const labels: Record<string, string> = { login: "Signed in successfully", register: "Account created successfully", createProduct: "Product created successfully", updateProduct: "Product updated successfully", deleteProduct: "Product deleted", createCategory: "Category created successfully", updateCategory: "Category updated successfully", deleteCategory: "Category deleted", createAddress: "Address saved successfully", updateAddress: "Address updated successfully", deleteAddress: "Address deleted", setDefaultAddress: "Default address updated", addCartItem: "Added to bag", updateCartItem: "Cart updated", deleteCartItem: "Item removed from bag", checkout: "Order placed successfully", updateOrder: "Order updated successfully" };
  if (a.type.endsWith("/fulfilled")) { toast.success(labels[endpoint] ?? "Changes saved successfully"); }
  else if (a.type.endsWith("/rejected")) {
    const payload = a.payload as { data?: unknown; error?: string } | undefined;
    const data = payload?.data;
    let detail = payload?.error ?? "Something went wrong. Please try again.";
    if (data && typeof data === "object") { const obj = data as Record<string, unknown>; if (typeof obj.detail === "string") detail = obj.detail; else detail = Object.entries(obj).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ") || detail; }
    toast.error(detail);
  }
  return result;
};

export const store=configureStore({reducer:{auth:authSlice.reducer,[api.reducerPath]:api.reducer},middleware:(gDM)=>gDM().concat(api.middleware, mutationToastMiddleware)});
export type RootState=ReturnType<typeof store.getState>;
export type AppDispatch=typeof store.dispatch;
