import { create } from 'zustand'
import { type ContractJob } from '@/lib/validations/contract';

interface AddJobDialog {
	formData?: ContractJob[] | [];
	setFormData: (data: ContractJob) => void;
	addFormData: (data: ContractJob) => void;
}

export const useAddJobDialog = create<AddJobDialog>((set) => ({
	formData: undefined,
	setFormData: (data) => set({ formData: [data] }),
	addFormData: (data) =>
	set((state) => ({ formData: [...(state.formData || []), data] })),
}));
