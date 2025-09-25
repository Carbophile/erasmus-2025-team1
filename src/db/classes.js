// src/db/classes.js
// Classes for each table in the database

import { execDB, queryDB } from "./db";
import bcrypt from "bcryptjs";


export class User {
  constructor({ id, email, name, password, is_admin, create_date, update_date }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.is_admin = is_admin;
    this.create_date = create_date;
    this.update_date = update_date;
  }

  async load(db, id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const result = await queryDB(db, sql, [id]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async loadByEmail(db, email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const result = await queryDB(db, sql, [email]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async create(db) {
    if (this.password && !this.password.startsWith("$2")) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
    const now = new Date().toISOString();
    const sql = `INSERT INTO users (email, name, password, is_admin, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await execDB(db, sql, [this.email, this.name, this.password, this.is_admin ? 1 : 0, now, now]);
    if (result.success) this.id = result.lastRowId;
    return result;
  }

  async update(db) {
    if (!this.id) throw new Error("User id required for update");
    const now = new Date().toISOString();
    const sql = `UPDATE users SET email=?, name=?, password=?, is_admin=?, update_date=? WHERE id=?`;
    return execDB(db, sql, [this.email, this.name, this.password, this.is_admin ? 1 : 0, now, this.id]);
  }

  async delete(db) {
    if (!this.id) throw new Error("User id required for delete");
    const sql = `DELETE FROM users WHERE id=?`;
    return execDB(db, sql, [this.id]);
  }
}

export class Quiz {
  constructor({ id, score_needed, name, max_time, create_date, update_date }) {
    this.id = id;
    this.score_needed = score_needed;
    this.name = name;
    this.max_time = max_time;
    this.create_date = create_date;
    this.update_date = update_date;
  }

  async load(db, id) {
    const sql = `SELECT * FROM quizes WHERE id = ?`;
    const result = await queryDB(db, sql, [id]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async create(db) {
    const now = new Date().toISOString();
    const sql = `INSERT INTO quizes (score_needed, name, max_time, create_date, update_date) VALUES (?, ?, ?, ?, ?)`;
    const result = await execDB(db, sql, [this.score_needed, this.name, this.max_time, now, now]);
    if (result.success) this.id = result.lastRowId;
    return result;
  }

  async update(db) {
    if (!this.id) throw new Error("Quiz id required for update");
    const now = new Date().toISOString();
    const sql = `UPDATE quizes SET score_needed=?, name=?, max_time=?, update_date=? WHERE id=?`;
    return execDB(db, sql, [this.score_needed, this.name, this.max_time, now, this.id]);
  }

  async delete(db) {
    if (!this.id) throw new Error("Quiz id required for delete");
    const sql = `DELETE FROM quizes WHERE id=?`;
    return execDB(db, sql, [this.id]);
  }
}

export class Question {
  constructor({ id, quiz_id, text, category, country, difficulty, score_multiplier, create_date, update_date }) {
    this.id = id;
    this.quiz_id = quiz_id;
    this.text = text;
    this.category = category;
    this.country = country;
    this.difficulty = difficulty;
    this.score_multiplier = score_multiplier;
    this.create_date = create_date;
    this.update_date = update_date;
  }

  async load(db, id) {
    const sql = `SELECT * FROM questions WHERE id = ?`;
    const result = await queryDB(db, sql, [id]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async create(db) {
    const now = new Date().toISOString();
    const sql = `INSERT INTO questions (quiz_id, text, category, country, difficulty, score_multiplier, create_date, update_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await execDB(db, sql, [this.quiz_id, this.text, this.category, this.country, this.difficulty, this.score_multiplier, now, now]);
    if (result.success) this.id = result.lastRowId;
    return result;
  }

  async update(db) {
    if (!this.id) throw new Error("Question id required for update");
    const now = new Date().toISOString();
    const sql = `UPDATE questions SET quiz_id=?, text=?, category=?, country=?, difficulty=?, score_multiplier=?, update_date=? WHERE id=?`;
    return execDB(db, sql, [this.quiz_id, this.text, this.category, this.country, this.difficulty, this.score_multiplier, now, this.id]);
  }

  async delete(db) {
    if (!this.id) throw new Error("Question id required for delete");
    const sql = `DELETE FROM questions WHERE id=?`;
    return execDB(db, sql, [this.id]);
  }
}

export class Option {
  constructor({ id, question_id, option, correct, create_date, update_date }) {
    this.id = id;
    this.question_id = question_id;
    this.option = option;
    this.correct = correct;
    this.create_date = create_date;
    this.update_date = update_date;
  }

  async load(db, id) {
    const sql = `SELECT * FROM options WHERE id = ?`;
    const result = await queryDB(db, sql, [id]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async create(db) {
    const now = new Date().toISOString();
    const sql = `INSERT INTO options (question_id, option, correct, create_date, update_date) VALUES (?, ?, ?, ?, ?)`;
    const result = await execDB(db, sql, [this.question_id, this.option, this.correct, now, now]);
    if (result.success) this.id = result.lastRowId;
    return result;
  }

  async update(db) {
    if (!this.id) throw new Error("Option id required for update");
    const now = new Date().toISOString();
    const sql = `UPDATE options SET question_id=?, option=?, correct=?, update_date=? WHERE id=?`;
    return execDB(db, sql, [this.question_id, this.option, this.correct, now, this.id]);
  }

  async delete(db) {
    if (!this.id) throw new Error("Option id required for delete");
    const sql = `DELETE FROM options WHERE id=?`;
    return execDB(db, sql, [this.id]);
  }
}

export class Result {
  constructor({ id, user_id, score, time_taken, create_date, update_date }) {
    this.id = id;
    this.user_id = user_id;
    this.score = score;
    this.time_taken = time_taken;
    this.create_date = create_date;
    this.update_date = update_date;
  }

  async load(db, id) {
    const sql = `SELECT * FROM results WHERE id = ?`;
    const result = await queryDB(db, sql, [id]);
    if (result && result.results && result.results.length > 0) {
      Object.assign(this, result.results[0]);
      return true;
    }
    return false;
  }

  async create(db) {
    const now = new Date().toISOString();
    const sql = `INSERT INTO results (user_id, score, time_taken, create_date, update_date) VALUES (?, ?, ?, ?, ?)`;
    const result = await execDB(db, sql, [this.user_id, this.score, this.time_taken, now, now]);
    if (result.success) this.id = result.lastRowId;
    return result;
  }

  async update(db) {
    if (!this.id) throw new Error("Result id required for update");
    const now = new Date().toISOString();
    const sql = `UPDATE results SET user_id=?, score=?, time_taken=?, update_date=? WHERE id=?`;
    return execDB(db, sql, [this.user_id, this.score, this.time_taken, now, this.id]);
  }

  async delete(db) {
    if (!this.id) throw new Error("Result id required for delete");
    const sql = `DELETE FROM results WHERE id=?`;
    return execDB(db, sql, [this.id]);
  }
}

