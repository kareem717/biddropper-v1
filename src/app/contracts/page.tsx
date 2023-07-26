import { buttonVariants } from "@/components/ui/button";

export default function Contracts() {
	return (
		<main>
			<a href="/contracts/create" className={buttonVariants()}>
				Create
			</a>
		</main>
	);
}
