const mongoose = require("mongoose");
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {});

		console.log(`MongoDB connected: to ${conn.connection.host} with url: ${process.env.MONGO_URI}`);
		// create collections from models in mongo db if they are not already created
		const collections = await mongoose.connection.db.listCollections().toArray();
		const models = Object.keys(mongoose.models);
		const modelNames = models.map((model) => model.toLowerCase() + "s");
		modelNames.forEach((model) => {
			if (!collections.some((collection) => collection.name === model)) {
				mongoose.connection.db.createCollection(model);
			}
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

module.exports = connectDB;
