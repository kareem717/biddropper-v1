"use client";
import { useState, FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface CompanySelectProps {
  companies?: {
    name: string;
    id: string;
  }[];
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const CompanySelect: FC<CompanySelectProps> = ({
  companies,
  onValueChange,
}) => {
  const [company, setCompany] = useState<string | undefined>(undefined);

  return (
    <>
      {companies && (
        <Select
          onValueChange={(value) => {
            setCompany(value);
            onValueChange(value);
          }}
          value={company}
        >
          <SelectTrigger className="mt-4 w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => {
              return (
                <SelectItem value={company.id} key={company.id}>
                  {company.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </>
  );
};

export default CompanySelect;
