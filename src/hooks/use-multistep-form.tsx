import { create, createStore } from "zustand";

interface MultistepFormState {
	// totalSteps: number;
	formData: {};
	step: number;
	nextStep: () => void;
	prevStep: () => void;
	setFormData: (data: object) => void;
	addFormData: (data: object) => void;
}
// todo: fix man
export const createMultistepFormStore = (totalSteps: number) => {
	return create<MultistepFormState>((set) => ({
		totalSteps,
		formData: {},
		step: 0,
		nextStep: () =>
			set((state) => {
				// console.log(state.step, state.totalSteps);
				// if (state.step < state.totalSteps - 1) {
					console.log("next step", state.step);
					return { step: state.step + 1 };
				// }

				// return state;
			}),
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
}

// todo: remove when not needed
const useMultistepForm = create<MultistepFormState>((set) => ({
	// totalSteps: 0,
	formData: {},
	step: 0,
	nextStep: () =>
		set((state) => {
			// if (state.step < state.totalSteps - 1) {
				return { step: state.step + 1 };
			// }

			// return state;
		}),
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

export default useMultistepForm;
