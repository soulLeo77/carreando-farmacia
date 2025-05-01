const express = require('express');
const cors = require('cors');
const categoriasRouter = require('./routes/categoria');
const productosRouter = require('./routes/producto');
const ventasRouter = require('./routes/venta');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/categorias', categoriasRouter);
app.use('/productos', productosRouter);
app.use('/ventas', ventasRouter);

const PORT = process.env.LISENER_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})