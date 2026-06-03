import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Follow = sequelize.define(
	'Follow',
	{	// usuario1 follows usuario2.
		usuario1_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		usuario2_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: true,
  	},
);