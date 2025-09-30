import { Category, Option, Question, Quiz, Result, User } from "./db/classes";
import { getDB, queryDB } from "./db/db";

// This is nowhere near final, just a skeleton to build upon
export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);
		var return_msg = "DB Test:\n";
		var wipe_msg = "DB Test:\n";

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
					const resultData = {
						score: data.score || "Placeholder",
						time_taken: data.time_taken || "Placeholder",
						create_date: data.create_date || "Placeholder",
						update_date: data.update_date || "Placeholder",
					};
					const resultObject = new Result(resultData);

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
								error: "User creation failed",
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

			// simple test route to create and test all classes, teacher wanted it :P ignore the formatting that messed up with merging w main
			case "/test-db": {
				try {
					const db = getDB(env);
					console.log("Creating user...");
					return_msg += "Creating user...\n";
					const newUser = new User({
						email: "bV5yaKxsxxs@example.com",
						name: "Test User",
						password: "password",
					});
					await newUser.create(db);
					console.log("Loading user...");
					return_msg += "Loading user...\n";
					const user = new User();
					await user.load(db, 1);
					console.log(user);
					console.log("Creating category...");
					return_msg += "Creating category...\n";
					const newCategory = new Category({ name: "Culture" });
					await newCategory.create(db);
					console.log("Loading category...");
					return_msg += "Loading category...\n";
					const category = new Category();
					await category.load(db, 1);
					console.log(category);
					console.log("Creating quiz...");
					return_msg += "Creating quiz...\n";
					const newQuiz = new Quiz({
						name: "Test Quiz",
						description: "This is a test quiz",
						score_needed: 5,
						max_time: 30,
					});
					await newQuiz.create(db);
					console.log("Loading quiz...");
					return_msg += "Loading quiz...\n";
					const quiz = new Quiz();
					await quiz.load(db, 1);
					console.log(quiz);
					console.log("Creating question...");
					return_msg += "Creating question...\n";
					const newQuestion = new Question({
						quiz_id: 1,
						category_id: 1,
						text: "What is the capital of Croatia?",
					});
					await newQuestion.create(db);
					console.log("Loading question...");
					return_msg += "Loading question...\n";
					const question = new Question();
					await question.load(db, 1);
					console.log(question);
					console.log("Creating option...");
					return_msg += "Creating option...\n";
					const newOption = new Option({
						question_id: 1,
						option: "Zagreb",
						correct: true,
					});
					await newOption.create(db);
					console.log("Loading option...");
					return_msg += "Loading option...\n";
					const option = new Option();
					await option.load(db, 1);
					console.log(option);
					console.log("Creating result...");
					return_msg += "Creating result...\n";
					const newResult = new Result({
						user_id: 1,
						quiz_id: 1,
						score: 10,
						time_taken: 25,
					});
					await newResult.create(db);
					console.log("Loading result...");
					return_msg += "Loading result...\n";
					const result = new Result();
					await result.load(db, 1);
					console.log(result);
					return new Response(`${return_msg}Done!`);
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
