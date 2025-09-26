import { Category, Option, Question, Quiz, Result, User } from "./db/classes";
import { getDB } from "./db/db";

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

			//test cases to show teacher our db wrapper is working, can be removed later
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
					if (!return_msg) {
						return_msg = "Test failed with no data.\n";
					}
					return new Response(`${return_msg}\nError message: ${e.message}`, {
						status: 500,
					});
				}
			}
			case "/wipe-db": {
				try {
					const db = getDB(env);

					console.log("Deleting user...");
					wipe_msg += "Deleting user...\n";
					const user = new User();
					await user.load(db, 1);
					await user.delete(db);

					console.log("Deleting category...");
					wipe_msg += "Deleting category...\n";
					const category = new Category();
					await category.load(db, 1);
					await category.delete(db);

					console.log("Deleting quiz...");
					wipe_msg += "Deleting quiz...\n";
					const quiz = new Quiz();
					await quiz.load(db, 1);
					await quiz.delete(db);

					return new Response("Database wiped!");
				} catch (e) {
					if (!wipe_msg) {
						wipe_msg = "Test failed with no data.\n";
					}
					return new Response(`${wipe_msg}\nError message: ${e.message}`, {
						status: 500,
					});
				}
			}
			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
