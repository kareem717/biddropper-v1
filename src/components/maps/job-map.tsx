"use client";

import { env } from "@/env.mjs";
import { cn } from "@/lib/utils";
import mapboxgl from "mapbox-gl";
import { FC, useRef, useEffect, ComponentPropsWithoutRef } from "react";

interface JobMapProps extends ComponentPropsWithoutRef<"div"> {
  zoom?: number;
  mapStyle?: string;
  lng: number;
  lat: number;
}

const JobMap: FC<JobMapProps> = ({
  zoom,
  lng,
  lat,
  className,
  mapStyle,
  ...props
}) => {
  mapboxgl.accessToken = env["NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN"];

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current as any,
      style: mapStyle || "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom || 10,
    }) as any;
  });

  return (
    <div
      ref={mapContainer}
      className={cn("map-containerb", className)}
      {...props}
    />
  );
};

export default JobMap;
