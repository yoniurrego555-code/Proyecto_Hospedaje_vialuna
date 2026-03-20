const service = require("../services/permisos.service");

// 🔹 LISTAR
exports.listar = async (req, res) => {
    try {
        const data = await service.listar();
        res.json(data);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar permisos",
            error: error.message
        });
    }
};

// 🔹 OBTENER
exports.obtener = async (req, res) => {
    try {
        const data = await service.obtener(req.params.id);

        if (!data) {
            return res.status(404).json({
                mensaje: "Permiso no encontrado"
            });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener permiso",
            error: error.message
        });
    }
};

// 🔹 CREAR
exports.crear = async (req, res) => {
    try {
        await service.crear(req.body);
        res.json({
            mensaje: "Permiso creado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear permiso",
            error: error.message
        });
    }
};

// 🔹 ACTUALIZAR
exports.actualizar = async (req, res) => {
    try {
        await service.actualizar(req.params.id, req.body);
        res.json({
            mensaje: "Permiso actualizado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar permiso",
            error: error.message
        });
    }
};

// 🔹 ELIMINAR
exports.eliminar = async (req, res) => {
    try {
        await service.eliminar(req.params.id);
        res.json({
            mensaje: "Permiso eliminado correctamente"
        });
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al eliminar permiso",
            error: error.message
        });
    }
};