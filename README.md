# fotaza

TPI de ULP 

Video demo: https://youtu.be/xxNP13l4WBs
hosteado en: https://fotaza-ciir.onrender.com/

# Dependencias

## connect-session-sequelize

Usado en conjunto a **express-session** para guardar sesiones en bd, proporcionando mayor flexibilidad en uso serverless.

## express-session

Mantiene sesiones y cookies

## multer

Permite manejar la recepcion de POST requests en varias partes. Esto nos sirve para poder subir imagenes mas grandes y sin necesidad de convertirlas a base64 primero.

## sequelize

Para simplificar manejo de la BD

## pg y pg-hstore

Usados por **sequelize** para la conexion con la base de datos PostgreSQL

## pug

Engine de plantillas para que el servidor pueda generar una pagina html de forma dinamica

## dotenv

Para cargar variables de entorno

# Usuarios de prueba

Es posible el registro, tambien tiene estos para probar:

```JavaScript
{	nombre: "Elias Nombre",
	email: "elias@correo.com",
	password: "hunter2",
},
{	nombre: "Eduardo Romero",
	email: "eduardo@correo.com",
	password: "hunter2",
},
{	nombre: "Mariela Gomez",
	email: "mariela@correo.com",
	password: "hunter2",
}
```