import type { User } from "../user";

import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const emptyUser = {
	loggedIn: false,
	id: "",
	username: "",
	avatarUrl: ""
}

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
	/*const recaptcha_resp = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.recaptcha}`, {
		method: "POST"
	}).then(res => res.json());

	if(!recaptcha_resp.success) return res.status(401).json({ msg: "Recaptcha failed." });*/

	const { body } = req;
	let check = await prisma.user.findUnique({
		where: { email: body.email }
	});
	if(check) return res.status(400).json({ msg: "A member with that email already exists!", ...emptyUser });

	check = await prisma.user.findUnique({
		where: { username: body.username }
	});
	if(check) return res.status(400).json({ msg: "A member with that username already exists!", ...emptyUser });

	const salt = bcrypt.genSaltSync(10); // 10 iterations
	const password = bcrypt.hashSync(body.password, salt)

	const user = await prisma.user.create({
		data: {
			username: body.username,
			firstName: body.firstName,
			lastName: body.lastName,
			dob: body.dob,
			country: body.country,
			email: body.email,
			password,
			avatarUrl: ""
		}
	});

	const userObj = {
		loggedIn: true,
		username: user.username,
		id: user.id,
		avatarUrl: user.avatarUrl
	}

	req.session.user = userObj;
	await req.session.save();

	return res.status(200).json(userObj);
}

export default withIronSessionApiRoute(loginRoute, sessionOptions);
