import { useCallback } from "react";
import debounce from "lodash/debounce"
import { AddressOption } from "../types/types/address-interface";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  address: NominatimAddress;
}

export function useAddressAutocomplete() {
  const loadOptions = useCallback((inputValue: string): Promise<AddressOption[]> => {
    return new Promise((resolve) => {
      if (!inputValue || inputValue.length < 3) {
        resolve([]);
        return;
      }

      const debouncedFetch = debounce(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&addressdetails=1&limit=10&countrycodes=br`
          );

          const data = await response.json();

          const options: AddressOption[] = data
            .filter((item: NominatimResult) => item.address && (item.address.city || item.address.town || item.address.village))
            .map((item: NominatimResult) => {
              const city = item.address.city || item.address.town || item.address.village;
              const state = item.address.state || "";
              const country = item.address.country || "";
              const label = [city, state, country].filter(Boolean).join(", ");
              return {
                value: label,
                label,
              };
            })
            .filter((option: AddressOption, index: number, self: AddressOption[]) =>
              index === self.findIndex((o: { value: any; }) => o.value === option.value)
            );

          resolve(options);
        } catch (error) {
          resolve([]);
        }
      }, 300);

      debouncedFetch();
    });
  }, []);

  return { loadOptions };
}