import { create } from "zustand";

interface ContractListState {
  selected: string;
  select: (newVal: string) => void;
}

const useContractList = create<ContractListState>((set) => ({
  selected: "",
  select: (newVal: string) => {
    set((state) => ({
      ...state,
      selected: newVal,
    }));
  },
}));

export default useContractList;
