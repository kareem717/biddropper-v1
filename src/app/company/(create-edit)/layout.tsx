interface CompanyAlterLayoutProps {
	children: React.ReactNode;
}

export default function CompanyAlterLayout({
	children,
}: CompanyAlterLayoutProps) {
	return (
		<div className="overflow-hidden bg-[url('/images/gradient-filler-02.jpeg')] bg-cover bg-no-repeat h-screen flex items-center justify-center">
			<main className="container">{children}</main>
		</div>
	);
}
