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

			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
