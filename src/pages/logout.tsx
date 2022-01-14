import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LogoutInterstitial() {
	const router = useRouter();

	useEffect(() => router.push("/"), []);
	return <p>Deauthorizing your device...</p>
}
