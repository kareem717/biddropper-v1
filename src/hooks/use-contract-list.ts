import { create } from "zustand";

interface ContractListState {
	selected: string;
	select: (id: string) => void;
}

const createContractListStore = (defaultSelection: string) =>
	create<ContractListState>((set) => ({
		selected: defaultSelection,
		select: (id: string) => set((state) => ({ selected: id })),
	}));

export default createContractListStore;
