import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ColPub = sequelize.define(
	'ColPub',
	{
		col_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		pub_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: false,
		tableName: 'col_pub'
  	},
);