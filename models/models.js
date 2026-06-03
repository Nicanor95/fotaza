import { Chat } from './Chat.js';
import { Coleccion } from './Coleccion.js';
import { Comentario } from './Comentario.js';
import { Imagen } from './Imagen.js';
import { Mensaje } from './Mensaje.js';
import { Notificacion } from './Notificacion.js';
import { Publicacion } from './Publicacion.js';
import { Reporte } from './Reporte.js';
import { Tag } from './Tag.js';
import { Usuario } from './Usuario.js';
import { Valoracion } from './Valoracion.js';

//-*-*- Relations -*-*-
// Chat
Chat.belongsToMany(Usuario, { through: 'chatparticipants', foreignKey: 'chat_id' });
Usuario.belongsToMany(Chat, { through: 'chatparticipants', foreignKey: 'usuario_id' });

Chat.belongsTo(Imagen, { foreignKey: 'imagen_id' });
Imagen.hasMany(Chat, { foreignKey: 'imagen_id' });

Mensaje.belongsTo(Chat, { foreignKey: 'chat_id' });
Chat.hasMany(Mensaje, { foreignKey: 'chat_id' });

Mensaje.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Mensaje, { foreignKey: 'usuario_id' });

// Colección
Usuario.hasMany(Coleccion, { foreignKey: 'usuario_id' });
Coleccion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Coleccion.belongsToMany(Imagen, { through: 'col_img', foreignKey: 'col_id' });
Imagen.belongsToMany(Coleccion, { through: 'col_img', foreignKey: 'img_id' });

Coleccion.belongsToMany(Publicacion, { through: 'col_pub', foreignKey: 'col_id' });
Publicacion.belongsToMany(Coleccion, { through: 'col_pub', foreignKey: 'pub_id' });

// Publicacion
Publicacion.belongsTo(Usuario, {foreignKey: 'usuario_id' });
Usuario.hasMany(Publicacion, { foreignKey: 'usuario_id' });

Publicacion.hasMany(Imagen, { foreignKey: 'publicacion_id' });
Imagen.belongsTo(Publicacion, { foreignKey: 'publicacion_id' });

// Imagenes
Imagen.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Imagen, { foreignKey: 'usuario_id' });

// Tags
Imagen.belongsToMany(Tag, { through: 'img_tag', foreignKey: 'img_id', timestamps: false });
Tag.belongsToMany(Imagen, { through: 'img_tag', foreignKey: 'tag_id', timestamps: false });

// Comentarios
Comentario.belongsTo(Imagen, { foreignKey: 'parent_id' });
Imagen.hasMany(Comentario, { foreignKey: 'parent_id' });

Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Comentario, { foreignKey: 'usuario_id' });

// Reportes
Reporte.belongsTo(Imagen, { foreignKey: 'img_id' });
Imagen.hasMany(Reporte, { foreignKey: 'img_id' });

Reporte.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Reporte, { foreignKey: 'usuario_id' });

// Notificaciones
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id' });

// Valoraciones
Valoracion.belongsTo(Imagen, { foreignKey: 'img_id' });
Imagen.hasMany(Valoracion, { foreignKey: 'img_id' });

Valoracion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Valoracion, { foreignKey: 'usuario_id' });

// Favoritos
Imagen.belongsToMany(Usuario, { through: 'favoritos', foreignKey: 'img_id' });
Usuario.belongsToMany(Imagen, { through: 'favoritos', foreignKey: 'usuario_id' });

// Follows
Usuario.belongsToMany(Usuario, { as: 'follower', through: 'follows', foreignKey: 'follower'});
Usuario.belongsToMany(Usuario, { as: 'followed', through: 'follows', foreignKey: 'followed'});
