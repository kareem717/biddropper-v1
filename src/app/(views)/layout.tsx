"use client";
import AuthSessionProvider from "@/components/providers/auth-session-provider";
import React from "react";

import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <main>{children}</main>
      </QueryClientProvider>
    </AuthSessionProvider>
  );
};

export default Layout;
