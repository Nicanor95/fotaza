import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Transform callback to promise
const scrypt = promisify(_scrypt);

export async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	const derivedKey = await scrypt(password, salt, 64);
	return `${salt}:::${derivedKey.toString("hex")}`;
}

export async function verifyPassword(hash, password) {
	const [salt,key] = hash.split(":::"); //[hex, hex]
	const derivedKey = await scrypt(password, salt, 64); // Buffer
	const storedKey = Buffer.from(key, "hex"); // storedKey <- Buffer <- Hex

	/**
	 * timingSafeEqual prevents information leak by using an
	 * algorithm that always takes the same time to complete.
	 * 
	 * This prevents an attacker from guessing the values by
	 * comparing the difference between correct comparisons
	 * and incorrect ones.
	 */
	return timingSafeEqual(derivedKey, storedKey);
} 