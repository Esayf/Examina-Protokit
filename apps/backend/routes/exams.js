const express = require("express");
const Exam = require("../models/Exam");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const router = express.Router();
const crypto = require("crypto");
const Classroom = require("../models/Classroom");
const isAuthenticated = require("../middleware/auth");

router.use((req, res, next) => {
	isAuthenticated(req, res, next)
})
router.get("/create", (req, res) => {
	res.render("exams/create");
});

router.post("/", async (req, res) => {
	try {
		// Check if the logged-in user is a teacher
		if (req.user.role !== "teacher") {
			return res.status(403).json({ message: "Unauthorized" });
		}

		// Check if the logged-in teacher is allowed to create the exam for the given classroom
		const classroomId = req.body.classroomId;
		const classroom = await Classroom.findById(classroomId);
		if (
			!classroom ||
			classroom.teacher.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({
				message:
					"You are not allowed to create exams for this classroom",
			});
		}

		await Exam.create(creator = req.user, title = req.body.title, questions = req.body.questions, rootHash = req.body.rootHash, contract_address = req.body.contract_address);
		res.json({ success: true, message: "Exam created successfully" });
	} catch (error) {
		console.log(error);
		res.render("error/500");
	}
});

router.post("/create", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const newExam = new Exam({
			creator: user._id,
			title: req.body.title,
			description: req.body.description,
			startDate: req.body.startDate,
			duration: req.body.duration,
			rootHash: req.body.rootHash,
			secretKey: req.body.secretKey
		});

		newExam.save().then((result) => {
			console.log(result);
			// Add newExam._id to each question in req.body.questions
			const questions = req.body.questions.map((question) => {
				question.exam = newExam._id;
				return question;
			});
			Question.insertMany(questions).then((result) => {
				console.log("Insterted many questions", result);
			}).catch((err) => {
				console.log(err);
			});
			res.status(200).json({ message: "Exam created successfully", newExam: result });
		}).catch((err) => {
			console.log(err)
			res.status(500).send({ type: "Error when saving" });
		});
	} catch (err) {
		res.status(500).json({ message: err });
	}
});
router.get("/", async (req, res) => {
	try {
		const exams = await Exam.find();
		res.json(exams);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).render("error/404");
		}
		res.json(exam);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

// create an answer and push it to the exam
router.post("/:id/answer/submit", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
		const hashInput = user.walletAddress + JSON.stringify(req.body.answer.selectedOption);
		const answerHash = crypto
			.createHash("sha256")
			.update(hashInput)
			.digest("hex");
		const question = await Question.findById(req.body.answer.questionId);
		const answer = { question: question._id, selectedOption: req.body.answer.selectedOption, answerHash: answerHash };
		const examId = req.params.id;
		const exam = await Exam.findById(examId);

		if (!exam) {
			return res.status(500).json({ message: "Exam not found" });
		}
		// Find answers by user inside Answer schema
		let userAnswers = await Answer.findOne({ user: user._id, exam: examId });
		if (!userAnswers) {
			userAnswers = new Answer({
				user: req.session.user,
				exam: examId,
				answers: [answer]
			});
			userAnswers.save();
		} else {
			userAnswers.answers.push(answer);
			userAnswers.save();
		}
		res.status(200).json({ message: "Answer submitted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
});
router.delete("/:id", async (req, res) => {
	try {
		const examId = req.params.id;
		const userId = req.user._id;

		// Find the exam by ID and check if the logged-in teacher created it
		const exam = await Exam.findOne({ _id: examId, creator: userId });
		if (!exam) {
			return res.status(404).json({
				message:
					"Exam not found or you are not authorized to delete it",
			});
		}

		// Delete the exam
		await Exam.findByIdAndDelete(examId);
		res.json({ message: "Exam deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

router.get("/:id/question/:questionid", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const question = await Question.findById(req.params.questionid);
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/questions", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const questions = await Question.find({ exam: exam._id });
		res.json(questions);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/answers", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answers = await Answer.find({ user: req.session.user, exam: exam._id }).populate("answers");
		res.json(answers);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/answers/:answerid", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answer = await Answer.findById(req.params.answerid);
		res.json(answer);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/question/:id", async (req, res) => {
	try {
		const question = await Question.findById(req.params.id);
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

module.exports = router;
