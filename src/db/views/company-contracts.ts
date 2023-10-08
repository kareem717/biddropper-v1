import { mysqlView, QueryBuilder } from "drizzle-orm/mysql-core";
import {
	contracts,
	companies,
	jobs,
	companyJobs,
	contractJobs,
} from "@/db/migrations/schema";
import { eq, sql } from "drizzle-orm";

const qb = new QueryBuilder();

export const companyContractsView = mysqlView("company_contracts_view").as(
	qb
		.select({
			contractId: sql`contract_id`.as("contract_id"),
			companyId: sql`company_id`.as("company_id"),
		})
		.from(jobs)
		.innerJoin(companyJobs, eq(companyJobs.jobId, jobs.id))
		.innerJoin(companies, eq(companies.id, companyJobs.companyId))
		.innerJoin(contractJobs, eq(contractJobs.jobId, jobs.id))
		.innerJoin(contracts, eq(contracts.id, contractJobs.contractId))
		.groupBy(contracts.id, companies.id)
);
