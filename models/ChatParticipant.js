import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ChatParticipant = sequelize.define(
	'ChatParticipant',
	{
		chat_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		}
  	},
  	{
		timestamps: false,
  	},
);