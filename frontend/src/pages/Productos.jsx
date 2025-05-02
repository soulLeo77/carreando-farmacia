import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newProducto, setNewProducto] = useState({
        id_categoria: '',
        nombre_producto: '',
        stock: 0,
        precio_unitario: 0,
        congelado: false,
        activo: true,
    });
    const [editProducto, setEditProducto] = useState({
        id_producto: null,
        id_categoria: '',
        nombre_producto: '',
        stock: 0,
        precio_unitario: 0,
        congelado: false,
        activo: true,
    });
    const [deleteProductoId, setDeleteProductoId] = useState(null);
    const [error, setError] = useState('');

    // Fetch productos y categorías on mount
    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    const fetchProductos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/productos');
            setProductos(response.data);
        } catch (error) {
            console.error('Error fetching productos:', error);
            setError('Error al obtener productos. Intente de nuevo.');
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await axios.get('http://localhost:3000/categorias');
            setCategorias(response.data);
        } catch (error) {
            console.error('Error fetching categorías:', error);
            setError('Error al obtener categorías. Intente de nuevo.');
        }
    };

    // Handle create producto
    const handleCreateProducto = async () => {
        if (!newProducto.nombre_producto.trim()) {
            setError('El nombre del producto es obligatorio.');
            return;
        }
        if (!newProducto.id_categoria) {
            setError('Seleccione una categoría.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/productos', {
                id_categoria: parseInt(newProducto.id_categoria),
                nombre_producto: newProducto.nombre_producto.trim(),
                stock: parseInt(newProducto.stock),
                precio_unitario: parseFloat(newProducto.precio_unitario),
                congelado: newProducto.congelado,
                activo: newProducto.activo,
            });
            setNewProducto({
                id_categoria: '',
                nombre_producto: '',
                stock: 0,
                precio_unitario: 0,
                congelado: false,
                activo: true,
            });
            setIsCreateModalOpen(false);
            fetchProductos();
            setError('');
        } catch (error) {
            console.error('Error creating producto:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al crear producto';
            setError(errorMessage);
        }
    };

    // Handle edit producto
    const handleEditProducto = async () => {
        if (!editProducto.nombre_producto.trim()) {
            setError('El nombre del producto es obligatorio.');
            return;
        }
        if (!editProducto.id_categoria) {
            setError('Seleccione una categoría.');
            return;
        }

        try {
            await axios.patch(`http://localhost:3000/productos/${editProducto.id_producto}`, {
                id_categoria: parseInt(editProducto.id_categoria),
                nombre_producto: editProducto.nombre_producto.trim(),
                stock: parseInt(editProducto.stock),
                precio_unitario: parseFloat(editProducto.precio_unitario),
                congelado: editProducto.congelado,
                activo: editProducto.activo,
            });
            setIsEditModalOpen(false);
            fetchProductos();
            setError('');
        } catch (error) {
            console.error('Error updating producto:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al actualizar producto';
            setError(errorMessage);
        }
    };

    // Handle delete producto
    const handleDeleteProducto = async () => {
        try {
            await axios.delete(`http://localhost:3000/productos/${deleteProductoId}`);
            setIsDeleteModalOpen(false);
            fetchProductos();
            setError('');
        } catch (error) {
            console.error('Error deleting producto:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar producto';
            setError(errorMessage);
        }
    };

    // Open edit modal with current producto data
    const openEditModal = (producto) => {
        setEditProducto({
            id_producto: producto.id_producto,
            id_categoria: producto.id_categoria,
            nombre_producto: producto.nombre_producto,
            stock: producto.stock,
            precio_unitario: producto.precio_unitario,
            congelado: producto.congelado,
            activo: producto.activo,
        });
        setIsEditModalOpen(true);
        setError('');
    };

    // Open delete confirmation modal
    const openDeleteModal = (id) => {
        setDeleteProductoId(id);
        setIsDeleteModalOpen(true);
        setError('');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Productos</h1>
            <p className="text-gray-600 mb-6">Gestión de productos en el inventario.</p>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Create Producto Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Agregar Producto
                </button>
            </div>

            {/* Productos Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Congelado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Activo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productos.length > 0 ? (
                            productos.map((producto) => (
                                <tr key={producto.id_producto}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.id_producto}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.nombre_producto}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.nombre_categoria}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.stock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${parseFloat(producto.precio_unitario).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.congelado ? 'Sí' : 'No'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {producto.activo ? 'Sí' : 'No'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(producto)}
                                            className="text-yellow-600 hover:text-yellow-800 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(producto.id_producto)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay productos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Producto Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Crear Producto</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select
                                value={newProducto.id_categoria}
                                onChange={(e) => setNewProducto({ ...newProducto, id_categoria: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={newProducto.nombre_producto}
                                onChange={(e) => setNewProducto({ ...newProducto, nombre_producto: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={newProducto.stock}
                                onChange={(e) => setNewProducto({ ...newProducto, stock: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newProducto.precio_unitario}
                                onChange={(e) => setNewProducto({ ...newProducto, precio_unitario: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newProducto.congelado}
                                    onChange={(e) => setNewProducto({ ...newProducto, congelado: e.target.checked })}
                                    className="mr-2"
                                />
                                Congelado
                            </label>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newProducto.activo}
                                    onChange={(e) => setNewProducto({ ...newProducto, activo: e.target.checked })}
                                    className="mr-2"
                                />
                                Activo
                            </label>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewProducto({
                                        id_categoria: '',
                                        nombre_producto: '',
                                        stock: 0,
                                        precio_unitario: 0,
                                        congelado: false,
                                        activo: true,
                                    });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProducto}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Producto Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select
                                value={editProducto.id_categoria}
                                onChange={(e) => setEditProducto({ ...editProducto, id_categoria: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={editProducto.nombre_producto}
                                onChange={(e) => setEditProducto({ ...editProducto, nombre_producto: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={editProducto.stock}
                                onChange={(e) => setEditProducto({ ...editProducto, stock: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editProducto.precio_unitario}
                                onChange={(e) => setEditProducto({ ...editProducto, precio_unitario: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editProducto.congelado}
                                    onChange={(e) => setEditProducto({ ...editProducto, congelado: e.target.checked })}
                                    className="mr-2"
                                />
                                Congelado
                            </label>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editProducto.activo}
                                    onChange={(e) => setEditProducto({ ...editProducto, activo: e.target.checked })}
                                    className="mr-2"
                                />
                                Activo
                            </label>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditProducto({
                                        id_producto: null,
                                        id_categoria: '',
                                        nombre_producto: '',
                                        stock: 0,
                                        precio_unitario: 0,
                                        congelado: false,
                                        activo: true,
                                    });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditProducto}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                        <p className="mb-4">¿Estás seguro de que deseas eliminar este producto?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteProductoId(null);
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteProducto}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                            >
                                Sí
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}