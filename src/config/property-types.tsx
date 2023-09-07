// TODO: Refactor crfeate-job-form to use this and see if u can integrate it with the db schema
export const propertyTypes = [
	{
		label: "Detached",
		value: "detached",
		description: "This is a stand-alone, ditached property",
	},
	{
		label: "Apartment",
		value: "apartment",
		description: "This is an apartment or condo",
	},
	{
		label: "Semi-Detached",
		value: "semi-detached",
		description: "This property shares one common wall with another property",
	},
	{
		label: "Townhouse",
		value: "town-house",
		description: "This property is a townhome",
	},
];

export const propertyTypeValues = propertyTypes.map(
	(category) => category.value
);
