import { DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ImagenEliminada = sequelize.define(
	'ImagenEliminada',
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true
		},
		user_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		moderator_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		}
	},
	{
		timestamps: true,
		tableName: 'imagenes_dadas_de_baja'
	},
);
