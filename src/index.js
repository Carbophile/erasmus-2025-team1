import { sign, verify } from "./crypto";
import {
	Category,
	Option,
	Question,
	Quiz,
	Result,
	Session,
	User,
} from "./db/classes";
import { getDB } from "./db/db";
import { Router } from "./router";

const QUIZ_LIVES = 3;
const QUESTION_TIME = 30; // in seconds

async function verifyAdmin(_db, user) {
	return user?.is_admin;
}

async function withAuth(request, env, handler) {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return new Response("Unauthorized", { status: 401 });
	}
	const token = authHeader.substring(7);
	const db = getDB(env);
	const session = new Session();
	const valid = await session.loadByToken(db, token);
	if (!valid) {
		return new Response("Unauthorized", { status: 401 });
	}
	request.user = session.user;
	return handler(request, env);
}

const router = new Router();

// USER
router.add("GET", "/user", async (request, env) => {
	try {
		const db = getDB(env);
		const { id, email } = Object.fromEntries(new URL(request.url).searchParams);
		const user = new User();
		let found = false;
		if (id) found = await user.load(db, id);
		else if (email) found = await user.loadByEmail(db, email);
		if (!found) return new Response("Not Found", { status: 404 });
		// remove password from user object
		delete user.password;
		return new Response(JSON.stringify(user), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("PATCH", "/user", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			const data = await request.json();

			if (!data.id) return new Response("Missing user id", { status: 400 });

			// Fetch existing user from D1
			const existingUserResult = await db
				.prepare("SELECT * FROM users WHERE id = ?")
				.bind(data.id)
				.first(); // D1 method for a single row

			if (!existingUserResult)
				return new Response("User not found", { status: 404 });

			// a user can only update their own data, unless they are an admin
			if (request.user.id !== existingUserResult.id && !request.user.is_admin) {
				return new Response("Forbidden", { status: 403 });
			}

			// Merge existing data with new data
			const userToUpdate = {
				id: existingUserResult.id,
				name: data.name ?? existingUserResult.name,
				email: data.email ?? existingUserResult.email,
				password: data.password ?? existingUserResult.password, // keep existing if not provided
				is_admin: data.is_admin ?? existingUserResult.is_admin,
			};

			// Update in D1
			await db
				.prepare(
					`UPDATE users SET name = ?, email = ?, password = ?, is_admin = ? WHERE id = ?`,
				)
				.bind(
					userToUpdate.name,
					userToUpdate.email,
					userToUpdate.password,
					userToUpdate.is_admin,
					userToUpdate.id,
				)
				.run();

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/user", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			const { id } = await request.json();

			// a user can only delete their own account, unless they are an admin
			if (request.user.id !== id && !request.user.is_admin) {
				return new Response("Forbidden", { status: 403 });
			}

			const user = new User({ id });
			await user.delete(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("POST", "/user/login", async (request, env) => {
	try {
		const db = getDB(env);
		const { email, password } = await request.json();
		const user = new User();
		const found = await user.loadByEmail(db, email);
		if (!found || !user.verifyPassword(password))
			return new Response(JSON.stringify({ success: false }), {
				headers: { "Content-Type": "application/json" },
				status: 401,
			});

		const session = new Session({ user });
		await session.create(db);

		delete user.password;
		return new Response(
			JSON.stringify({ success: true, user, token: session.token }),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("POST", "/user/new", async (request, env) => {
	try {
		const db = getDB(env);
		const data = await request.json();
		const user = new User(data);
		const result = await user.create(db);
		if (result.success) {
			return new Response(JSON.stringify({ success: true, user_id: user.id }), {
				headers: { "Content-Type": "application/json" },
			});
		} else {
			return new Response(
				JSON.stringify({ success: false, error: "User creation failed" }),
				{
					headers: { "Content-Type": "application/json" },
					status: 500,
				},
			);
		}
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("POST", "/user/isAdmin", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			const isAdmin = await verifyAdmin(db, request.user);
			return new Response(JSON.stringify({ success: true, isAdmin }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

// LEADERBOARD
router.add("GET", "/leaderboard", async (request, env) => {
	try {
		const db = getDB(env);
		const user = new User();
		const leaderboard = await user.loadLeaderboard(
			db,
			new URL(request.url).searchParams.get("limit"),
		);
		return new Response(JSON.stringify({ success: true, leaderboard }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

// Add missing collection endpoints
router.add("GET", "/users", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const user = new User();
			const users = await user.loadAll(db);
			// Remove passwords from all users
			users.forEach((user) => {
				delete user.password;
			});
			return new Response(JSON.stringify({ success: true, users }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("GET", "/questions", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const question = new Question();
			const questions = await question.loadAll(db);
			return new Response(JSON.stringify({ success: true, questions }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("GET", "/categories", async (_request, env) => {
	try {
		const db = getDB(env);
		const category = new Category();
		const categories = await category.loadAll(db);
		return new Response(JSON.stringify({ success: true, categories }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

// QUIZ
router.add("GET", "/quiz", async (request, env) => {
	try {
		const db = getDB(env);
		const { id } = Object.fromEntries(new URL(request.url).searchParams);
		const quiz = new Quiz();
		const found = await quiz.load(db, id);
		if (!found) return new Response("Not Found", { status: 404 });
		return new Response(JSON.stringify(quiz), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("PUT", "/quiz", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const quiz = new Quiz(data);
			if (!quiz.id) return new Response("Missing quiz id", { status: 400 });
			await quiz.update(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/quiz", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const { id } = await request.json();
			const quiz = new Quiz({ id });
			await quiz.delete(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("POST", "/quiz/start", async (_request, env) => {
	try {
		const db = getDB(env);
		const question = new Question();
		const randomQuestion = await question.loadRandom(db);

		if (!randomQuestion) {
			return new Response(
				JSON.stringify({ success: false, error: "No questions available" }),
				{
					headers: { "Content-Type": "application/json" },
					status: 500,
				},
			);
		}

		// Load options for the question
		const option = new Option();
		const options = await option.loadFromQuestion(db, randomQuestion.id);

		const state = {
			lives: QUIZ_LIVES,
			score: 0,
			question_id: randomQuestion.id,
			question_difficulty: randomQuestion.difficulty,
			question_start_time: Date.now(),
			history: [],
		};

		const signedState = await sign(state, env.QUIZ_SECRET);

		return new Response(
			JSON.stringify({
				success: true,
				question: { ...randomQuestion, options },
				state: signedState,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("POST", "/quiz/answer", async (request, env) => {
	try {
		const db = getDB(env);
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

		if (Date.now() - question_start_time > QUESTION_TIME * 1000) {
			state.lives -= 1;
			if (state.lives <= 0) {
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
			// Load the correct option for this question
			const option = new Option();
			const options = await option.loadFromQuestion(db, question_id);
			const correctOption = options.find((opt) => opt.correct);

			if (correctOption && correctOption.id.toString() === answer.toString()) {
				state.score += 1 * question_difficulty;
			} else {
				state.lives -= 1;
			}
		}

		if (state.lives <= 0) {
			return new Response(
				JSON.stringify({
					success: true,
					game_over: true,
					final_score: state.score,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const newQuestion = new Question();
		const randomQuestion = await newQuestion.loadRandom(db, history);

		if (!randomQuestion) {
			return new Response(
				JSON.stringify({
					success: true,
					game_over: true,
					final_score: state.score,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Load options for the new question
		const option = new Option();
		const newOptions = await option.loadFromQuestion(db, randomQuestion.id);

		state.history.push(question_id);
		state.question_id = randomQuestion.id;
		state.question_difficulty = randomQuestion.difficulty;
		state.question_start_time = Date.now();

		const newSignedState = await sign(state, env.QUIZ_SECRET);

		return new Response(
			JSON.stringify({
				success: true,
				question: { ...randomQuestion, options: newOptions },
				state: newSignedState,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("POST", "/quiz/new", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}

			const data = await request.json();
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
					{
						headers: { "Content-Type": "application/json" },
					},
				);
			} else {
				return new Response(
					JSON.stringify({ success: false, error: "Quiz creation failed" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 500,
					},
				);
			}
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("POST", "/quiz/question", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}

			const data = await request.json();
			const questionData = {
				quiz_id: data.quiz_id,
				category_id: data.category_id,
				text: data.text || "Placeholder",
				country: typeof data.country === "string" ? 0 : data.country || 0,
				difficulty:
					typeof data.difficulty === "string"
						? data.difficulty.toLowerCase() === "easy"
							? 1
							: data.difficulty.toLowerCase() === "medium"
								? 2
								: 3
						: data.difficulty || 2,
				score_multiplier: data.score_multiplier || 1,
			};

			const question = new Question(questionData);
			const questionResult = await question.create(db);

			if (!questionResult.success) {
				return new Response(
					JSON.stringify({ success: false, error: "Question creation failed" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 500,
					},
				);
			}

			if (!Array.isArray(data.options) || data.options.length !== 4) {
				return new Response(
					JSON.stringify({ success: false, error: "Must provide 4 options" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 400,
					},
				);
			}

			const createdOptions = [];
			for (const opt of data.options) {
				const optionData = {
					question_id: question.id,
					option: opt.option || "Placeholder option",
					// Convert correct to TINYINT (0 or 1) as per schema
					correct: opt.correct ? 1 : 0,
				};

				const option = new Option(optionData);
				const optionResult = await option.create(db);

				if (!optionResult.success) {
					return new Response(
						JSON.stringify({ success: false, error: "Option creation failed" }),
						{
							headers: { "Content-Type": "application/json" },
							status: 500,
						},
					);
				}
				createdOptions.push({ id: option.id, ...optionData });
			}

			return new Response(
				JSON.stringify({
					success: true,
					question_id: question.id,
					options: createdOptions,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("POST", "/quiz/category", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}

			const data = await request.json();
			const categoryData = { name: data.name };
			const category = new Category(categoryData);

			const result = await category.create(db);
			if (result.success) {
				return new Response(
					JSON.stringify({ success: true, category_id: category.id }),
					{
						headers: { "Content-Type": "application/json" },
					},
				);
			} else {
				return new Response(
					JSON.stringify({ success: false, error: "Category creation failed" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 500,
					},
				);
			}
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("POST", "/quiz/result", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			const data = await request.json();
			const resultData = {
				user_id: request.user.id,
				quiz_id: data.quiz_id,
				score: data.score,
				time_taken: data.time_taken,
			};
			const resultObject = new Result(resultData);

			const result = await resultObject.create(db);
			if (result.success) {
				return new Response(
					JSON.stringify({ success: true, result_id: resultObject.id }),
					{
						headers: { "Content-Type": "application/json" },
					},
				);
			} else {
				return new Response(
					JSON.stringify({ success: false, error: "Result creation failed" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 500,
					},
				);
			}
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("GET", "/quizzes", async (_request, env) => {
	try {
		const db = getDB(env);
		const quiz = new Quiz();
		const quizzes = await quiz.loadAll(db);
		return new Response(JSON.stringify({ success: true, quizzes }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

// QUESTION
router.add("GET", "/question", async (request, env) => {
	try {
		const db = getDB(env);
		const { id } = Object.fromEntries(new URL(request.url).searchParams);
		const question = new Question();
		const found = await question.load(db, id);
		if (!found) return new Response("Not Found", { status: 404 });
		return new Response(JSON.stringify(question), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("PUT", "/question", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const question = new Question(data);
			if (!question.id)
				return new Response("Missing question id", { status: 400 });
			await question.update(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/question", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);

			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}

			const { id } = await request.json();
			if (!id) return new Response("Missing question id", { status: 400 });

			const question = new Question({ id });
			await question.delete(db);

			const option = new Option();
			const options = await option.loadFromQuestion(db, id);
			for (const opt of options) {
				const o = new Option({ id: opt.id });
				await o.delete(db);
			}

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

// CATEGORY
router.add("GET", "/category", async (request, env) => {
	try {
		const db = getDB(env);
		const { id } = Object.fromEntries(new URL(request.url).searchParams);
		const category = new Category();
		const found = await category.load(db, id);
		if (!found) return new Response("Not Found", { status: 404 });
		return new Response(JSON.stringify(category), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("PUT", "/category", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const category = new Category(data);
			if (!category.id)
				return new Response("Missing category id", { status: 400 });
			await category.update(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/category", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const { id } = await request.json();
			const category = new Category({ id });
			await category.delete(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

// OPTION
router.add("GET", "/option", async (request, env) => {
	try {
		const db = getDB(env);
		const { id, question_id } = Object.fromEntries(
			new URL(request.url).searchParams,
		);
		const option = new Option();
		if (id) {
			const found = await option.load(db, id);
			if (!found) return new Response("Not Found", { status: 404 });
			return new Response(JSON.stringify(option), {
				headers: { "Content-Type": "application/json" },
			});
		} else if (question_id) {
			const options = await option.loadFromQuestion(db, question_id);
			return new Response(JSON.stringify(options), {
				headers: { "Content-Type": "application/json" },
			});
		}
		return new Response("Missing id or question_id", { status: 400 });
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("POST", "/option", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const option = new Option(data);
			const result = await option.create(db);
			if (!result.success) {
				return new Response(
					JSON.stringify({ success: false, error: "Option creation failed" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
			return new Response(
				JSON.stringify({ success: true, option_id: option.id }),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("PUT", "/option", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const option = new Option(data);
			if (!option.id) return new Response("Missing option id", { status: 400 });
			await option.update(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/option", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const { id } = await request.json();
			const option = new Option({ id });
			await option.delete(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

// RESULT
router.add("GET", "/result", async (request, env) => {
	try {
		const db = getDB(env);
		const { id, user_id, quiz_id } = Object.fromEntries(
			new URL(request.url).searchParams,
		);
		const resultObj = new Result();
		if (id) {
			const found = await resultObj.load(db, id);
			if (!found) return new Response("Not Found", { status: 404 });
			return new Response(JSON.stringify(resultObj), {
				headers: { "Content-Type": "application/json" },
			});
		} else if (user_id) {
			const results = await resultObj.loadFromUser(db, user_id);
			return new Response(JSON.stringify(results), {
				headers: { "Content-Type": "application/json" },
			});
		} else if (quiz_id) {
			const results = await resultObj.loadFromQuiz(db, quiz_id);
			return new Response(JSON.stringify(results), {
				headers: { "Content-Type": "application/json" },
			});
		}
		return new Response("Missing id, user_id, or quiz_id", {
			status: 400,
		});
	} catch (e) {
		return new Response(`Error: ${e.message}`, { status: 500 });
	}
});

router.add("PUT", "/result", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const data = await request.json();
			const resultObj = new Result(data);
			if (!resultObj.id)
				return new Response("Missing result id", { status: 400 });
			await resultObj.update(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

router.add("DELETE", "/result", (request, env) =>
	withAuth(request, env, async (request, env) => {
		try {
			const db = getDB(env);
			if (!(await verifyAdmin(db, request.user))) {
				return new Response("Unauthorized", { status: 401 });
			}
			const { id } = await request.json();
			const resultObj = new Result({ id });
			await resultObj.delete(db);
			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (e) {
			return new Response(`Error: ${e.message}`, { status: 500 });
		}
	}),
);

export default {
	async fetch(request, env, _ctx) {
		return router.route(request, env);
	},
};
