import { create } from "zustand";

interface useComboBoxProps {
  selected: {
    label: string;
    value: string;
  }[];
  setValues: (label?: string, value?: string) => void;
  totalSelected: number;
}

const useComboBox = create<useComboBoxProps>((set, get) => ({
  selected: [],
  setValues: (label?: string, value?: string) => {
    set((state) => ({
      ...state,
      selected: [
        ...state.selected,
        {
          label: label || "",
          value: value || "",
        },
      ],
    }));
  },
  get totalSelected() {
    return get().selected.length;
  },
}));

export default useComboBox;
