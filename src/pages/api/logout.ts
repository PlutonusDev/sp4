import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import type { User } from "./user";

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
	req.session.destroy();
	res.json({
		loggedIn: false,
		id: "",
		username: "",
		avatarUrl: ""
	});
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions);
