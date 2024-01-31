import { bodyParamSchema } from "@/lib/validations/api/(references)/addresses/request";
import { create } from "zustand";
import * as z from "zod";

interface useAddressInputProps {
  address: z.infer<typeof bodyParamSchema.POST> | undefined;
  setAddress: (
    address: z.infer<typeof bodyParamSchema.POST> | undefined,
  ) => void;
}

const useAddressInput = create<useAddressInputProps>((set, get) => ({
  address: undefined,
  setAddress: (address: z.infer<typeof bodyParamSchema.POST> | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
}));

export default useAddressInput;
