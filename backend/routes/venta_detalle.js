const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../connection/db');

router.post('/',
    [
        body('id_venta').isInt().withMessage('El ID de la venta es obligatorio y debe ser un número entero'),
        body('id_producto').isInt().withMessage('El ID del producto es obligatorio y debe ser un número entero'),
        body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
    ],
    async (req, res) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_venta, id_producto, cantidad } = req.body;

        try {
            // Verificar stock del producto
            const [producto] = await db.query('SELECT * FROM producto WHERE id_producto = ?', [id_producto]);
            if (producto.length === 0) {
                return res.status(404).json({ error: `Producto con ID ${id_producto} no encontrado` });
            }
            if (producto[0].stock < cantidad) {
                return res.status(400).json({ error: `Stock insuficiente para el producto con ID ${id_producto}` });
            }

            // Reducir el stock del producto
            await db.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', [cantidad, id_producto]);

            const valor_venta = parseFloat(producto[0].precio_unitario) * parseFloat(cantidad);

            // Insertar detalle de venta
            const [result] = await db.query(
                'INSERT INTO venta_detalle (id_venta, id_producto, cantidad, valor_venta) VALUES (?, ?, ?, ?)',
                [id_venta, id_producto, cantidad, valor_venta]
            );

            res.status(201).json({ mensaje: 'Detalle de venta creado exitosamente', id_det_venta: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el detalle de venta' });
        }
    }
);

router.patch('/:id',
    [
        body('cantidad').notEmpty().withMessage('La cantidad es obligatoria'),
        body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        const { cantidad } = req.body;

        try {
            // Obtener el detalle de venta actual
            const [detalle] = await db.query('SELECT * FROM venta_detalle WHERE id_det_venta = ?', [id]);
            if (detalle.length === 0) {
                return res.status(404).json({ error: 'Detalle de venta no encontrado' });
            }

            // Si se actualiza la cantidad, ajustar el stock del producto
            const diferencia = parseFloat(cantidad) - parseFloat(detalle[0].cantidad);

            // Verificar stock del producto
            const [producto] = await db.query('SELECT * FROM producto WHERE id_producto = ?', [detalle[0].id_producto]);
            if (producto[0].stock < diferencia) {
                return res.status(400).json({ error: `Stock insuficiente para el producto con ID ${detalle[0].id_producto}` });
            }

            // Actualizar el stock del producto
            await db.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', [diferencia, detalle[0].id_producto]);

            // Conseguir el valor de compra real
            const new_valor_venta = parseFloat(detalle[0].valor_venta) + (parseFloat(producto[0].precio_unitario) * diferencia);

            // Actualizar el detalle de venta
            const [result] = await db.query(
                'UPDATE venta_detalle SET cantidad = COALESCE(?, cantidad), valor_venta = COALESCE(?, valor_venta) WHERE id_det_venta = ?',
                [cantidad, new_valor_venta, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Detalle de venta no encontrado' });
            }

            res.status(200).json({ id_det_venta: id, cantidad, valor_venta: new_valor_venta });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el detalle de venta' });
        }
    }
);

// Eliminar un detalle de venta
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Obtener el detalle de venta actual
        const [detalle] = await db.query('SELECT * FROM venta_detalle WHERE id_det_venta = ?', [id]);
        if (detalle.length === 0) {
            return res.status(404).json({ error: 'Detalle de venta no encontrado' });
        }

        // Devolver el stock al producto
        await db.query('UPDATE producto SET stock = stock + ? WHERE id_producto = ?', [detalle[0].cantidad, detalle[0].id_producto]);

        // Eliminar el detalle de venta
        const [result] = await db.query('DELETE FROM venta_detalle WHERE id_det_venta = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Detalle de venta no encontrado' });
        }

        res.status(200).json({ mensaje: 'Detalle de venta eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el detalle de venta' });
    }
});

module.exports = router;