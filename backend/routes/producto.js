const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../connection/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT p.*, c.nombre_categoria FROM producto p JOIN categoria c ON p.id_categoria = c.id_categoria'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query(
            'SELECT p.*, c.nombre_categoria FROM producto p JOIN categoria c ON p.id_categoria = c.id_categoria WHERE id_producto = ?',
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

router.post('/',
    [
        body('id_categoria').notEmpty().withMessage('El ID de la categoría es obligatorio'),
        body('id_categoria').isInt().withMessage('El ID de la categoría debe ser un número entero'),
        body('nombre_producto').notEmpty().withMessage('El nombre del producto es obligatorio'),
        body('nombre_producto').isString().withMessage('El nombre del producto debe ser una cadena de texto'),
        body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo'),
        body('precio_unitario').optional().isFloat().withMessage('El precio unitario debe ser un número'),
        body('congelado').isBoolean().optional().withMessage('El valor de congelado debe ser booleano'),
        body('activo').isBoolean().optional().withMessage('El valor de activo debe ser booleano')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_categoria, nombre_producto, stock = 0, precio_unitario = 0, congelado = false, activo = true } = req.body;

        try {
            const [result] = await db.query(
                'INSERT INTO producto (id_categoria, nombre_producto, stock, precio_unitario, congelado, activo) VALUES (?, ?, ?, ?, ?, ?)',
                [id_categoria, nombre_producto, stock, precio_unitario, congelado, activo]
            );
            res.status(201).json({ id_producto: result.insertId, id_categoria, nombre_producto, stock, precio_unitario, congelado, activo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear producto' });
        }
    }
);

// Actualizar un producto
router.patch('/:id',
    [
        body('id_categoria').isInt().optional().withMessage('El ID de la categoría debe ser un número entero'),
        body('nombre_producto').isString().optional().withMessage('El nombre del producto debe ser una cadena de texto'),
        body('stock').isInt({ min: 0 }).optional().withMessage('El stock debe ser un número entero no negativo'),
        body('precio_unitario').isFloat().optional().withMessage('El precio unitario debe ser un número'),
        body('congelado').isBoolean().optional().withMessage('El valor de congelado debe ser booleano'),
        body('activo').isBoolean().optional().withMessage('El valor de activo debe ser booleano')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        const { id_categoria, nombre_producto, stock, precio_unitario, congelado, activo } = req.body;

        try {
            const [result] = await db.query(
                'UPDATE producto SET id_categoria = COALESCE(?, id_categoria), nombre_producto = COALESCE(?, nombre_producto), stock = COALESCE(?, stock), precio_unitario = COALESCE(?, precio_unitario), congelado = COALESCE(?, congelado), activo = COALESCE(?, activo) WHERE id_producto = ?',
                [id_categoria, nombre_producto, stock, precio_unitario, congelado, activo, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
            res.status(200).json({ id_producto: id, id_categoria, nombre_producto, stock, precio_unitario, congelado, activo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    }
);

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Verificar si el producto está referenciado en venta_detalle
        const [ventas] = await db.query(
            'SELECT id_det_venta FROM venta_detalle WHERE id_producto = ?', [id]
        );
        if (ventas.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar: el producto está asociado a ventas' });
        }

        const [result] = await db.query(
            'DELETE FROM producto WHERE id_producto = ?', [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;