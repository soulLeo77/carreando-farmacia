const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
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
        body('detalles').isArray({ min: 1 }).withMessage('Los detalles de la venta son obligatorios'),
        body('detalles.*.id_producto').isInt().withMessage('El ID del producto debe ser un número entero'),
        body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
        body('detalles.*.valor_venta').isDecimal().withMessage('El valor de la venta debe ser un número decimal')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { detalles } = req.body;

        try {
            // Crear la venta
            const [ventaResult] = await db.query('INSERT INTO venta () VALUES ()');
            const id_venta = ventaResult.insertId;

            // Insertar los detalles de la venta
            for (const detalle of detalles) {
                const { id_producto, cantidad, valor_venta } = detalle;

                // Verificar stock del producto
                const [producto] = await db.query('SELECT stock FROM producto WHERE id_producto = ?', [id_producto]);
                if (producto.length === 0) {
                    return res.status(404).json({ error: `Producto con ID ${id_producto} no encontrado` });
                }
                if (producto[0].stock < cantidad) {
                    return res.status(400).json({ error: `Stock insuficiente para el producto con ID ${id_producto}` });
                }

                // Reducir el stock del producto
                await db.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', [cantidad, id_producto]);

                // Insertar detalle
                await db.query(
                    'INSERT INTO venta_detalle (id_venta, id_producto, cantidad, valor_venta) VALUES (?, ?, ?, ?)',
                    [id_venta, id_producto, cantidad, valor_venta]
                );
            }

            res.status(201).json({ mensaje: 'Venta creada exitosamente', id_venta });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear la venta' });
        }
    }
);

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Eliminar detalles de la venta
        await db.query('DELETE FROM venta_detalle WHERE id_venta = ?', [id]);

        // Eliminar la venta
        const [result] = await db.query('DELETE FROM venta WHERE id_venta = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' });

        res.status(200).json({ mensaje: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la venta' });
    }
});

module.exports = router;