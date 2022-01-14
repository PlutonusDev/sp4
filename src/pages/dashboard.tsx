import { useState, useEffect } from "react";
import { SdkWalletConnector } from "../sdk/walletConnector";
import { connector } from "../sdk/connectorSetup";

import Layout from "../components/layouts";

export default function Dashboard() {
	const [ mounted, setMounted ] = useState(false);
	useEffect(() => setMounted(true), []);

	return mounted ? (
		<Layout title="Dashboard">
			<SdkWalletConnector connector={connector}>
				{(sdk, walletAddress, connection) => (
					<span className="font-bold text-lg">Connected: {walletAddress ?? <span className="text-red-500">NOT CONNECTED</span>}</span>

				)}
			</SdkWalletConnector>
		</Layout>
	) : <p>Mounting...</p>;
}
