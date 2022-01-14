import { useEffect, useMemo, useState } from "react";
import { Rx, useRxOrThrow } from "@rixio/react";
import { from } from "rxjs";
import { createRaribleSdk } from "@rarible/sdk";
import type { IConnector, ConnectionState } from "@rarible/sdk-wallet-connector";
import { IRaribleSdk } from "@rarible/sdk/build/domain";
import { BlockchainWallet } from "@rarible/sdk-wallet";
import { Blockchain } from "@rarible/api-client";

export type ConnectorComponentProps = {
	connector: IConnector<string, BlockchainWallet>
	children: (sdk: IRaribleSdk, walletAddress: string | undefined, connection: ConnectionState<BlockchainWallet>) => JSX.Element
}

export function SdkWalletConnector({ connector, children }: ConnectorComponentProps) {
	const conn = useRxOrThrow(connector.connection);
	const [ address, setAddress ] = useState<string | undefined>(undefined);

	useEffect(() => {
		if(conn?.status === "connected") {
			const wallet = conn.connection;
			switch(wallet.blockchain) {
				case Blockchain.ETHEREUM:
					wallet.ethereum.getFrom().then(add => setAddress(add)).catch(() => setAddress(undefined));
					break;
				case Blockchain.TEZOS:
					wallet.provider.address().then(add => setAddress(add)).catch(() => setAddress(undefined));
					break;
				case Blockchain.FLOW:
					wallet.fcl.currentUser().authenticate().then(auth => setAddress(auth?.addr)).catch(() => setAddress(undefined));
					break;
				default:
					setAddress(undefined);
			}
		}
	}, [conn]);

	if(conn.status === "disconnected" || conn.status === "connecting") {
		return <Options connector={connector} connectionState={conn} />
	} else if(conn.status === "initializing") {
		return <p>Initializing...</p>;
	} else {
		const sdk = createRaribleSdk(conn.connection, "staging");

		return (
			<>
				{conn.disconnect && <button className="btn btn-error ml-4" onClick={conn.disconnect}>Disconnect</button>}
				{children(sdk, address, conn)}
			</>
		);
	}
}

interface OptionsProps<C> {
	connector: IConnector<string, C>
	connectionState: ConnectionState<C>
}

function Options<C>({ connector, connectionState }: OptionsProps<C>) {
	const options$ = useMemo(() => from(connector.getOptions()), [ connector ]);
	return (
		<Rx value$={options$}>{options => (
			<>
				<p>Connect to:</p>
				{options.map(o => (
					<div key={o.option}>
						<button className="mb-4 btn btn-info" onClick={() => connector.connect(o)}>{o.option}</button>
						{connectionState.status === "connecting" && connectionState.providerId === o.provider.getId() ? <span className="ml-2 font-bold animate-pulse">Connecting...</span> : null}
					</div>)
				)}
			</>
		)}</Rx>
	);
}
