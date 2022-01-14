import Layout from "../../components/layouts";

import { GiCancel } from "react-icons/gi";

export default function BillingCanceled() {
	return (
		<Layout title="Checkout Canceled">
			<div className="flex justify-center">
				<div className="max-w-screen-sm py-8 flex justify-center">
					<div className="mx-2 alert alert-error">
						<div className="flex-1 space-x-4 items-center">
							<GiCancel className="shrink-0 text-md" />
							<label>Your checkout has been canceled and you have not been charged.</label>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
