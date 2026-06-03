import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Favorito = sequelize.define(
	'Favorito',
	{
		img_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: true,
		tableName: 'favoritos'
  	},
);