import { Sequelize, DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Imagen = sequelize.define(
	'Imagen',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
    	publicacion_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		copyright: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		description: {
			type: DataTypes.STRING
		},
		metadata: {
			type: DataTypes. STRING,
			allowNull: false
		},
		blob: {
			type: DataTypes.BLOB('long'),
			allowNull: false
		}
  	},
  	{
		timestamps: true,
		tableName: 'imagenes'
  	},
);