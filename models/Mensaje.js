import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Mensaje = sequelize.define(
	'Mensaje',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		chat_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		contenido: {
			type: DataTypes.STRING,
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
		paranoid: true // Adds deletedAt.
  	},
);