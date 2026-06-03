import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Reporte = sequelize.define(
	'Reporte',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		img_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		motivo: {
			type: DataTypes.STRING,
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
  	},
);