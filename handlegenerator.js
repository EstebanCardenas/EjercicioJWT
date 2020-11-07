let jwt = require( 'jsonwebtoken' );
let config = require( './config' );
const bcrypt = require("bcrypt");
const saltRounds = 10;
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

//mongo
const {MongoClient} = require("mongodb");
const uri = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Clase encargada de la creación del token
class HandlerGenerator {
    login( req, res ) {
        async function run() {
            await client.connect();
            const db = client.db("jwt");
            const coll = db.collection("credenciales");
            // Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
            let username = req.body.username;
            let password = req.body.password;

            // usuario y contraseña, traidos de la BD
            let user = await coll.find({
                user: username
            }).toArray();

            // Si se especifico un usuario y contraseña, proceda con la validación
            // de lo contrario, un mensaje de error es retornado
            if( (username && password) && (user.length !== 0)) {
                let dbUser = user[0]["user"];
                let dbPass = user[0]["pass"];
                bcrypt.compare(password, dbPass, (err, equal_pass) => {
                    // Si los usuarios y las contraseñas coinciden, proceda con la generación del token
                    // de lo contrario, un mensaje de error es retornado
                    if( username === dbUser && equal_pass ) {
                        // Se genera un nuevo token para el nombre de usuario el cuál expira en 24 horas
                        let token = jwt.sign( { username: username },
                            config.secret, { expiresIn: '24h' } );
                        // Retorna el token el cuál debe ser usado durante las siguientes solicitudes
                        localStorage.setItem("role", user[0]["role"])
                        res.json( {
                            success: true,
                            message: 'Authentication successful!',
                            token: token
                        } );
                    } else {
                        // El error 403 corresponde a Forbidden (Prohibido) de acuerdo al estándar HTTP
                        res.send( 403 ).json( {
                            success: false,
                            message: 'Incorrect username or password'
                        } );
                        return
                    }
                })
            } else {
                // El error 400 corresponde a Bad Request de acuerdo al estándar HTTP
                res.send( 400 ).json( {
                    success: false,
                    message: 'Authentication failed! Please check the request'
                } );
                return
            }
        }
        run().catch(console.dir);
    }

    register(req, res) {
        async function run() {
            await client.connect();
            const db = client.db("jwt");
            const coll = db.collection("credenciales");
            
            let rep = await coll.findOne({
                user: req.body["username"]
            });
            if (rep == null) {
                const hash = bcrypt.hashSync(req.body["password"], saltRounds);
                let doc = {
                    user: req.body["username"],
                    pass: hash,
                    role: "client"
                }
                coll.insertOne(doc);
                res.send("Usuario registrado");
            } else {
                res.status(403);
                res.send("Ya existe un usuario el username");
            }
        }
        run().catch(console.dir);
    }

    index( req, res ) {
        // Retorna una respuesta exitosa con previa validación del token
        res.json( {
            success: true,
            message: 'Index page'
        } );
    }
}

module.exports = HandlerGenerator;