import { Sequelize, DataTypes, BOOLEAN } from 'sequelize';
import sequelize from './config.js';

export const Notificacion = sequelize.define(
	'Notificacion',
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
		contenido: {
			type: DataTypes.STRING,
			allowNull: false
		},
		visto: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
  	},
);