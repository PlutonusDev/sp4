import { Client } from "@googlemaps/google-maps-services-js";

export default async function handler(req, res) {
	console.log(process.env.GOOGLE_MAPS_API_KEY);
	const client = new Client({});
	await client.placeAutocomplete({ request: { params: {
		input: req.query.place,
		key: process.env.GOOGLE_MAPS_API_KEY
	}}}).then(resp => {
		res.json(resp);
	}).catch(e => {
		res.status(500).json(e.message);
	});
}
