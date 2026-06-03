import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ImgTag = sequelize.define(
	'ImgTag',
	{
		img_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		tag_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: false,
		tableName: 'img_tag'
  	},
);