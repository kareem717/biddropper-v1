import { create } from "zustand";
import * as z from "zod";
import { createAddressInput } from "@/lib/validations/server/address";
import { type Address } from "./use-address-input";

interface useRadiusMapProps {
  address: Address | undefined;
  radius: number | undefined;
  setAddress: (address: Address | undefined) => void;
  setRadius: (radius: number) => void;
}

const useRadiusMap = create<useRadiusMapProps>((set, get) => ({
  address: undefined,
  radius: undefined,
  setAddress: (address: Address | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
  setRadius: (radius: number) => {
    set((state) => ({
      ...state,
      radius,
    }));
  },
}));

export default useRadiusMap;
