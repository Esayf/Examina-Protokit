const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");

describe("Exam Routes", () => {
	it("should create a new exam", async () => {
		const response = await supertest(app)
			.post("/exams")
			.send(sampleExamData);

		expect(response.status).to.equal(302);
	});
	it("should get all exams", async () => {
		const response = await supertest(app).get("/exams");

		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("array");
	});

	it("should get a specific exam by ID", async () => {
		const existingExamId = "4545";

		const response = await supertest(app).get(`/exams/${existingExamId}`);

		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("object");
	});
	it("should submit user answers for a specific exam", async () => {
		const existingExamId = "4545";
		const userAnswers = ["answer1", "answer2", "answer3"];

		const response = await supertest(app)
			.post(`/exams/${existingExamId}`)
			.send({
				address: "0xselim",
				answers: userAnswers,
			});

		expect(response.status).to.equal(302);
	});
});
