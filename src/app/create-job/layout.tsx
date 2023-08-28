import AuthSessionProvider from "@/components/auth-session-provider";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<AuthSessionProvider>
				<body>{children}</body>
			</AuthSessionProvider>
		</html>
	);
}
