import useUser from "../lib/useUser";

import Layout from "../components/layouts";

export default function Profile() {
	const { user } = useUser();

	return (
		<Layout title="Profile">
			<p>{JSON.stringify(user, null, 2)}</p>
		</Layout>
	);
}
