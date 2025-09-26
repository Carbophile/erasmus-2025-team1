import { getDB, queryDB } from "./db/db";

export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);
		switch (url.pathname) {
			case "/message":
				return new Response("Hello, World!");
			case "/random":
				return new Response(crypto.randomUUID());
			case "/db-test": {
				try {
					const db = getDB(env);
					const result = await queryDB(db, "SELECT 1 as test");
					return new Response(JSON.stringify(result), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (e) {
					return new Response(`DB Error: ${e.message}`, { status: 500 });
				}
			}

			case "/user/new": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { User } = await import("./db/classes.js");
					const data = await request.json();
					const user = new User(data);
					const result = await user.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, user_id: user.id }),
							{ headers: { "Content-Type": "application/json" } },
						);
					} else {
						return new Response(
							JSON.stringify({ success: false, error: "User creation failed" }),
							{ headers: { "Content-Type": "application/json" }, status: 500 },
						);
					}
				} catch (e) {
					return new Response(`Error: ${e.message}`, { status: 500 });
				}
			}

			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
