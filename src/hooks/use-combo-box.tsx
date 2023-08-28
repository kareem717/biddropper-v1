import { create } from "zustand";

interface useComboBoxProps {
	value: string;
	label: string;
	setValues: (label?: string, value?: string) => void;
}

const useComboBox = create<useComboBoxProps>((set) => ({
	value: "",
	label: "",
	setValues: (label?: string, value?: string) => {
		set((state) => ({
			...state,
			value: value !== undefined ? value : state.value,
			label: label !== undefined ? label : state.label,
		}));
	},
}));

export default useComboBox;
