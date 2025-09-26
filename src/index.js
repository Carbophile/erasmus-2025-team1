import { User } from "./db/classes";
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
			case "/quiz/new": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Quiz } = await import("./db/classes.js");
					const data = await request.json();
					const quizData = {
						name: data.name || "Placeholder name",
						score_needed: data.score_needed || "Placeholder name",
						max_time: data.max_time || "Placeholder name",
					};
					const quiz = new Quiz(quizData);

					const result = await quiz.create(db);
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
			case "/quiz/question": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Question } = await import("./db/classes.js");
					const data = await request.json();
					const questionData = {
						text: data.text || "Placeholder",
						country: data.country || "Placeholder country",
						difficulty: data.difficulty || "Placeholder",
						score_multiplier: data.score_multiplier || "Placeholder",
					};
					const question = new Question(questionData);

					const result = await question.create(db);
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
					return new Response(`Error: ${e.message}`, {
						status: 500,
					});
				}
			}
			case "/quiz/category": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Category } = await import("./db/classes.js");
					const data = await request.json();
					const categoryData = {
						create_date: data.create_date || "Placeholder",
						update_date: data.update_date || "Placeholder",
					};
					const category = new Category(categoryData);

					const result = await category.create(db);
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
					return new Response(`Error: ${e.message}`, {
						status: 500,
					});
				}
			}
			case "/quiz/result": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Result } = await import("./db/classes.js");
					const data = await request.json();
					const _resultData = {
						score: data.score || "Placeholder",
						time_taken: data.time_taken || "Placeholder",
						create_date: data.create_date || "Placeholder",
						update_date: data.update_date || "Placeholder",
					};
					const resultObject = new Result(resultdata);

					const result = await resultObject.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, user_id: user.id }),
							{ headers: { "Content-Type": "application/json" } },
						);
					} else {
						return new Response(
							JSON.stringify({
								success: false,
								errsor: "User creation failed",
							}),
							{ headers: { "Content-Type": "application/json" }, status: 500 },
						);
					}
				} catch (e) {
					return new Response(`Error: ${e.message}`, {
						status: 500,
					});
				}
			}

			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
