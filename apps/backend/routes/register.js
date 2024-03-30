const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
var Client = require("mina-signer");
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });

router.get("/session/get-message-to-sign/:walletAddress", (req, res) => {
	const { walletAddress } = req.params;
	const token = Math.random().toString(36).substring(7);
	// save token to user's session
	req.session.token = token;
	const message =
		`Please sign the message to register your session, it does not require any gas,${req.session.token}${walletAddress}`;
	req.session.message = message;
	console.log(req.session.message);
	res.json({ "message": message });
});

router.post("/", async (req, res) => {
	const { walletAddress, signature } = req.body;
	var signture = typeof signature === "string" ? JSON.parse(signature) : signature;
	const verifyBody = {
		data: req.session.message,
		publicKey: walletAddress,
		signature: signture,
	}
	const verifyResult = signerClient.verifyMessage(verifyBody);
	if (verifyResult && req.session.token) {
		// Create user if not exists
		const user = await User.find({ walletAddress: walletAddress })
		if (user.length == 0) {
			const newUser = new User({ username: walletAddress, walletAddress });
			const saved_user = await newUser.save();
			console.log("Saved user: ", saved_user)
			req.session.user = saved_user._id;
			return res.json({ success: true, user: req.session.user });
		} else {
			req.session.user = user[0]._id;
			console.log("User already exists: ", user[0])
			return res.json({ success: true, user: req.session.user });
		}
	} else {
		res.status(401).json({ token: req.session.token, error: "Invalid signature or didn't have session token" });
	}
});

router.get("/session", (req, res) => {
	res.json({ user: req.session.token });
});

module.exports = router;