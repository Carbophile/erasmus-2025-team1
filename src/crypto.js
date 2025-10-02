import { Buffer } from "node:buffer";

// This should be a long, random string stored in `env.QUIZ_SECRET`.
async function getKey(secret) {
	const secretBuf = new TextEncoder().encode(secret);
	return crypto.subtle.importKey(
		"raw",
		secretBuf,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

/**
 * Signs a piece of data.
 * @param {object} data The data to sign.
 * @param {string} secret The secret to sign with.
 * @returns {Promise<string>} The signed data, as a base64 string.
 */
export async function sign(data, secret) {
	const key = await getKey(secret);
	const dataStr = JSON.stringify(data);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(dataStr),
	);
	const signatureB64 = Buffer.from(signature).toString("base64");
	const dataB64 = Buffer.from(dataStr).toString("base64");
	return `${dataB64}.${signatureB64}`;
}

/**
 * Verifies a signed piece of data.
 * @param {string} signedData The signed data, as a base64 string.
 * @param {string} secret The secret to verify with.
 * @returns {Promise<object|null>} The original data if the signature is valid, otherwise null.
 */
export async function verify(signedData, secret) {
	const key = await getKey(secret);
	const [dataB64, signatureB64] = signedData.split(".");
	if (!dataB64 || !signatureB64) {
		return null;
	}
	try {
		const signature = Buffer.from(signatureB64, "base64");
		const dataStr = Buffer.from(dataB64, "base64").toString("utf-8");
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			signature,
			new TextEncoder().encode(dataStr),
		);
		if (isValid) {
			return JSON.parse(dataStr);
		}
		return null;
	} catch (e) {
		throw new Error(`Execution failed: ${e.message}`);
	}
}
