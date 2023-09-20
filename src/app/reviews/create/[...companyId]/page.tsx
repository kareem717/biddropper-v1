"use client";
import CreateReview from "@/components/forms/create-review";
import React from "react";
import { useParams } from "next/navigation";
import AuthProvider from "@/hooks/use-auth";

const CreateReviewPage = () => {
	return (
		<AuthProvider>
			<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
				<CreateReview className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
			</div>
		</AuthProvider>
	);
};

export default CreateReviewPage;
