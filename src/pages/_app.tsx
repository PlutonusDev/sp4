import "../components/styles/index.css";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps: { ...pageProps } }) {
	return (
		<GoogleReCaptchaProvider reCaptchaKey={process.env.RECAPTCHA_SITE_KEY}>
			<ThemeProvider attribute="class">
					<Component {...pageProps} />
			</ThemeProvider>
		</GoogleReCaptchaProvider>
	);
}
