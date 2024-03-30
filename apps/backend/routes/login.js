const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/login", (req, res) => {
	res.render("login");
});

router.post(
	"/login",
	(req, res, next) => {
		passport.authenticate("local", (err, user, info) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: err.message });
			}
			if (!user) {
				return res
					.status(401)
					.json({ error: "Invalid email or password" });
			}
			req.logIn(user, (err) => {
				if (err) {
					console.error(err);
					return res.status(500).json({ error: err.message });
				}
				return res.json({ success: true, user });
			});
		})(req, res, next);
	},
	(req, res) => {
		// Başarılı giriş durumu
		res.json({ success: true, user: req.user });
	}
);

module.exports = router;
