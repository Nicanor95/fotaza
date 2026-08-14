import { DataTypes } from 'sequelize';
import sequelize from './config.js';

export const Moderador = sequelize.define('Moderador', {
	usuario_id: {
		type: DataTypes.BIGINT,
		primaryKey: true,
		allowNull: false,
		references: {
			model: 'usuarios',
			key: 'id'
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	}
}, {
	tableName: 'moderadores',
	timestamps: false
});
