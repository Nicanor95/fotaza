import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Tag = sequelize.define(
	'Tag',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		nombre: {
			type: DataTypes.STRING,
			unique: true,
			validate: {
				isAlpha: true
			}
		}
  	},
  	{
		timestamps: false,
  	},
);