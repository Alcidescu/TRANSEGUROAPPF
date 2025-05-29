const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
// const jwt = require('jsonwebtoken'); // si quieres usar token después

exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;
    console.log('Registro recibido:', req.body);

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const userExists = await Usuario.findOne({ correo });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuario({ nombre, correo, password: hashedPassword, rol });
    await newUser.save();

    console.log('Usuario registrado:', newUser);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el registro', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    console.log('Intento de login:', req.body);

    if (!correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const user = await Usuario.findOne({ correo });
    if (!user) {
      console.log('Usuario no encontrado:', correo);
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Contraseña incorrecta para usuario:', correo);
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }

    console.log('Login exitoso para:', correo);

    return res.status(200).json({
      message: 'Login exitoso',
      nombre: user.nombre || '',
      correo: user.correo,
      rol: user.rol || 'usuario',
      id: user._id.toString()
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor. Intente más tarde.' });
  }
};
