// TODO: Refactor crfeate-job-form to use this and see if u can integrate it with the db schema
export const timeHorizons = [
	{
		label: "Urgent",
		value: "asap",
		description: "This needs this to start as soon as possible",
	},
	{
		label: "Within a Week",
		value: "one-week",
		description: "This needs to start within a week",
	},
	{
		label: "Within Two Weeks",
		value: "two-weeks",
		description: "This needs to start within two weeks",
	},
	{
		label: "Within a Month",
		value: "one-month",
		description: "This needs to start within a month",
	},
	{
		label: "Flexible",
		value: "flexible",
		description: "The start date is flexible",
	},
];

export const timeHorizonValues = timeHorizons.map((category) => category.value);
