"use client";
import { StepOneForm } from "./step-one";
import { StepThreeForm } from "./step-three";
import { StepTwoForm } from "./step-two";
import {StepFourForm} from "./step-four";
import { MultistepFormContext } from "@/hooks/use-multistep-form";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useSignUp } from "@clerk/nextjs";

export function SignUpForm() {
	const [data, setData] = useState({});
	const [step, setStep] = useState(0);
	const [progress, setProgress] = useState(0);
	const clerkSignUp = useSignUp();

	const setFormValues = (values: Record<string, string>) => {
		setData((prevValues) => ({
			...prevValues,
			...values,
		}));
	};

	const addProgress = (value: number) => {
		if (progress + value > 100) {
			setProgress(100);
			return;
		} else if (progress + value < 0) {
			setProgress(0);
			return;
		} else {
			setProgress((prevProgress) => prevProgress + value);
		}
	};

	return (
		<MultistepFormContext.Provider
			value={{ data, setFormValues, step, setStep, addProgress, clerkSignUp }}
		>
			<Progress value={progress} max={100} />
			{step === 0 && <StepOneForm />}
			{step === 1 && <StepTwoForm />}
			{step === 2 && <StepThreeForm />}
			{step === 3 && <StepFourForm />}
		</MultistepFormContext.Provider>
	);
}
