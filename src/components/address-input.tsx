import {
  useImperativeHandle,
  ComponentPropsWithoutRef,
  useState,
  Ref,
  forwardRef,
  FC,
} from "react";
import { Input } from "./ui/input";
import { AddressAutofill } from "@mapbox/search-js-react";
import { env } from "@/env.mjs";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { bodyParamSchema } from "@/lib/validations/api/(references)/addresses/request";
import * as z from "zod";
import useAddressInput from "@/hooks/use-address-input";

interface AddressInputProps extends ComponentPropsWithoutRef<typeof Input> {
  onRetrieve?: (val: AddressAutofillRetrieveResponse) => void;
}

const AddressInput: FC<AddressInputProps> = ({ onRetrieve, ...props }) => {
  const { setAddress } = useAddressInput();

  const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const vals = res?.features[0]?.properties;
    const geo = res?.features[0]?.geometry;

    const parse = bodyParamSchema.POST.safeParse({
      postalCode: vals?.postcode,
      longitude: String(geo?.coordinates[0]),
      latitude: String(geo?.coordinates[1]),
      addressLine1: vals?.address_line1,
      addressLine2: vals?.address_line2,
      city: vals?.address_level2,
      region: vals?.address_level3,
      country: vals?.country,
    });

    if (parse.success) {
      setAddress(parse.data);
      if (onRetrieve) {
        onRetrieve(res);
      }
    }
  };

  return (
    <>
      {/* @ts-ignore */}
      <AddressAutofill
        accessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onRetrieve={handleRetrieve}
      >
        <Input
          name="address"
          autoComplete="address-line1"
          placeholder="Begin to enter address..."
          {...props}
        />
      </AddressAutofill>
    </>
  );
};

export default AddressInput;
