// src/db/classes.js
// Classes for each table in the database

import bcrypt from "bcryptjs";
import { execDB, queryDB } from "./db";

export class User {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.email = obj.email ?? null;
		this.name = obj.name ?? null;
		this.password = obj.password ?? null;
		this.total_score = obj.total_score ?? null;
		this.is_admin = obj.is_admin ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM users WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async loadByEmail(db, email) {
		const sql = `SELECT * FROM users WHERE email = ?`;
		const result = await queryDB(db, sql, [email]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async getTotalScore(db, user_id) {
		const sql = `SELECT SUM(score) as total_score FROM results WHERE user_id = ?`;
		const result = await queryDB(db, sql, [user_id]);
		if (result?.results && result.results.length > 0) {
			this.total_score = result.results[0].total_score || 0;
			return this.total_score;
		}
		return 0;
	}

	async create(db) {
		if (this.password && !this.password.startsWith("$2")) {
			this.password = bcrypt.hashSync(this.password, 10);
		}
		const now = new Date().toISOString();
		const sql = `INSERT INTO users (email, name, password, is_admin, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?)`;
		const result = await execDB(db, sql, [
			this.email,
			this.name,
			this.password,
			this.is_admin ? 1 : 0,
			now,
			now,
		]);

		if (result.success) this.id = result.meta.last_row_id;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("User id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE users SET email=?, name=?, password=?, is_admin=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [
			this.email,
			this.name,
			this.password,
			this.is_admin ? 1 : 0,
			now,
			this.id,
		]);
	}

	async delete(db) {
		if (!this.id) throw new Error("User id required for delete");
		const sql = `DELETE FROM users WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}

export class Quiz {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.score_needed = obj.score_needed ?? null;
		this.name = obj.name ?? null;
		this.max_time = obj.max_time ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM quizes WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async loadAll(db) {
		const sql = `SELECT * FROM quizes`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results);
			return true;
		}
		return false;
	}

	async create(db) {
		const now = new Date().toISOString();
		const sql = `INSERT INTO quizes (score_needed, name, max_time, create_date, update_date) VALUES (?, ?, ?, ?, ?)`;
		const result = await execDB(db, sql, [
			this.score_needed,
			this.name,
			this.max_time,
			now,
			now,
		]);
		if (result.success) this.id = result.lastRowId;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("Quiz id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE quizes SET score_needed=?, name=?, max_time=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [
			this.score_needed,
			this.name,
			this.max_time,
			now,
			this.id,
		]);
	}

	async delete(db) {
		if (!this.id) throw new Error("Quiz id required for delete");
		const sql = `DELETE FROM quizes WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}

export class Question {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.category_id = obj.category_id ?? null;
		this.quiz_id = obj.quiz_id ?? null;
		this.text = obj.text ?? null;
		this.country = obj.country ?? null;
		this.difficulty = obj.difficulty ?? null;
		this.score_multiplier = obj.score_multiplier ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM questions WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async loadFromCategory(db, category_id) {
		const sql = `SELECT * FROM questions WHERE category_id = ?`;
		const result = await queryDB(db, sql, [category_id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this.result.results);
			return true;
		}
		return false;
	}

	async create(db) {
		const now = new Date().toISOString();
		const sql = `INSERT INTO questions (category_id, quiz_id, text, country, difficulty, score_multiplier, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
		const result = await execDB(db, sql, [
			this.category_id,
			this.quiz_id,
			this.text,
			this.country,
			this.difficulty,
			this.score_multiplier,
			now,
			now,
		]);
		if (result.success) this.id = result.lastRowId;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("Question id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE questions SET category_id=?, quiz_id=?, text=?, country=?, difficulty=?, score_multiplier=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [
			this.category_id,
			this.quiz_id,
			this.text,
			this.country,
			this.difficulty,
			this.score_multiplier,
			now,
			this.id,
		]);
	}
	async delete(db) {
		if (!this.id) throw new Error("Question id required for delete");
		const sql = `DELETE FROM questions WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}
export class Category {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.name = obj.name ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM categories WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async create(db) {
		const now = new Date().toISOString();
		const sql = `INSERT INTO categories (name, create_date, update_date) VALUES (?, ?, ?)`;
		const result = await execDB(db, sql, [this.name, now, now]);
		if (result.success) this.id = result.lastRowId;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("Category id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE categories SET name=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [this.name, now, this.id]);
	}

	async delete(db) {
		if (!this.id) throw new Error("Category id required for delete");
		const sql = `DELETE FROM categories WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}

export class Option {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.question_id = obj.question_id ?? null;
		this.option = obj.option ?? null;
		this.correct = obj.correct ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM options WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async loadFromQuestion(db, question_id) {
		const sql = `SELECT * FROM options WHERE question_id = ?`;
		const result = await queryDB(db, sql, [question_id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this.result.results);
			return true;
		}
		return false;
	}

	async create(db) {
		const now = new Date().toISOString();
		const sql = `INSERT INTO options (question_id, option, correct, create_date, update_date) VALUES (?, ?, ?, ?, ?)`;
		const result = await execDB(db, sql, [
			this.question_id,
			this.option,
			this.correct,
			now,
			now,
		]);
		if (result.success) this.id = result.lastRowId;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("Option id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE options SET question_id=?, option=?, correct=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [
			this.question_id,
			this.option,
			this.correct,
			now,
			this.id,
		]);
	}

	async delete(db) {
		if (!this.id) throw new Error("Option id required for delete");
		const sql = `DELETE FROM options WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}

export class Result {
	constructor(obj = {}) {
		this.id = obj.id ?? null;
		this.user_id = obj.user_id ?? null;
		this.quiz_id = obj.quiz_id ?? null;
		this.score = obj.score ?? null;
		this.time_taken = obj.time_taken ?? null;
		this.create_date = obj.create_date ?? null;
		this.update_date = obj.update_date ?? null;
	}

	async load(db, id) {
		const sql = `SELECT * FROM results WHERE id = ?`;
		const result = await queryDB(db, sql, [id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this, result.results[0]);
			return true;
		}
		return false;
	}

	async loadFromUser(db, user_id) {
		const sql = `SELECT * FROM results WHERE user_id = ?`;
		const result = await queryDB(db, sql, [user_id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this.result.results);
			return true;
		}
		return false;
	}

	async loadFromQuiz(db, quiz_id) {
		const sql = `SELECT * FROM results WHERE quiz_id = ?`;
		const result = await queryDB(db, sql, [quiz_id]);
		if (result?.results && result.results.length > 0) {
			Object.assign(this.result.results);
			return true;
		}
		return false;
	}

	async create(db) {
		const now = new Date().toISOString();
		const sql = `INSERT INTO results (user_id, quiz_id, score, time_taken, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?)`;
		const result = await execDB(db, sql, [
			this.user_id,
			this.quiz_id,
			this.score,
			this.time_taken,
			now,
			now,
		]);
		if (result.success) this.id = result.lastRowId;
		return result;
	}

	async update(db) {
		if (!this.id) throw new Error("Result id required for update");
		const now = new Date().toISOString();
		const sql = `UPDATE results SET user_id=?, quiz_id=?, score=?, time_taken=?, update_date=? WHERE id=?`;
		return execDB(db, sql, [
			this.user_id,
			this.quiz_id,
			this.score,
			this.time_taken,
			now,
			this.id,
		]);
	}

	async delete(db) {
		if (!this.id) throw new Error("Result id required for delete");
		const sql = `DELETE FROM results WHERE id=?`;
		return execDB(db, sql, [this.id]);
	}
}
