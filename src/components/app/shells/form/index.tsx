"use client";

import { ReactNode, Suspense } from "react";
import AdminNavBar from "@/components/app/nav-bar";
import { Skeleton } from "../../../ui/skeleton";

const FormShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen overflow-hidden">
      <AdminNavBar />
      <div className="flex h-[90vh] w-full flex-col items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FormShell;
