const Stripe = require("stripe")("sk_test_51KEWkUAfTP2YhhVAyRctIMi1b5D1eWt86QoaQYF3B3gmvGREpSaArMqBNzNqcWgC0Kms6anBX28fy0bYC2mLWzIH00bhqe11O1");

(async () => {
	const paymentMethod = await Stripe.paymentMethods.create({
		type: "card",
		card: {
			number: "4242424242424242",
			exp_month: 9,
			exp_year: 2022,
			cvc: 314
		}
	});

	const paymentIntent = await Stripe.paymentIntents.create({
		currency: "usd",
		amount: "15000",
		confirmation_method: "manual",
		confirm: true,
		payment_method: paymentMethod.id
	});

	console.log(paymentIntent);
	//console.log(paymentMethod);

	//const proc = await Stripe.paymentIntents.confirm(paymentIntent.id);
	//console.log("\n\n");
	//console.log(proc);
})()
