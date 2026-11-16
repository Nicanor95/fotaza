import { DataTypes } from 'sequelize';
import sequelize from './config.js';

export const ReporteComentario = sequelize.define(
	'ReporteComentario',
	{
		id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
		},
		comentario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		usuario_id: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		motivo: {
			type: DataTypes.STRING,
		}
  	},
  	{
		timestamps: true,
		tableName: 'reportes_comentarios'
  	},
);
