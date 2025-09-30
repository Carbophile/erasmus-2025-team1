import { sign, verify } from "./crypto";
import { User } from "./db/classes";
import { getDB } from "./db/db";

const QUIZ_LIVES = 3;
const QUESTION_TIME = 30; // in seconds

async function verifyAdmin(db, email, password) {
	const user = new User();
	const userExists = await user.loadByEmail(db, email);
	return !(!userExists || !user.verifyPassword(password) || !user.is_admin);
}

// This is nowhere near final, just a skeleton to build upon
export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);
		switch (url.pathname) {
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
			case "/user/isAdmin": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { email, password } = await request.json();
					const isAdmin = await verifyAdmin(db, email, password);
					return new Response(JSON.stringify({ success: true, isAdmin }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (e) {
					return new Response(`Error: ${e.message}`, { status: 500 });
				}
			}
			case "/quiz/start": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Question } = await import("./db/classes.js");
					const question = new Question();
					const randomQuestion = await question.loadRandom(db);

					if (!randomQuestion) {
						return new Response(
							JSON.stringify({
								success: false,
								error: "No questions available",
							}),
							{
								headers: { "Content-Type": "application/json" },
								status: 500,
							},
						);
					}

					const state = {
						lives: QUIZ_LIVES,
						score: 0,
						question_id: randomQuestion.id,
						question_difficulty: randomQuestion.difficulty,
						question_start_time: Date.now(),
						history: [],
					};

					const signedState = await sign(state, env.QUIZ_SECRET);

					// Return the first question (without the answer) and the signed state
					const { _answer, ...questionData } = randomQuestion;

					return new Response(
						JSON.stringify({
							success: true,
							question: questionData,
							state: signedState,
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
				} catch (e) {
					return new Response(`Error: ${e.message}`, { status: 500 });
				}
			}
			case "/quiz/answer": {
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Question } = await import("./db/classes.js");
					const { state: signedState, answer } = await request.json();

					const state = await verify(signedState, env.QUIZ_SECRET);

					if (!state) {
						return new Response(
							JSON.stringify({ success: false, error: "Invalid state" }),
							{
								headers: { "Content-Type": "application/json" },
								status: 400,
							},
						);
					}

					const {
						question_id,
						question_start_time,
						score,
						history,
						question_difficulty,
					} = state;

					// Check if the time limit for the question has been exceeded
					if (Date.now() - question_start_time > QUESTION_TIME * 1000) {
						state.lives -= 1;
						if (state.lives <= 0) {
							// Game over
							return new Response(
								JSON.stringify({
									success: true,
									game_over: true,
									final_score: score,
								}),
								{
									headers: { "Content-Type": "application/json" },
								},
							);
						}
					} else {
						const question = new Question();
						await question.load(db, question_id);

						if (question.answer === answer) {
							state.score += 1 * question_difficulty;
						} else {
							state.lives -= 1;
						}
					}

					if (state.lives <= 0) {
						// Game over
						return new Response(
							JSON.stringify({
								success: true,
								game_over: true,
								final_score: score,
							}),
							{
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Load a new random question
					const newQuestion = new Question();
					const randomQuestion = await newQuestion.loadRandom(db, history);

					if (!randomQuestion) {
						// No more questions, quiz is over
						return new Response(
							JSON.stringify({
								success: true,
								game_over: true,
								final_score: score,
							}),
							{
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					state.history.push(question_id);
					state.question_id = randomQuestion.id;
					state.question_difficulty = randomQuestion.difficulty;
					state.question_start_time = Date.now();

					const newSignedState = await sign(state, env.QUIZ_SECRET);

					const { answer: _correctAnswer, ...questionData } = randomQuestion;

					return new Response(
						JSON.stringify({
							success: true,
							question: questionData,
							state: newSignedState,
						}),
						{ headers: { "Content-Type": "application/json" } },
					);
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

					if (!(await verifyAdmin(db, data.email, data.password))) {
						return new Response("Unauthorized", { status: 401 });
					}

					const quizData = {
						name: data.name,
						score_needed: data.score_needed,
						max_time: data.max_time,
					};
					const quiz = new Quiz(quizData);

					const result = await quiz.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, quiz_id: quiz.id }),
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

					if (!(await verifyAdmin(db, data.email, data.password))) {
						return new Response("Unauthorized", { status: 401 });
					}

					const questionData = {
						text: data.text,
						answer: data.answer,
						difficulty: data.difficulty,
						score_multiplier: data.score_multiplier,
					};
					const question = new Question(questionData);

					const result = await question.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, question_id: question.id }),
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

					if (!(await verifyAdmin(db, data.email, data.password))) {
						return new Response("Unauthorized", { status: 401 });
					}

					const categoryData = {
						name: data.name,
					};
					const category = new Category(categoryData);

					const result = await category.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, category_id: category.id }),
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
						score: data.score,
						time_taken: data.time_taken,
						create_date: data.create_date,
						update_date: data.update_date,
					};
					const resultObject = new Result(resultData);

					const result = await resultObject.create(db);
					if (result.success) {
						return new Response(
							JSON.stringify({ success: true, result_id: resultObject.id }),
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
			case "/quizzes": {
				if (request.method !== "GET") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try {
					const db = getDB(env);
					const { Quiz } = await import("./db/classes.js");
					const quiz = new Quiz();
					const quizzes = await quiz.loadAll(db);
					return new Response(JSON.stringify({ success: true, quizzes }), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (e) {
					return new Response(`Error: ${e.message}`, { status: 500 });
				}
			}

			default:
				return new Response("Not Found", { status: 404 });
		}
	},
};
