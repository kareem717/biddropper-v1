import { mysqlView, QueryBuilder } from "drizzle-orm/mysql-core";
import {
	contracts,
	contractJobs,
} from "@/db/migrations/schema";
import { eq, sql } from "drizzle-orm";
import fullJobView from "./full-job";

const qb = new QueryBuilder();

const fullContractView = mysqlView("full_contract_view").as(
	qb
		.select({
			contractId: sql`contract_id`.as("contract_id"),
			jobId: sql`job_id`.as("job_id"),
			mediaId: sql`media_id`.as("media_id"),
		})
		.from(fullJobView)
		.innerJoin(contractJobs, eq(fullJobView.jobId, contractJobs.jobId))
		.innerJoin(contracts, eq(contractJobs.contractId, contracts.id))
);

export default fullContractView;
