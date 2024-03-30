const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Register Route", () => {
	it("should register a new user", async () => {
		const newUser = {
			email: "test@example.com",
			password: "testpassword",
			walletAddress: "testwalletaddress",
		};

		const response = await supertest(app).post("/register").send(newUser);

		expect(response.status).to.equal(200);
		expect(response.body).to.have.property("success", true);
		expect(response.body).to.have.property("user");

		const registeredUser = await User.findOne({ email: newUser.email });

		expect(registeredUser).to.exist;
		expect(registeredUser.email).to.equal(newUser.email);
		expect(registeredUser.walletAddress).to.equal(newUser.walletAddress);
	});
	it("should handle registration with missing fields", async () => {
		const incompleteUser = {
			email: "incomplete@example.com",
			password: "incompletepassword",
			// walletAddress alanı eksik
		};

		const response = await supertest(app)
			.post("/register")
			.send(incompleteUser);

		expect(response.status).to.equal(500);
		expect(response.body).to.have.property("error");
	});

	it("should handle registration with invalid data", async () => {
		const invalidUser = {
			email: "invalidemail",
			password: "short",
			walletAddress: "invalidwalletaddress",
		};

		const response = await supertest(app)
			.post("/register")
			.send(invalidUser);

		expect(response.status).to.equal(500);
		expect(response.body).to.have.property("error");
	});

	it("should handle registration with existing email", async () => {
		const existingUser = {
			email: "existing@example.com",
			password: "existingpassword",
			walletAddress: "existingwalletaddress",
		};

		await User.create(existingUser);

		const response = await supertest(app)
			.post("/register")
			.send(existingUser);

		expect(response.status).to.equal(500);
		expect(response.body).to.have.property("error");
	});
});
