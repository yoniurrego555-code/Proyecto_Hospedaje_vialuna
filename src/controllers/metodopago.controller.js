const service = require("../services/metodopago.service");

// 🔹 LISTAR TODOS
exports.listar = async (req, res) => {
    try {
        const data = await service.listar();
        res.json(data);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar métodos de pago",
            error: error.message
        });
    }
};

// 🔹 OBTENER POR ID
exports.obtener = async (req, res) => {
    try {
        const data = await service.obtener(req.params.id);

        if (!data) {
            return res.status(404).json({
                mensaje: "Método de pago no encontrado"
            });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener método de pago",
            error: error.message
        });
    }
};

// 🔹 CREAR
exports.crear = async (req, res) => {
    try {
        await service.crear(req.body);
        res.json({
            mensaje: "Método de pago creado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear método de pago",
            error: error.message
        });
    }
};

// 🔹 ACTUALIZAR
exports.actualizar = async (req, res) => {
    try {
        await service.actualizar(req.params.id, req.body);
        res.json({
            mensaje: "Método de pago actualizado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar método de pago",
            error: error.message
        });
    }
};

// 🔹 ELIMINAR
exports.eliminar = async (req, res) => {
    try {
        await service.eliminar(req.params.id);
        res.json({
            mensaje: "Método de pago eliminado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al eliminar método de pago",
            error: error.message
        });
    }
};