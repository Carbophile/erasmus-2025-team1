import { User } from "./db/classes";
import { getDB } from "./db/db";

export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);
		switch (url.pathname) {
			case "/message":
				return new Response("Hello, World!");
			case "/random":
				return new Response(crypto.randomUUID());

			//test cases to show teacher our db wrapper is working, can be removed later
			case "/test-get-user": {
				try {
					const db = getDB(env);
					const user = new User();
					await user.load(db, 1);
					console.log(user);

					if (user) {
						return new Response(`User found: ${user.email}`);
					} else {
						return new Response("User not found", { status: 404 });
					}
				} catch (e) {
					return new Response(`${e.message}`, { status: 500 });
				}
			}
			case "/test-create-user": {
				try {
					const db = getDB(env);
					console.log(db);
					console.log("Creating user...");
					const newUser = new User({
						email: "bV5yaKxsxxs@example.com",
						name: "Test User",
						password: "password",
					});
					await newUser.create(db);

					return new Response(`User created with ID: ${newUser.id}`);
				} catch (e) {
					return new Response(`${e.message}`, { status: 500 });
				}
			}
			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
