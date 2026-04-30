
const { habitaciones, nombre, email, telefono } = req.body;

if (!habitaciones || habitaciones.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'No hay habitaciones seleccionadas' });
}

const promesas = habitaciones.map(h => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO detalle_reservas (habitacion_id, nombre, email, telefono, precio)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [h.id, nombre, email, telefono, h.precio], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
});

Promise.all(promesas)
    .then(() => res.json({ ok: true, mensaje: 'Reserva guardada correctamente' }))
    .catch(err => {
        console.error(err);
        res.status(500).json({ ok: false, mensaje: 'Error al guardar la reserva' });
    });

    // Ejemplo
const promesasPaquetes = paquetes.map(p => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO detalle_reservas (paquete_id, nombre, email, telefono, precio)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [p.id, nombre, email, telefono, p.precio], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
});

Promise.all(promesasPaquetes)
    .then(() => res.json({ok:true, mensaje:'Paquetes reservados correctamente'}))
    .catch(err => {
        console.error(err);
        res.status(500).json({ok:false, mensaje:'Error al guardar paquetes'});
    });