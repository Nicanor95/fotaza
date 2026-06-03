import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Usuario = sequelize.define(
	'Usuario',
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
		timestamps: true
  	},
);