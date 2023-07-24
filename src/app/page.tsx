import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
	return (
		<main>
			<a href="/contracts" className={buttonVariants()}>
				Contracts
			</a>
		</main>
	);
}
