const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../connection/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categoria');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query(
            'SELECT * FROM categoria WHERE id_categoria = ?', [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categoria' });
    }
});

router.post('/',
    [
        body('nombre_categoria').notEmpty().withMessage('El nombre de la categoria es obligatorio'),
        body('nombre_categoria').isString().withMessage('El nombre de la cateogria debe ser una cadena de texto')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre_categoria } = req.body;

        try {
            const [result] = await db.query(
                'INSERT INTO categoria (nombre_categoria) VALUES (?)', [nombre_categoria]
            );
            res.status(201).json({ id_categoria: result.insertId, nombre_categoria});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear categoria' });
        }
    }
);

router.patch('/:id',
    [
        body('nombre_categoria').notEmpty().withMessage('El nombre de la categoria es obligatorio'),
        body('nombre_categoria').isString().withMessage('El nombre de la cateogria debe ser una cadena de texto')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        const { nombre_categoria } = req.body;

        try {
            const [result] = await db.query(
                'UPDATE categoria SET nombre_categoria = ? WHERE id_categoria = ?', [nombre_categoria, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoria no encontrada'});
            res.status(200).json({ id_categoria: id, nombre_categoria: nombre_categoria});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar categoria' });
        }
    }
);

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await db.query(
            'DELETE FROM categoria WHERE id_categoria = ?', [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoria no encontrada'});
        res.status(200).json({ mensaje: 'Categoria eliminada'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar categoria' });
    }
});

module.exports = router;