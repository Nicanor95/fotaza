import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Coleccion = sequelize.define(
	'Coleccion',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		title: {
			type: DataTypes.STRING,
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
		paranoid: true, // Adds deletedAt.
		tableName: 'colecciones'
  	},
);