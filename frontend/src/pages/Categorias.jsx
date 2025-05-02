import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Categorias() {
    const [categories, setCategories] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [editCategory, setEditCategory] = useState({ id_categoria: null, nombre_categoria: '' });
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [error, setError] = useState('');

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/categorias/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Error al obtener categorías. Intente de nuevo.');
        }
    };

    // Handle create category
    const handleCreateCategory = async () => {
        if (!newCategory.trim()) {
            setError('El nombre de la categoría es obligatorio.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/categorias/', {
                nombre_categoria: newCategory.trim(),
            });
            setNewCategory('');
            setIsCreateModalOpen(false);
            fetchCategories();
            setError('');
        } catch (error) {
            console.error('Error creating category:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al crear categoría';
            setError(errorMessage);
        }
    };

    // Handle edit category
    const handleEditCategory = async () => {
        if (!editCategory.nombre_categoria.trim()) {
            setError('El nombre de la categoría es obligatorio.');
            return;
        }

        try {
            await axios.patch(`http://localhost:3000/categorias/${editCategory.id_categoria}`, {
                nombre_categoria: editCategory.nombre_categoria.trim(),
            });
            setIsEditModalOpen(false);
            fetchCategories();
            setError('');
        } catch (error) {
            console.error('Error updating category:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al actualizar categoría';
            setError(errorMessage);
        }
    };

    // Handle delete category
    const handleDeleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:3000/categorias/${deleteCategoryId}`);
            setIsDeleteModalOpen(false);
            fetchCategories();
            setError('');
        } catch (error) {
            console.error('Error deleting category:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar categoría';
            setError(errorMessage);
        }
    };

    // Open edit modal with current category data
    const openEditModal = (category) => {
        setEditCategory({
            id_categoria: category.id_categoria,
            nombre_categoria: category.nombre_categoria,
        });
        setIsEditModalOpen(true);
        setError('');
    };

    // Open delete confirmation modal
    const openDeleteModal = (id) => {
        setDeleteCategoryId(id);
        setIsDeleteModalOpen(true);
        setError('');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Categorías</h1>
            <p className="text-gray-600 mb-6">Gestión de categorías en el inventario.</p>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Create Category Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Agregar Categoría
                </button>
            </div>

            {/* Categories Table */}
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
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <tr key={category.id_categoria}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.id_categoria}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.nombre_categoria}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(category)}
                                            className="text-yellow-600 hover:text-yellow-800 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(category.id_categoria)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay categorías disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Category Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Crear Categoría</h2>
                        <input
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewCategory('');
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Categoría</h2>
                        <input
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={editCategory.nombre_categoria}
                            onChange={(e) =>
                                setEditCategory({ ...editCategory, nombre_categoria: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditCategory({ id_categoria: null, nombre_categoria: '' });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditCategory}
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
                        <p className="mb-4">¿Estás seguro de que deseas eliminar esta categoría?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteCategoryId(null);
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteCategory}
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