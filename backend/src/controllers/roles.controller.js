const service = require("../services/roles.service");

// LISTAR
exports.listar = async (req, res) => {
    try {
        const data = await service.listar();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: error.message });
    }
};

// OBTENER
exports.obtener = async (req, res) => {
    try {
        const data = await service.obtener(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// CREAR
exports.crear = async (req, res) => {
    try {
        await service.crear(req.body);
        res.json({ mensaje: "Rol creado correctamente" });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// ACTUALIZAR
exports.actualizar = async (req, res) => {
    try {
        await service.actualizar(req.params.id, req.body);
        res.json({ mensaje: "Rol actualizado" });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

// ELIMINAR
exports.eliminar = async (req, res) => {
    try {
        await service.eliminar(req.params.id);
        res.json({ mensaje: "Rol eliminado" });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};