const service = require("../services/servicios.service");

exports.listar = async (req, res) => {
    try {
        const data = await service.listar();
        res.json(data);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.crear = async (req, res) => {
    try {
        await service.crear(req.body);
        res.json({ mensaje: "Creado correctamente" });
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.actualizar = async (req, res) => {
    try {
        await service.actualizar(req.params.id, req.body);
        res.json({ mensaje: "Actualizado correctamente" });
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.eliminar = async (req, res) => {
    try {
        await service.eliminar(req.params.id);
        res.json({ mensaje: "Eliminado correctamente" });
    } catch (error) {
        res.status(500).json(error);
    }
};