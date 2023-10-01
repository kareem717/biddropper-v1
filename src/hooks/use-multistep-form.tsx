import { create } from "zustand";
import { useForm } from "react-hook-form";
import type { UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface MultistepFormState {
	totalSteps: number;
	step: number;
	nextStep: () => void;
	prevStep: () => void;
	isLastStep: () => boolean;
	validateStep: (
		step: number,
		form: ReturnType<typeof useForm<any>>,
		customLogic?: () => Promise<boolean> | boolean
	) => Promise<boolean>;
}

const createMultistepFormStore = (
	totalSteps: number,
	steps: Record<number, string[]>
) => {
	return create<MultistepFormState>((set) => {
		return {
			totalSteps,
			step: 0,
			nextStep: () =>
				set((state) => {
					if (state.step < state.totalSteps - 1) {
						return { step: state.step + 1 };
					}
					return state;
				}),
			prevStep: () =>
				set((state) => {
					if (state.step > 0) {
						return { step: state.step - 1 };
					}
					return state;
				}),
			isLastStep: () => {
				let isLast = false;
				set((state) => {
					isLast = state.step === state.totalSteps - 1;
					return state;
				});
				return isLast;
			},
			validateStep: async (step, form, customLogic) => {
				const fields = steps[step];
				const isValid = await form.trigger(fields);

				if (customLogic) {
					const customLogicResult = await customLogic();
					if (!customLogicResult) {
						return false;
					}
				}

				if (!isValid) {
					return false;
				}

				return true;
			},
		};
	});
};

export default createMultistepFormStore;
