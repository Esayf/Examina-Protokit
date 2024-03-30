const express = require("express");
const router = express.Router();
const User = require("../models/User");//Generate user route for get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.render("error/500");
    }
});

module.exports = router;