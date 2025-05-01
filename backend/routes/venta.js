const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const dayjs = require('dayjs');
const db = require('../connection/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                v.*,
                vd.*,
                p.nombre_producto
            FROM venta v
            JOIN venta_detalle vd ON v.id_venta = vd.id_venta
            JOIN producto p ON vd.id_producto = p.id_producto`
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM venta WHERE id_venta = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

        // Obtener detalles de la venta
        const [detalles] = await db.query(
            'SELECT vd.*, p.nombre_producto FROM venta_detalle vd JOIN producto p ON vd.id_producto = p.id_producto WHERE vd.id_venta = ?',
            [id]
        );

        res.status(200).json({ venta: rows[0], detalles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la venta' });
    }
});

router.post('/',
    [
        body('fecha_venta')
            .notEmpty().withMessage('La fecha de venta es obligatoria')
            .isDate().withMessage('La fecha de venta debe estar en formato YYYY-MM-DD')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { fecha_venta } = req.body;

        try {
            fecha_venta = dayjs(fecha_venta, 'DD/MM/YYYY').format('YYYY-MM-DD');

            const [ventaResult] = await db.query('INSERT INTO venta (fecha_venta) VALUES (?)', [fecha_venta]);
            const id_venta = ventaResult.insertId;

            res.status(201).json({ id_venta, mensaje: 'Venta creada exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear la venta' });
        }
    }
);

router.patch('/:id',
    [
        body('fecha_venta')
            .notEmpty().withMessage('La fecha de venta es obligatoria')
            .isDate().withMessage('La fecha de venta debe estar en formato DD/MM/YYYY o YYYY-MM-DD')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { fecha_venta } = req.body;
        const id = req.params.id;

        try {
            fecha_venta = dayjs(fecha_venta).format('YYYY-MM-DD');

            const [result] = await db.query('UPDATE venta SET fecha_venta = ? WHERE id_venta = ?', [fecha_venta, id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' });

            res.status(200).json({ id_venta: id, fecha_venta });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la venta' });
        }
    }
);

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM venta_detalle WHERE id_venta = ?', [id]);

        const [result] = await db.query('DELETE FROM venta WHERE id_venta = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' });

        res.status(200).json({ mensaje: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la venta' });
    }
});

module.exports = router;