interface CompanyLayoutProps {
	children: React.ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
	return (
		<div className="h-[100vh] overflow-hidden bg-[url('/images/gradient-filler-02.jpeg')] bg-cover bg-no-repeat py-[7vh] md:py-[min(300px,12vh)]">

				<main className="container ">
					{children}
				</main>
		</div>
	);
}
