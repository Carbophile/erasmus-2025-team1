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
// USER CRUD
if (url.pathname === "/user") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id, email } = Object.fromEntries(url.searchParams);
const { User } = await import("./db/classes.js");
const user = new User();
let found = false;
if (id) found = await user.load(db, id);
else if (email) found = await user.loadByEmail(db, email);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(user), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { User } = await import("./db/classes.js");
const user = new User(data);
if (!user.id) return new Response("Missing user id", { status: 400 });
await user.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { User } = await import("./db/classes.js");
const user = new User({ id });
await user.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
// USER LOGIN
if (url.pathname === "/user/login") {
if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
try {
const db = getDB(env);
const { email, password } = await request.json();
const { User } = await import("./db/classes.js");
const user = new User();
const found = await user.loadByEmail(db, email);
if (!found || !user.verifyPassword(password)) return new Response(JSON.stringify({ success: false }), { headers: { "Content-Type": "application/json" }, status: 401 });
return new Response(JSON.stringify({ success: true, user }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
// LEADERBOARD
if (url.pathname === "/leaderboard") {
if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
try {
const db = getDB(env);
const { User } = await import("./db/classes.js");
const user = new User();
const leaderboard = await user.loadLeaderboard(db, url.searchParams.get("limit"));
return new Response(JSON.stringify({ success: true, leaderboard }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
// QUIZ CRUD
if (url.pathname === "/quiz") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id } = Object.fromEntries(url.searchParams);
const { Quiz } = await import("./db/classes.js");
const quiz = new Quiz();
const found = await quiz.load(db, id);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(quiz), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { Quiz } = await import("./db/classes.js");
const quiz = new Quiz(data);
if (!quiz.id) return new Response("Missing quiz id", { status: 400 });
await quiz.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { Quiz } = await import("./db/classes.js");
const quiz = new Quiz({ id });
await quiz.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
// QUESTION CRUD
if (url.pathname === "/question") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id } = Object.fromEntries(url.searchParams);
const { Question } = await import("./db/classes.js");
const question = new Question();
const found = await question.load(db, id);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(question), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { Question } = await import("./db/classes.js");
const question = new Question(data);
if (!question.id) return new Response("Missing question id", { status: 400 });
await question.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { Question } = await import("./db/classes.js");
const question = new Question({ id });
await question.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
// CATEGORY CRUD
if (url.pathname === "/category") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id } = Object.fromEntries(url.searchParams);
const { Category } = await import("./db/classes.js");
const category = new Category();
const found = await category.load(db, id);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(category), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { Category } = await import("./db/classes.js");
const category = new Category(data);
if (!category.id) return new Response("Missing category id", { status: 400 });
await category.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { Category } = await import("./db/classes.js");
const category = new Category({ id });
await category.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
// OPTION CRUD
if (url.pathname === "/option") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id, question_id } = Object.fromEntries(url.searchParams);
const { Option } = await import("./db/classes.js");
const option = new Option();
if (id) {
const found = await option.load(db, id);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(option), { headers: { "Content-Type": "application/json" } });
} else if (question_id) {
const options = await option.loadFromQuestion(db, question_id);
return new Response(JSON.stringify(options), { headers: { "Content-Type": "application/json" } });
}
return new Response("Missing id or question_id", { status: 400 });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "POST") {
try {
const db = getDB(env);
const data = await request.json();
const { Option } = await import("./db/classes.js");
const option = new Option(data);
const result = await option.create(db);
return new Response(JSON.stringify({ success: true, option_id: option.id }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { Option } = await import("./db/classes.js");
const option = new Option(data);
if (!option.id) return new Response("Missing option id", { status: 400 });
await option.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { Option } = await import("./db/classes.js");
const option = new Option({ id });
await option.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
// RESULT CRUD
if (url.pathname === "/result") {
if (request.method === "GET") {
try {
const db = getDB(env);
const { id, user_id, quiz_id } = Object.fromEntries(url.searchParams);
const { Result } = await import("./db/classes.js");
const resultObj = new Result();
if (id) {
const found = await resultObj.load(db, id);
if (!found) return new Response("Not Found", { status: 404 });
return new Response(JSON.stringify(resultObj), { headers: { "Content-Type": "application/json" } });
} else if (user_id) {
const results = await resultObj.loadFromUser(db, user_id);
return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
} else if (quiz_id) {
const results = await resultObj.loadFromQuiz(db, quiz_id);
return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}
return new Response("Missing id, user_id, or quiz_id", { status: 400 });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "PUT") {
try {
const db = getDB(env);
const data = await request.json();
const { Result } = await import("./db/classes.js");
const resultObj = new Result(data);
if (!resultObj.id) return new Response("Missing result id", { status: 400 });
await resultObj.update(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
if (request.method === "DELETE") {
try {
const db = getDB(env);
const { id } = await request.json();
const { Result } = await import("./db/classes.js");
const resultObj = new Result({ id });
await resultObj.delete(db);
return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
} catch (e) { return new Response(`Error: ${e.message}`, { status: 500 }); }
}
return new Response("Method Not Allowed", { status: 405 });
}
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
