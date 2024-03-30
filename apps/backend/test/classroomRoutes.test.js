const request = require("supertest");
const app = require("../app");

describe("Classroom endpoints", () => {
	let classroomId;

	// POST /classrooms endpoint testi
	it("should create a new classroom", async () => {
		const res = await request(app)
			.post("/classrooms")
			.send({
				name: "Test Classroom",
				teacherId: "teacher123",
				studentIds: ["student1", "student2"],
			});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id");
		classroomId = res.body._id;
	});
});
