const service = require("../services/detalledereservapaquetes.service");

exports.listar = async (req, res) => {
    const data = await service.listar();
    res.json(data);
};

exports.obtener = async (req, res) => {
    const data = await service.obtener(req.params.id);
    res.json(data);
};

exports.crear = async (req, res) => {
    const data = await service.crear(req.body);
    res.json(data);
};

exports.actualizar = async (req, res) => {
    await service.actualizar(req.params.id, req.body);
    res.json({ mensaje: "Actualizado" });
};

exports.eliminar = async (req, res) => {
    await service.eliminar(req.params.id);
    res.json({ mensaje: "Eliminado" });
};