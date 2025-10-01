import { Category, Option, Question, Quiz, Result, User } from "./db/classes";
import { getDB, queryDB } from "./db/db";

// This is nowhere near final, just a skeleton to build upon
export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);
		var return_msg = "DB Test:\n";
		var seed_msg = "DB Seeding:\n";

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

			// route to seed the database with mockup data for testing
			case "/seed-db": {
				try {
					const db = getDB(env);
					seed_msg += "Seeding database...\n";
					const users = [
						["test@example.com", "Test User", "password", 1],
						["colin@examplecom", "Colin", "password"],
						["maarten@example.com", "Maarten", "password"],
						["brandon@example.com", "Brandon", "password"],
					];
					for (const [email, name, password, is_admin] of users) {
						const user = new User({
							email,
							name,
							password,
							is_admin: is_admin || 0,
						});
						await user.create(db);
					}

					seed_msg += "Users created.\n";

					const categories = ["Culture", "History", "Geography", "Language"];
					for (const name of categories) {
						const category = new Category({ name });
						await category.create(db);
					}
					seed_msg += "Categories created.\n";

					const quizzes = [
						["Level 1", 5, 30],
						["Level 2", 7, 45],
						["Level 3", 9, 60],
						["Level 4", 12, 90],
					];
					for (const [name, country, score_needed, max_time] of quizzes) {
						const quiz = new Quiz({ name, country, score_needed, max_time });
						await quiz.create(db);
					}
					seed_msg += "Quizzes created.\n";

					const questions = [
						["What is the capital of Croatia?", "HR", 1, 1, "Easy", 1],
						["What is the capital of the Netherlands?", "NL", 1, 1, "Easy", 1],
						[
							"Which country is famous for its tulip fields?",
							"NL",
							1,
							3,
							"Easy",
							1,
						],
						[
							"Which country is known for the traditional dance called 'kolo'?",
							"HR",
							1,
							1,
							"Medium",
							1,
						],
						[
							"What is the name of the Dutch national holiday celebrating the king's birthday?",
							"NL",
							1,
							2,
							"Medium",
							1,
						],
						[
							"Which Croatian city is famous for its ancient Roman amphitheater?",
							"HR",
							1,
							1,
							"Medium",
							1,
						],
						[
							"What is a popular Dutch food made from raw herring?",
							"NL",
							1,
							3,
							"Medium",
							1,
						],
						[
							"Which country celebrates Sinterklaas on December 5th?",
							"NL",
							1,
							2,
							"Easy",
							1,
						],
						[
							"Which country is known for the tradition of painting Easter eggs called 'pisanice'?",
							"HR",
							1,
							1,
							"Easy",
							1,
						],
						[
							"What is the name of the Croatian folk music style characterized by group singing?",
							"HR",
							1,
							1,
							"Medium",
							1,
						],
						[
							"Which country is famous for its windmills and canals?",
							"NL",
							1,
							3,
							"Easy",
							1,
						],
						[
							"Which country is known for the dish 'pašticada'?",
							"HR",
							1,
							1,
							"Medium",
							1,
						],
						["What is the Dutch word for 'cheese'?", "NL", 1, 2, "Easy", 1],
						[
							"Which country is home to the city of Split?",
							"HR",
							1,
							1,
							"Easy",
							1,
						],
						[
							"Which country is home to the city of Rotterdam?",
							"NL",
							1,
							2,
							"Easy",
							1,
						],
					];
					for (const [
						text,
						quiz_id,
						category_id,
						difficulty,
						score_multiplier,
					] of questions) {
						const question = new Question({
							text,
							quiz_id,
							category_id,
							difficulty,
							score_multiplier,
						});
						await question.create(db);
					}
					seed_msg += "Questions created.\n";

					const options = [
						// 1: What is the capital of Croatia?
						[1, "Zagreb", true],
						[1, "Split", false],
						[1, "Dubrovnik", false],
						[1, "Amsterdam", false],
						// 2: What is the capital of the Netherlands?
						[2, "Amsterdam", true],
						[2, "Rotterdam", false],
						[2, "The Hague", false],
						[2, "Zagreb", false],
						// 3: Which country is famous for its tulip fields?
						[3, "Netherlands", true],
						[3, "Croatia", false],
						[3, "France", false],
						[3, "Italy", false],
						// 4: Which country is known for the traditional dance called 'kolo'?
						[4, "Croatia", true],
						[4, "Netherlands", false],
						[4, "Germany", false],
						[4, "Serbia", false],
						// 5: What is the name of the Dutch national holiday celebrating the king's birthday?
						[5, "King's Day (Koningsdag)", true],
						[5, "Queen's Day", false],
						[5, "Liberation Day", false],
						[5, "Carnival", false],
						// 6: Which Croatian city is famous for its ancient Roman amphitheater?
						[6, "Pula", true],
						[6, "Split", false],
						[6, "Dubrovnik", false],
						[6, "Zadar", false],
						// 7: What is a popular Dutch food made from raw herring?
						[7, "Haring", true],
						[7, "Stroopwafel", false],
						[7, "Bitterballen", false],
						[7, "Pašticada", false],
						// 8: Which country celebrates Sinterklaas on December 5th?
						[8, "Netherlands", true],
						[8, "Croatia", false],
						[8, "Belgium", false],
						[8, "Germany", false],
						// 9: Which country is known for the tradition of painting Easter eggs called 'pisanice'?
						[9, "Croatia", true],
						[9, "Netherlands", false],
						[9, "Poland", false],
						[9, "Italy", false],
						// 10: What is the name of the Croatian folk music style characterized by group singing?
						[10, "Klapa", true],
						[10, "Tamburica", false],
						[10, "Fado", false],
						[10, "Chanson", false],
						// 11: Which country is famous for its windmills and canals?
						[11, "Netherlands", true],
						[11, "Croatia", false],
						[11, "Belgium", false],
						[11, "France", false],
						// 12: Which country is known for the dish 'pašticada'?
						[12, "Croatia", true],
						[12, "Netherlands", false],
						[12, "Italy", false],
						[12, "France", false],
						// 13: What is the Dutch word for 'cheese'?
						[13, "Kaas", true],
						[13, "Fromage", false],
						[13, "Sir", false],
						[13, "Queso", false],
						// 14: Which country is home to the city of Split?
						[14, "Croatia", true],
						[14, "Netherlands", false],
						[14, "Italy", false],
						[14, "France", false],
						// 15: Which country is home to the city of Rotterdam?
						[15, "Netherlands", true],
						[15, "Croatia", false],
						[15, "Belgium", false],
						[15, "Germany", false],
					];
					for (const [question_id, option, correct] of options) {
						const opt = new Option({ question_id, option, correct });
						await opt.create(db);
					}
					seed_msg += "Options created.\n";

					const results = [
						[1, 1, 8, 50],
						[2, 2, 7, 70],
						[3, 3, 6, 40],
						[4, 4, 5, 25],
					];
					for (const [user_id, quiz_id, score, time_taken] of results) {
						const result = new Result({ user_id, quiz_id, score, time_taken });
						await result.create(db);
					}
					seed_msg += "Results created.\n";

					seed_msg += "Database seeding completed.\n";
					return new Response(`${seed_msg}Done!`);
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
