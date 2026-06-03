import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Chat = sequelize.define(
	'Chat',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		imagen_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
		paranoid: true // Adds deletedAt.
  	},
);