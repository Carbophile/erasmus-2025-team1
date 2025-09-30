// Get db
export function getDB(env) {
	if (!env.main_db) {
		throw new Error("Database not initialized");
	}
	return env.main_db;
}

// Query db instead of repeating the whole db prepare statement everywhere
export async function queryDB(db, sql, params = []) {
	try {
		return await db
			.prepare(sql)
			.bind(...params)
			.all();
	} catch (error) {
		throw new Error(`Query failed: ${error.message}`);
	}
}

// Execute a SQL command (INSERT, UPDATE, DELETE)
export async function execDB(db, sql, params = []) {
	try {
		return await db
			.prepare(sql)
			.bind(...params)
			.run();
	} catch (error) {
		throw new Error(`Execution failed: ${error.message}`);
	}
}
