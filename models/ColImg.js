import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ColImg = sequelize.define(
	'ColImg',
	{
		col_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		img_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: false,
		tableName: 'col_img'
  	},
);