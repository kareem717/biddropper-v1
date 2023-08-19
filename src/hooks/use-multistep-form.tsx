import { create, useStore } from "zustand";

type Job = {
	industry: string;
	title: string;
	summary: string;
	budget: number;
	currencyType: string;
	propertyType: string;
	dateRange: {
		dateFrom: Date;
		dateTo: Date | undefined;
	};
};

interface MultistepFormState {
	formData: {
		jobs?: Job[];
	};
	step: number;
	nextStep: () => void;
	prevStep: () => void;
	setFormData: (data: object) => void;
	addFormData: (data: object) => void;
}

export const useMultistepForm = create<MultistepFormState>((set) => ({
	formData: {},
	step: 0,
	nextStep: () =>
		set((state) => ({
			step: state.step + 1,
		})),
	prevStep: () =>
		set((state) => {
			if (state.step > 0) {
				return { step: state.step - 1 };
			}

			return state;
		}),
	setFormData: (data: object) => set({ formData: data }),
	addFormData: (data) =>
		set((state) => ({ formData: { ...state.formData, ...data } })),
}));
