import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Publicacion = sequelize.define(
	'Publicacion',
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
		titulo: {
			type: DataTypes.STRING
		}
  	},
  	{
		timestamps: true, // Adds createdAt and updatedAt.
		paranoid: true, // Adds deletedAt
		tableName: 'publicaciones'
  	},
);