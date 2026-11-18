import { DataTypes } from 'sequelize';
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
		link: {
			type: DataTypes.STRING,
			allowNull: true // Existing notifications may not have a destination.
		},
		visto: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
		tableName: 'notificaciones'
  	},
);