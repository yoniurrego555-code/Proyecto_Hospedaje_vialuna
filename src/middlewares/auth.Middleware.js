const jwt = require('jsonwebtoken');
const secret = 'TU_SECRETO_SUPER_SEGURO';

module.exports = () => (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ ok: false, error: 'Token requerido' });
    }

    jwt.verify(token.replace('Bearer ', ''), secret, (err, decoded) => {
        if (err) return res.status(401).json({ ok: false, error: 'Token inválido' });

        req.usuario = decoded; // agrega info del usuario al request
        next();
    });
};
