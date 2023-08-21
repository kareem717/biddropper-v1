import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div ="gridclassName min-h-screen grid-cols-1 overflow-hidden md:grid-cols-3 lg:grid-cols-2">
			<AspectRatio ratio={16 / 9}>
				<Image
					src="/images/gradient-filler-02.jpeg"
					alt="Gradient filler background image"
					fill
					className="absolute inset-0 object-cover"
					priority
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background to-background/60 md:to-background/40" />
				<Link href="/" className="absolute left-8 top-6 z-20">
					<div className="flex lg:flex-1">
						<a className="flex flex-row items-baseline" href="/">
							<h1 className="relative flex flex-row items-baseline text-2xl font-bold">
								<span className="sr-only">BidDropper</span>
								<span className="tracking-tight hover:cursor-pointer"> 
									bid
									<span className="text-green-600">dropper</span>
								</span>
								<sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-black">
									[BETA]
								</sup>
							</h1>
						</a>
					</div>
				</Link>
			</AspectRatio>
			<main className="container absolute top-1/2 col-span-1 flex -translate-y-1/2 items-center md:static md:top-0 md:col-span-2 md:flex md:translate-y-0 lg:col-span-1">
				{children}
			</main>
		</div>
	);
}
