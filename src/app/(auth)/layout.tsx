import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LogoDiv from "@/components/logo-div";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex flex-col h-screen">
			<nav className="p-3 flex justify-between">
				<LogoDiv />
				<ModeToggle />
			</nav>
			<main className="flex-grow">
				<div className="h-full flex items-center justify-center">{children}</div>
			</main>
		</div>
	);
}
