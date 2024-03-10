import { create } from "zustand";
import * as z from "zod";
import { createAddressInput } from "@/lib/server/validations/address";

export type Address = z.infer<typeof createAddressInput>;

interface useAddressInputProps {
  address: Address | undefined;
  setAddress: (address: Address | undefined) => void;
}

const useAddressInput = create<useAddressInputProps>((set, get) => ({
  address: undefined,
  setAddress: (address: Address | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
}));

export default useAddressInput;
