const express = require("express");
const Exam = require("../models/Exam");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const questions = await Question.find({});
		res.status(200).json(questions);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

module.exports = router;