"use client";
import CreateReview from "@/components/forms/create-review";
import React from "react";
import { useParams } from "next/navigation";
import AuthProvider from "@/hooks/use-auth";

const CreateReviewPage = () => {
  return (
    <AuthProvider>
      <div className="relative h-screen w-full bg-[url('/images/wave.svg')] bg-cover xl:bg-bottom">
        <CreateReview className="absolute right-1/2 top-1/4 w-[95vw] -translate-y-1/4 translate-x-1/2 bg-background sm:w-[min(80vw,1000px)]" />
      </div>
    </AuthProvider>
  );
};

export default CreateReviewPage;
