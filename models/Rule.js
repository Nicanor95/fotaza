import { DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Rule = sequelize.define(
	'Rule',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		text: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true
		}
	},
	{
		timestamps: false,
		tableName: 'rules'
	},
);
