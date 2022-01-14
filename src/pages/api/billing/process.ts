import Stripe from "stripe";
import { getAlpha2Code } from "i18n-iso-countries";

export default async function handler(req, res) {
	if(req.method !== "POST") return res.status(405).json({ msg: `"${req.method}" method not allowed` })
	const { bill, information, card } = req.body;
	if(!bill.currency || !bill.amount) return res.status(500).json({ msg: "Internal Error: missing bill information" });
	if(!card.card_holder || !card.card_number || !card.card_exp || !card.card_cvv) return res.status(500).json({ msg: "Missing card information." });

	// testing
	const stripe = Stripe("sk_test_51KEWkUAfTP2YhhVAyRctIMi1b5D1eWt86QoaQYF3B3gmvGREpSaArMqBNzNqcWgC0Kms6anBX28fy0bYC2mLWzIH00bhqe11O1");

	// prod
	//const stripe = Stripe("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");

	const paymentMethod = await stripe.paymentMethods.create({
		type: "card",
		billing_details: {
			name: `${information.firstName} ${information.lastName}`,
			address: {
				city: information.city,
				state: information.state,
				country: getAlpha2Code(information.country),
				line1: information.streetAddress,
				line2: information.streetAddressExt,
				postal_code: information.postcode
			}
		},
		card: {
			number: card.card_number,
			exp_month: card.card_exp.split("/")[1] ? card.card_exp.split("/")[0] : card.card_exp.split(/w+/)[0],
			exp_year: card.card_exp.split("/")[1] ? card.card_exp.split("/")[1] : card.card_exp.split(/w+/)[1],
			cvc: card.card_cvv
		}
	});

	const paymentIntent = await stripe.paymentIntents.create({
		amount: parseInt(bill.amount).toFixed(2).split(".").join(""),
		currency: bill.currency.toLowerCase(),
		payment_method: paymentMethod.id,
		confirmation_method: "manual",
		confirm: true
	});

	if(paymentIntent.status === "succeeded") return res.json({ success: true });
	if(paymentIntent.status === "requires_action") return res.json({ success: false, secret: paymentIntent.client_secret });

	return res.json({ success: false });
}
