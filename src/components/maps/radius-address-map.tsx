import {
	useImperativeHandle,
	forwardRef,
	useState,
	useRef,
	useEffect,
	Ref,
} from "react";
import { AddressAutofill } from "@mapbox/search-js-react";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { env } from "@/env.mjs";
import { Input } from "../ui/input";
import mapboxgl from "mapbox-gl";
import { Slider } from "@/components/ui/slider";
import * as turf from "@turf/turf";
import { Units } from "@turf/helpers";
import { Label } from "../ui/label";

export type RadiusAddressRef = {
	address: AddressAutofillRetrieveResponse | undefined;
	radius: number;
};

interface RadiusAddressProps extends React.ComponentPropsWithoutRef<"div"> {
	onRetrieve?: (val: AddressAutofillRetrieveResponse) => void;
	radiusSliderLabel?: string;
	maxRadius?: number;
	minRadius?: number;
	defaultRadius?: number;
	radiusStep?: number;
	defaultCoordinates?: number[];
	units?: Units;
}

function RadiusAddress(
	{
		units = "kilometers",
		radiusSliderLabel = "Select service area radius (km)",
		onRetrieve,
		maxRadius = 100,
		minRadius = 1,
		defaultRadius = 30,
		radiusStep = 1,
		defaultCoordinates = [-73.981872, 40.768037],
		...props
	}: RadiusAddressProps,
	ref: Ref<RadiusAddressRef>
) {
	const ACCESS_TOKEN = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

	// Mapbox related refs
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);

	const [radius, setRadius] = useState<number>(10);
	const [coordinates, setCoordinates] = useState<number[]>(defaultCoordinates);
	const [address, setAddress] = useState<
		AddressAutofillRetrieveResponse | undefined
	>();

	const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
		setAddress(res);

		const retrievedCoordinates = res?.features?.[0]?.geometry?.coordinates;
		if (!retrievedCoordinates) return;

		setCoordinates(retrievedCoordinates);

		if (map.current) {
			map.current.flyTo({ center: retrievedCoordinates as any });
		}

		if (onRetrieve) {
			onRetrieve(res);
		}
	};

	const handleRadiusChange = (numArr: number[]) => {
		if (!numArr[0]) return;
		setRadius(numArr[0]);
	};

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
	// Config and initialize service-area circle layer
	const circleCenter = turf.point(coordinates);
	const circleOptions = {
		steps: 80,
		units,
	};
	const circle = turf.circle(circleCenter, radius, circleOptions);

	// Add/update service-area circle layer
	useEffect(() => {
		if (map.current) {
			if (map.current.getSource("circle")) {
				const source = map.current.getSource(
					"circle"
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

						// Add circle2 layer
						map.current.addLayer({
							id: "circle2",
							type: "circle",
							source: {
								type: "geojson",
								data: {
									type: "Feature",
									geometry: {
										type: "Point",
										coordinates: coordinates, // your coordinates here
									},
									properties: {},
								},
							},
							paint: {
								"circle-radius": 10,
								"circle-color": "#007cbf",
							},
						});
					}
				});
			}

			// Update circle2 layer
			if (map.current.getLayer("circle2")) {
				const source = map.current.getSource(
					"circle2"
				) as mapboxgl.GeoJSONSource;
				source.setData({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: coordinates,
					},
					properties: {},
				});
			}
		}
	}, [circle, coordinates]);

	// Export ref values
	useImperativeHandle(
		ref,
		() => ({
			address,
			radius,
		}),
		[address, radius]
	);

	return (
		<div {...props}>
			<div className="flex flex-col mb-6 gap-4">
				<div className="col grid-rows-auto w-full">
					{/* @ts-ignore */}
					<AddressAutofill
						accessToken={ACCESS_TOKEN}
						onRetrieve={handleRetrieve}
					>
						<Input
							name="address"
							autoComplete="address-line1"
							placeholder="Enter an address..."
						/>
					</AddressAutofill>
				</div>
				<div
					className="w-[min(40vw,715px)] h-[min(40vh,615px)]"
					ref={mapContainer}
				/>
				<div className="flex flex-col gap-4 mt-8">
					<Label htmlFor="radiusSlider">{radiusSliderLabel}</Label>
					<div className="flex gap-2 justify-between">
						<Slider
							// className="max-w-[90%]"
							id="radiusSlider"
							defaultValue={[defaultRadius]}
							max={maxRadius}
							min={minRadius}
							step={radiusStep}
							value={[radius]}
							onValueChange={handleRadiusChange}
						/>
						<span className="whitespace-nowrap">{radius} km</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default forwardRef(RadiusAddress);
