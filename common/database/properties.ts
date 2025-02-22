import type { Model } from "mongoose";
import database from "./connection";
import { type UserSchema, userSchema } from "../schemas/user";

database.connect();
const connection = database.getConnection();
if (!connection) {
	throw new Error("Connection not found");
}
// Collection Initialization
const database_collection: {
	user: Model<UserSchema>;
} = {
	user: connection.model("User", userSchema, "User"),
};

// Index checker
for (const key in database_collection) {
	const model = database_collection[key as keyof typeof database_collection];
	((key, model) => {
		model.on("index", (err) => {
			if (err) {
				console.warn(`Indexing error for model ${key}: ${err}`);
			}
		});
	})(key, model);
}

export default database_collection;
