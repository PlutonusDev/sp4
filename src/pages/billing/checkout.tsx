
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Elements, StripeProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Client } from "@googlemaps/google-maps-services-js";
import CardValidator from "card-validator";

import Layout from "../../components/layouts";
import Link from "next/link";
import CheckoutForm from "../../components/meta/CheckoutForm";
import { CountryDropdown, RegionDropdown, CountryRegionData } from "react-country-region-selector";

import { ImCancelCircle, ImSpinner9 } from "react-icons/im";

const stripe = loadStripe("pk_test_51KEWkUAfTP2YhhVAIXO4YmlQcYTG8hJxExj0W8PfYql0Pc5zRpkuyHasyRLDZem0aiGbOXhgIqUB8ZzP4e9phFQb00znCLDoku");

export default function Checkout() {
	const [ clientSecret, setClientSecret ] = useState("");
	const [ step, setStep ] = useState(0);
	const [ processing, setProcessing ] = useState(false);
	const [ message, setMessage ] = useState(null);
	const [ location, setLocation ] = useState({
		country: "",
		region: ""
	});
	const [ cardType, setCardType ] = useState("");
	const [ cardSecType, setCardSecType ] = useState("");
	// TODO: Get bill information from DB from billId or TxId etc etc
	const [ paymentInfo, setPaymentInfo ] = useState({
		bill: {
			currency: "USD",
			amount: "25",
			description: "Description placeholder"
		},
		information: {},
		card: {}
	});

	const billingInfoSchema = Yup.object().shape({
		firstName: Yup.string()
			.required("First Name is required"),
		lastName: Yup.string()
			.required("Last Name is required"),
		streetAddress: Yup.string()
			.required("Street Address is required"),
		streetAddressExt: Yup.string(),
		city: Yup.string()
			.required("City is required"),
		country: Yup.string()
			.test("test-country", "Country is required", () => location.country && !["", "Select Country"].includes(location.country)),
		state: Yup.string()
			.test("test-state", "State / Province is required", () => location.region && !["", "-", "Select Region"].includes(location.region)),
		postcode: Yup.string()
			.required("Postal Code is required")
	});

	const billingInfoFormOptions = { resolver: yupResolver(billingInfoSchema) };
	const { register: billingRegister, handleSubmit: billingHandleSubmit, reset: billingReset, formState: billingFormState } = useForm(billingInfoFormOptions);
	const { errors: billingErrors } = billingFormState;

	function billingOnSubmit(data) {
		data.country = location.country;
		data.state = location.region;
		setPaymentInfo({ ...paymentInfo, information: data });
		setStep(1);
	}

	const paymentDetailsSchema = Yup.object().shape({
		card_holder: Yup.string()
			.required("Card Holder required")
			.test("text-cardholder", "Card Holder is invalid", val => CardValidator.cardholderName(val).isValid),
		card_number: Yup.string()
			.test("test-cardnumber", "Card Number is invalid", val => CardValidator.number(val).isValid),
		card_exp: Yup.string()
			.test("test-cardexp", "Card Expiry is invalid", val => CardValidator.expirationDate(val).isValid),
		card_cvv: Yup.string()
			.test("test-cardcvv", "Card " + cardSecType + " is invalid", val => CardValidator.cvv(val).isValid)
	});

	const paymentDetailsFormOptions = { resolver: yupResolver(paymentDetailsSchema) };
	const { register: paymentRegister, handleSubmit: paymentHandleSubmit, reset: paymentReset, formState: paymentFormState } = useForm(paymentDetailsFormOptions);
	const { errors: paymentErrors } = paymentFormState

	function paymentOnSubmit(data) {
		setPaymentInfo({ ...paymentInfo, card: data });
		setMessage(null);
		setStep(2);
	}

	async function processPayment() {
		setProcessing(true);
		const resp = await fetch("/api/billing/process", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(paymentInfo)
		}).then(res => res.json());

		if(!resp.success) {
			if(resp.secret) {
				stripe.confirmCardPayment(resp.secret);
			}
			setProcessing(false);
			setStep(1);
			return setMessage("Check your payment information and try again.");
		}

		setStep(3);
	}

	return (
		<Layout title="Checkout">
			<Elements stripe={stripe}>
			<StripeProvider publishableKey="pk_test_51KEWkUAfTP2YhhVAIXO4YmlQcYTG8hJxExj0W8PfYql0Pc5zRpkuyHasyRLDZem0aiGbOXhgIqUB8ZzP4e9phFQb00znCLDoku">
			<div className="flex flex-col mx-auto lg:w-1/2 xl:max-w-screen-sm py-8">
				<ul className="w-full steps">
					<li className={`step step-primary ${step == 0 && "step-neutral"}`}>Billing Information</li>
					<li className={`step step-neutral ${step >= 1 && "step-primary"}`}>Payment Details</li>
					<li className={`step step-neutral ${step >= 2 && "step-primary"}`}>Confirm</li>
					<li className={`step step-neutral ${step >= 3 && "step-primary"}`}>Order Complete</li>
				</ul>

				<div className="mt-10 px-6">
					<div className="mb-8">
						<h3 className="text-2xl text-center">Billing Page</h3>
						<h4 className="text-lg text-center">Order Total: ${parseInt(paymentInfo.bill.amount).toFixed(2)}{paymentInfo.bill.currency}</h4>
						<p className="text-sm text-gray-700 dark:text-gray-300 text-center">{paymentInfo.bill.description}</p>
					</div>
					{step == 0 && (
						<form onSubmit={billingHandleSubmit(billingOnSubmit)}>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-1/2">
										<label htmlFor="firstName" className="label">
											<span className="label-text">First Name <span className="text-red-500">*</span></span>
										</label>
										<input name="firstName" type="text" {...billingRegister("firstName")} className={`w-full text-lg input ${billingErrors.firstName && "input-error"}`} />
										<div className="h-6 text-red-500">{billingErrors.firstName?.message}</div>
									</div>
									<div className="sm:w-1/2">
										<label htmlFor="lastName" className="label">
											<span className="label-text">Last Name <span className="text-red-500">*</span></span>
										</label>
										<input name="lastName" type="text" {...billingRegister("lastName")} className={`w-full text-lg input ${billingErrors.lastName && "input-error"}`} />
										<div className="h-6 text-red-500">{billingErrors.lastName?.message}</div>
									</div>
								</div>
							</div>
							<div className="form-control">
								<label htmlFor="streetAddress" className="label">
									<span className="label-text">Street Address Line 1 <span className="text-red-500">*</span></span>
								</label>
								<input name="streetAddress" type="text" {...billingRegister("streetAddress")} className={`w-full text-lg input ${billingErrors.streetAddress && "input-error"}`} />
								<div className="h-6 text-red-500">{billingErrors.streetAddress?.message}</div>
							</div>
							<div className="form-control">
								<label htmlFor="streetAddressExt" className="label">
									<span className="label-text">Street Address Line 2</span>
								</label>
								<input type="text" {...billingRegister("streetAddressExt")} className="w-full text-lg input" />
								<div className="h-6" />
							</div>
							<div className="form-control">
								<label htmlFor="city" className="label">
									<span className="label-text">City <span className="text-red-500">*</span></span>
								</label>
								<input type="text" {...billingRegister("city")} name="city" className={`w-full text-lg input ${billingErrors.city && "input-error"}`} />
								<div className="h-6 text-red-500">{billingErrors.city?.message}</div>
							</div>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="sm:w-1/3">
										<label htmlFor="country" className="label">
											<span className="label-text">Country <span className="text-red-500">*</span></span>
										</label>
										<CountryDropdown value={location.country} onChange={val => setLocation({ country: val })} className={`w-full text-lg select ${billingErrors.country && "select-error"}`} />
										<input type="hidden" name="country" {...billingRegister("country")} value="" />
										<div className="h-6 text-red-500">{billingErrors.country?.message}</div>
									</div>
									<div className="sm:w-1/3">
										<label htmlFor="state" className="label">
											<span className="label-text">State / Province <span className="text-red-500">*</span></span>
										</label>
										<RegionDropdown value={location.region} country={location.country} onChange={val => setLocation({ country: location.country, region: val })} className={`w-full text-lg select ${billingErrors.state && "select-error"}`} />
										<input type="hidden" name="state" {...billingRegister("state")} value="" />
										<div className="h-6 text-red-500">{billingErrors.state?.message}</div>
									</div>
									<div className="sm:w-1/3">
										<label htmlFor="postcode" className="label">
											<span className="label-text">Postcode <span className="text-red-500">*</span></span>
										</label>
										<input type="text" {...billingRegister("postcode")} name="postcode" className={`w-full text-lg input ${billingErrors.postcode && "input-error"}`} />
										<div className="h-6 text-red-500">{billingErrors.postcode?.message}</div>
									</div>
								</div>
							</div>
							<div className="mt-8 flex items-center justify-center">
								<button type="submit" className="btn btn-primary">Continue</button>
							</div>
						</form>
					)}

					{step == 1 && (
						<form onSubmit={paymentHandleSubmit(paymentOnSubmit)}>
							{message && (
								<div className="my-4 alert alert-error mx-auto">
									<div className="flex-1 items-center space-x-4">
										<ImCancelCircle className="shrink-0 text-md" />
										<label>{message}</label>
									</div>
								</div>
							)}
							<div className="form-control">
								<label htmlFor="card_holder" className="label">
									<span className="label-text">Cardholder Name <span className="text-red-500">*</span></span>
								</label>
								<input type="text" name="card_holder" {...paymentRegister("card_holder")} className={`w-full text-lg input ${paymentErrors.card_holder && "input-error"}`} />
								<div className="h-6 text-red-500">{paymentErrors.card_holder?.message}</div>
							</div>
							<div className="form-control">
								<div className="block sm:flex sm:space-x-8">
									<div className="w-full sm:w-1/2">
										<div className="flex flex-row justify-between">
											<label htmlFor="card_number" className="label">
												<span className="label-text">Card Number <span className="text-red-500">*</span></span>
											</label>
											<label className="label">
												<span className="label-text">{cardType}</span>
											</label>
										</div>
										<input type="text" {...paymentRegister("card_number")} onChange={e => { setCardType(CardValidator.number(e.target.value).card?.niceType || ""); setCardSecType(CardValidator.number(e.target.value).card?.code?.name || ""); }} className={`w-full text-lg font-['quicksand'] input ${paymentErrors.card_number && "input-error"}`} />
										<div className="h-6 text-red-500">{paymentErrors.card_number?.message}</div>
									</div>
									<div className="w-full sm:w-1/4">
										<label htmlFor="card_exp" className="label">
											<span className="label-text">Expiry <span className="text-red-500">*</span></span>
										</label>
										<input type="text" placeholder="01/26" {...paymentRegister("card_exp")} className={`w-full text-lg input ${paymentErrors.card_exp && "input-error"}`} />
										<div className="h-6 text-red-500">{paymentErrors.card_exp?.message}</div>
									</div>
									<div className="w-full sm:w-1/4">
										<label htmlFor="card_cvv" className="label">
											<span className="label-text">{cardSecType || "CVV"} <span className="text-red-500">*</span></span>
										</label>
										<input type="text" {...paymentRegister("card_cvv")} className={`w-full text-lg input ${paymentErrors.card_cvv && "input-error"}`} />
										<div className="h-6 text-red-500">{paymentErrors.card_cvv?.message}</div>
									</div>
								</div>
							</div>
							<div className="mt-8 flex items-center justify-center">
								<button type="submit" className="btn btn-primary">Continue</button>
							</div>
						</form>
					)}

					{step == 2 && (
						<>
							<div className="card lg:card-side card-bordered">
								<div className="card-body">
									<h2 className="card-title">Confirm Your Order Details</h2>
									<p className="mt-4"><span className="text-lg">Payment Method:</span><br/>{CardValidator.number(paymentInfo.card.card_number).card?.niceType} &bull;&bull;&bull;&bull; {paymentInfo.card.card_number.slice(-4)} (Exp: {paymentInfo.card.card_exp})</p>
									<p className="mt-4"><span className="text-lg">Order Total:</span><br/><sup>$</sup>{parseInt(paymentInfo.bill.amount).toFixed(2)} <small className="text-gray-700 dark:text-gray-300">{paymentInfo.bill.currency}</small></p>
									<p className="mt-4 text-gray-700 dark:text-gray-300">{paymentInfo.bill.description}</p>
									<div className="justify-end card-actions">
										{!processing && (
											<Link href="/billing/canceled">
												<button className="btn btn-outline btn-error">Cancel</button>
											</Link>
										)}
										<button disabled={processing || message} onClick={() => processPayment()} className="btn btn-accent">{processing ? <ImSpinner9 className="animate-spin" /> : "Pay Now"}</button>
									</div>
								</div>
							</div>
							{/*<p>{JSON.stringify(paymentInfo, null, 2)}</p>*/}
						</>
					)}

					{step == 3 && (
						<p>Order Complete!</p>
					)}
				</div>
			</div>
			<div className="mt-4 border-2 rounded-lg mx-4 border-base-100 dark:border-gray-700">
				<div className="card-body flex flex-col sm:flex-row justify-center items-center px-4 py-2">
					<div className="m-4 w-16 h-16 rounded-lg bg-indigo-700">
						<img className="p-2 w-full h-full" src="/static/images/climatebadge.png" />
					</div>
					<p className="text-md text-center sm:text-left">We will contribute <span className="font-bold">1% of your purchase</span> to remove CO<sub>2</sub> from our atmosphere.</p>
				</div>
			</div>
			{/*<a onClick={() => setStep(step+1)} className="mt-8 btn btn-primary w-32">Next</a>*/}
			</StripeProvider>
			</Elements>
		</Layout>
	);
}
