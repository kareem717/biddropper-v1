import { buttonVariants } from "@/components/ui/button";

export default function Home() {
	return (
		<main>
			<div className="flex flex-row gap-4 pt-[60px]">
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
