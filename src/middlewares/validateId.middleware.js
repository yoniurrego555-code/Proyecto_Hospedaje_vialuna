module.exports = (paramName) => (req, res, next) => {
    const id = req.params[paramName];
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ ok: false, error: 'ID inválido' });
    }
    next();
};