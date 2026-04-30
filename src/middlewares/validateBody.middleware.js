module.exports = (requiredFields) => (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);
    if (missing.length) {
        return res.status(400).json({ ok: false, error: `Faltan campos: ${missing.join(', ')}` });
    }
    next();
};