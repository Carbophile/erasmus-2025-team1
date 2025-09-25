
import bcrypt from "bcryptjs";

// Get db
export function getDB(env) {
  return env.main_db;
}

// Query db instead of repeating the whole db prepare statement everywhere
export async function queryDB(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).all();

  return result;
}

// Execute a SQL command (INSERT, UPDATE, DELETE)
export async function execDB(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).run();
  return result;
}

// user password check, should be moved to auth later
export async function checkUserPassword(db, email, password) {
  const result = await queryDB(db, 'SELECT password FROM users WHERE email = ?', [email]);
  if (result && result.results && result.results.length > 0) {
    const hash = result.results[0].password;
    return bcrypt.compareSync(password, hash);
  }
  return false;
}