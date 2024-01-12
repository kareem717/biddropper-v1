import { useRef, useEffect } from "react";
import { env } from "@/env.mjs";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { Units } from "@turf/helpers";
import { cn } from "@/lib/utils";

interface RadiusMapProps extends React.ComponentPropsWithoutRef<"div"> {
  coordinates: number[];
  radius: number;
  units?: Units;
}

const RadiusMap: React.FC<RadiusMapProps> = ({
  radius,
  coordinates,
  units = "kilometers",
  ...props
}) => {
  const ACCESS_TOKEN = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Mapbox related refs
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Config and initialize service-area circle layer
  const circleCenter = turf.point(coordinates);
  const circleOptions = {
    steps: 80,
    units,
  };
  const circle = turf.circle(circleCenter, radius, circleOptions);

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: coordinates as any,
        zoom: 9,
        accessToken: ACCESS_TOKEN,
      });
    }
  });

  // Add service-area circle layer
  useEffect(() => {
    if (map.current) {
      if (map.current.getSource("circle")) {
        const source = map.current.getSource(
          "circle",
        ) as mapboxgl.GeoJSONSource;
        source.setData(circle);
      } else {
        map.current?.on("load", () => {
          if (map.current) {
            map.current.addSource("circle", {
              type: "geojson",
              data: circle,
            });

            map.current.addLayer({
              id: "circle",
              type: "fill",
              source: "circle",
              paint: {
                "fill-color": "#0080ff",
                "fill-opacity": 0.5,
              },
            });
          }
        });
      }
    }
  }, [circle]);

  return (
    <div
      className={cn(
        "map-containerb h-[min(40vh,615px)] w-[min(40vw,715px)]",
        props.className,
      )}
      ref={mapContainer}
      {...props}
    />
  );
};

export default RadiusMap;
