import { ComponentPropsWithoutRef, useMemo, useState, FC } from "react";
import { env } from "@/env.mjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Circle,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddressInput from "./features/address-input";
import useAddressInput, { type Address } from "@/hooks/use-address-input";
import { useTheme } from "next-themes";
import { LabelSlider } from "../ui/label-slider";
import { cn } from "@/lib/utils/shadcn";
import useRadiusMap from "@/hooks/use-radius-map";

interface RadiusAddressMapProps extends ComponentPropsWithoutRef<"div"> {
  addressProps?: ComponentPropsWithoutRef<typeof AddressInput>;
  mapContainerProps?: ComponentPropsWithoutRef<typeof MapContainer>;
  defaultPosition?: { lat: number; lng: number };
  label?: string;
}

const RadiusAddressMap: FC<RadiusAddressMapProps> = ({
  addressProps,
  mapContainerProps,
  defaultPosition = { lat: 43.6532, lng: -79.3832 },
  label,
  className,
  ...props
}) => {
  const { address } = useAddressInput();
  const { theme } = useTheme();
  const [radius, setRadius] = useState<number>(50);
  const { setAddress: setMapAddress, setRadius: setMapRadius } = useRadiusMap();

  const mapStyle = useMemo(
    () =>
      theme === "dark"
        ? env.NEXT_PUBLIC_MAPBOX_STYLE_DARK
        : env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
    [theme],
  );

  const centerPosition = {
    lat: Number(address?.latitude) || defaultPosition.lat,
    lng: Number(address?.longitude) || defaultPosition.lng,
  };

  const MapPanner = () => {
    const map = useMap();
    map.panTo(centerPosition);
    return null;
  };

  return (
    <div
      className={cn(
        "relative h-60 w-full overflow-hidden rounded-[var(--radius)] sm:h-96",
        className,
      )}
      {...props}
    >
      <AddressInput
        className="absolute right-1 top-1 z-20 h-10 w-3/4 sm:right-2 sm:top-2 sm:h-12 sm:w-2/5"
        {...addressProps}
        onRetrieve={(address) => {
          setMapAddress(address);
          addressProps?.onRetrieve?.(address);
        }}
      />
      {address && (
        <div className="absolute bottom-6 z-20 flex w-full items-center justify-center">
          <LabelSlider
            defaultValue={[radius]}
            onValueChange={(val) => {
              setRadius(val[0] || 0);
              setMapRadius(val[0] || 0);
            }}
            max={9999}
            step={1}
            className="w-4/5 sm:w-1/2"
            label={label || " Radius"}
          />
        </div>
      )}
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="z-0 h-full w-full"
        {...mapContainerProps}
      >
        <MapPanner />
        <TileLayer
          attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/${mapStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        {address && (
          <LayerGroup>
            <Circle
              center={centerPosition}
              pathOptions={{
                color: "hsl(var(--primary))",
                fillColor: "hsl(var(--primary))",
              }}
              radius={radius * 1000}
            />
            <Marker
              position={centerPosition}
              icon={
                new L.Icon({
                  iconUrl: "/map-marker.svg",
                  iconSize: [29.375, 40],
                })
              }
            />
          </LayerGroup>
        )}
      </MapContainer>
    </div>
  );
};

export default RadiusAddressMap;
