const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Login Route", () => {
	it("should log in a user with valid credentials", async () => {
		const testUser = {
			email: "test@example.com",
			password: "testpassword",
		};

		await User.create(testUser);

		const response = await supertest(app).post("/login").send(testUser);

		expect(response.status).to.equal(200);
		expect(response.body).to.have.property("success", true);
		expect(response.body).to.have.property("user");
	});
	it("should handle login with invalid credentials", async () => {
		const invalidUser = {
			email: "invalid@example.com",
			password: "invalidpassword",
		};

		const response = await supertest(app).post("/login").send(invalidUser);

		expect(response.status).to.equal(401);
		expect(response.body).to.have.property(
			"error",
			"Invalid email or password"
		);
	});

	it("should handle errors during login process", async () => {
		const errorUser = {
			email: "error@example.com",
			password: "errorpassword",
		};

		const response = await supertest(app).post("/login").send(errorUser);

		expect(response.status).to.equal(500);
		expect(response.body).to.have.property("error");
	});
});
