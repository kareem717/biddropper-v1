"use client";
import AuthSessionProvider from "@/components/providers/auth-session-provider";
import React from "react";
import AdminNavBar from "@/components/admin-nav-bar";

import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <main className="h-screen">
          <AdminNavBar />
          <div className="flex h-[90vh] w-full flex-col items-center justify-center">
            {children}
          </div>
        </main>
      </QueryClientProvider>
    </AuthSessionProvider>
  );
};

export default Layout;
