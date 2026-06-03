import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Valoracion = sequelize.define(
	'Valoracion',
	{
		img_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		valor: {
			type: DataTypes.TINYINT,
			allowNull: false
		}
  	},
  	{
		timestamps: true,
  	},
);