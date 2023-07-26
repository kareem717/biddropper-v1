import { buttonVariants } from "@/components/ui/button";

export default function Home() {
	return (
		<main>
			<div className="flex flex-row gap-4">
				<a href="/contracts" className={buttonVariants()}>
					Contracts
				</a>

				<a href="/company" className={buttonVariants()}>
					Company
				</a>
			</div>
		</main>
	);
}
