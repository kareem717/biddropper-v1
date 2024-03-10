import React from "react";
import CompanyProfile from "@/components/app/deprecated/company-profile";
const ComapnyProfilePage = ({ params }: { params: { id: string } }) => {
  const companyId = params.id;

  console.log(companyId);
  return (
    <div>
      <CompanyProfile id={companyId} />
    </div>
  );
};

export default ComapnyProfilePage;
