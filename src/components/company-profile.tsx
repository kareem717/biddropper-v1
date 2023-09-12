import { FC } from "react";
// import useSWR from "swr";

interface CompanyProfileProps {
	id: string;
}

const CompanyProfile: FC<CompanyProfileProps> = ({ id }) => {
	return <div>{id}</div>;
};

export default CompanyProfile;
