import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from './config.js';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

export class Usuario extends Model {
	async verifyPassword(password) {
		const [salt, key] = this.phash.split(":::") //[hex, hex]
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
}

Usuario.init(
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
    	nombre: {
    		type: DataTypes.STRING,
    		allowNull: false,
    	},
    	email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		phash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		moderador: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		}
  	},
  	{
		sequelize,
		modelName: "Usuario",
		timestamps: true,
		paranoid: true,
		tableName: 'usuarios',
		hooks: {
			beforeSave: async (usuario) => {
				if (!usuario.phash) return;
				if (!usuario.changed('phash')) return;
				const salt = randomBytes(16).toString("hex");
				const derivedKey = await scrypt(usuario.phash, salt, 64);
				usuario.phash = `${salt}:::${derivedKey.toString("hex")}`;
			}
		}
  	},
);