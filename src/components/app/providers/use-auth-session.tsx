"use client";
import { createContext, useContext } from "react";
import { validateRequest } from "@/lib/auth";

type ContextType = Awaited<ReturnType<typeof validateRequest>>;

const AuthSessionContext = createContext<ContextType>({
  session: null,
  user: null,
});

export const useAuthSession = () => useContext(AuthSessionContext);

export const AuthSessionProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: ContextType }>) => {
  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};
