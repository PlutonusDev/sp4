import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk";
import Web3 from "web3";
import { BlockchainWallet, FlowWallet, TezosWallet, EthereumWallet } from "@rarible/sdk-wallet";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import { Blockchain } from "@rarible/api-client";
import {
	Connector,
	IConnectorStateProvider,
	ConnectionProvider,
	MEWConnectionProvider,
	InjectedWeb3ConnectionProvider,
	BeaconConnectionProvider,
	FclConnectionProvider,
	AbstractConnectionProvider,
	EthereumProviderConnectionResult,
	FlowProviderConnectionResult,
	TezosProviderConnectionResult,
	TorusConnectionProvider,
	WalletLinkConnectionProvider
} from "@rarible/sdk-wallet-connector";

const ethereumRpcMap: Record<number, string> = {
	1: "https://node-mainnet.rarible.com",
	3: "https://node-ropsten.rarible.com",
	4: "https://node-rinkeby.rarible.com",
	17: "https://node-e2e.rarible.com"
}

type ProviderResult = EthereumProviderConnectionResult | FlowProviderConnectionResult | TezosProviderConnectionResult;

function mapToBlockchainWallet<O, C extends ProviderResult>(provider: AbstractConnectionProvider<O, C>): ConnectionProvider<O, BlockchainWallet> {
	return provider.map(wallet => {
		switch(wallet.blockchain) {
			case Blockchain.ETHEREUM: {
				return new EthereumWallet(new Web3Ethereum({ web3: new Web3(wallet.provider), from: wallet.address }));
			}
			case Blockchain.TEZOS: {
				return new TezosWallet(wallet.provider);
			}
			case Blockchain.FLOW: {
				return new FlowWallet(wallet.fcl);
			}
			default:
				throw new Error("Unknown blockchain");
		}
	});
}

const injected = mapToBlockchainWallet(new InjectedWeb3ConnectionProvider());

const mew = mapToBlockchainWallet(new MEWConnectionProvider({
	networkId: 4,
	rcpUrl: ethereumRpcMap[4]
}));

const beacon = mapToBlockchainWallet(new BeaconConnectionProvider({
	appName: "Plutonus! Securities Holdings",
	accessNode: "https://tezos-hangzhou-node.rarible.org",
	network: TezosNetwork.HANGZHOUNET
}));

const fcl = mapToBlockchainWallet(new FclConnectionProvider({
	accessNode: "https://access-testnet.onflow.org",
	walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
	network: "testnet",
	applicationTitle: "Plutonus! Securities Holdings",
	applicationIcon: "https://staging2.plutonus.dev/assets/images/logo.png"
}));

const torus = mapToBlockchainWallet(new TorusConnectionProvider({
	network: { host: "rinkeby" }
}));

const walletlink = mapToBlockchainWallet(new WalletLinkConnectionProvider({
	estimationUrl: ethereumRpcMap[4],
	networkId: 4,
	url: ethereumRpcMap[4]
}, {
	appName: "Plutonus! Securities Holdings",
	appLogoUrl: "https://staging2.plutonus.dev/assets/images/logo.png",
	darkMode: true
}));

const state: IConnectorStateProvider = {
	async getValue(): Promise<string | undefined> {
		const value = localStorage.getItem("saved_provider");
		return value || undefined;
	},
	async setValue(value: string | undefined): Promise<void> {
		localStorage.setItem("saved_provider", value || "");
	}
}

export const connector = Connector
	.create(injected, state)
	.add(torus)
	.add(walletlink)
	.add(mew)
	.add(beacon)
	.add(fcl)
