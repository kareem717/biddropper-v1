import { createContext, useContext } from "react";

type MultistepFormContextType = {
	data: object;
	step: number;
	setFormValues: (values: any) => void;
	setStep: (step: number) => void;
	addProgress: (value: number) => void;
	clerkSignUp: any;
};
export const MultistepFormContext = createContext<
	MultistepFormContextType | undefined
>(undefined);
export function useMultistepFormContext() {
	const context = useContext(MultistepFormContext);
	if (context === undefined) {
		throw new Error(
			"useMultistepFormContext must be used within a MultistepFormContextProvider"
		);
	}
	return context;
}
