"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store, hydrateAuth } from "@/lib/store";
export function Providers({children}:{children:React.ReactNode}) {
  useEffect(() => {
    const accessToken=localStorage.getItem("fashion_access");
    const refreshToken=localStorage.getItem("fashion_refresh");
    let user=null;
    try { user=JSON.parse(localStorage.getItem("fashion_user")||"null"); } catch { user=null; }
    store.dispatch(hydrateAuth({accessToken,refreshToken,user}));
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
