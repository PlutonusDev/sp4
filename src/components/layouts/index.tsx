import { useEffect } from "react";
import { useTheme } from "next-themes";

import SEO from "../meta/SEO";
import NavBar from "../ui/NavBar";

export default function MainLayout({ children, ...pageInfo }) {
	const { resolvedTheme, setTheme } = useTheme();
	useEffect(() => {
		const theme = resolvedTheme;
		setTheme("none");
		setTimeout(() => setTheme(theme), 100);
	}, []);

	return (
		<>
			<SEO {...pageInfo} />
			<div data-theme={resolvedTheme} className="flex min-h-screen overflow-hidden bg-indigo-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
				<div className="relative flex flex-col flex-1 overflow-x-hidden">
					<NavBar />
					<main className="mx-3 my-3">
						{children}
					</main>
				</div>
			</div>
		</>
	);
}
