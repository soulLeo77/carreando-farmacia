import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

export default function RegistroVentas() {
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditDetailModalOpen, setIsEditDetailModalOpen] = useState(false);
    const [isDeleteDetailModalOpen, setIsDeleteDetailModalOpen] = useState(false);
    const [newVenta, setNewVenta] = useState({
        fecha_venta: dayjs().format('YYYY-MM-DD'),
        detalles: [],
    });
    const [newDetalle, setNewDetalle] = useState({
        id_producto: '',
        cantidad: 1,
    });
    const [editVenta, setEditVenta] = useState({
        id_venta: null,
        fecha_venta: '',
    });
    const [editDetail, setEditDetail] = useState({
        id_det_venta: null,
        id_producto: '',
        cantidad: 1,
    });
    const [currentDetails, setCurrentDetails] = useState([]);
    const [deleteDetailId, setDeleteDetailId] = useState(null);
    const [error, setError] = useState('');

    // Fetch ventas y productos on mount
    useEffect(() => {
        fetchVentas();
        fetchProductos();
    }, []);

    const fetchVentas = async () => {
        try {
            const response = await axios.get('http://localhost:3000/ventas');
            // Agrupar detalles por id_venta
            const groupedVentas = response.data.reduce((acc, row) => {
                const ventaId = row.id_venta;
                if (!acc[ventaId]) {
                    acc[ventaId] = {
                        id_venta: ventaId,
                        fecha_venta: row.fecha_venta,
                        detalles: [],
                    };
                }
                acc[ventaId].detalles.push({
                    id_det_venta: row.id_det_venta,
                    id_producto: row.id_producto,
                    nombre_producto: row.nombre_producto,
                    cantidad: row.cantidad,
                    valor_venta: row.valor_venta,
                });
                return acc;
            }, {});
            setVentas(Object.values(groupedVentas));
        } catch (error) {
            console.error('Error fetching ventas:', error);
            setError('Error al obtener ventas. Intente de nuevo.');
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/productos');
            setProductos(response.data.filter(p => p.activo));
        } catch (error) {
            console.error('Error fetching productos:', error);
            setError('Error al obtener productos. Intente de nuevo.');
        }
    };

    // Handle add detalle in create modal
    const handleAddDetalle = () => {
        if (!newDetalle.id_producto) {
            setError('Seleccione un producto.');
            return;
        }
        if (newDetalle.cantidad < 1) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }
        const producto = productos.find(p => p.id_producto === parseInt(newDetalle.id_producto));
        if (producto && producto.stock < newDetalle.cantidad) {
            setError(`Stock insuficiente para ${producto.nombre_producto}.`);
            return;
        }

        setNewVenta({
            ...newVenta,
            detalles: [
                ...newVenta.detalles,
                { id_producto: parseInt(newDetalle.id_producto), cantidad: parseInt(newDetalle.cantidad) },
            ],
        });
        setNewDetalle({ id_producto: '', cantidad: 1 });
        setError('');
    };

    // Handle create venta
    const handleCreateVenta = async () => {
        if (!newVenta.fecha_venta) {
            setError('La fecha de venta es obligatoria.');
            return;
        }
        if (newVenta.detalles.length === 0) {
            setError('Debe agregar al menos un detalle.');
            return;
        }

        try {
            // Crear venta
            const ventaResponse = await axios.post('http://localhost:3000/ventas', {
                fecha_venta: newVenta.fecha_venta,
            });
            const id_venta = ventaResponse.data.id_venta;

            // Crear detalles
            for (const detalle of newVenta.detalles) {
                await axios.post('http://localhost:3000/venta_detalle', {
                    id_venta,
                    id_producto: detalle.id_producto,
                    cantidad: detalle.cantidad,
                });
            }

            setNewVenta({ fecha_venta: dayjs().format('YYYY-MM-DD'), detalles: [] });
            setIsCreateModalOpen(false);
            fetchVentas();
            setError('');
        } catch (error) {
            console.error('Error creating venta:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al crear la venta';
            setError(errorMessage);
        }
    };

    // Handle edit venta
    const handleEditVenta = async () => {
        if (!editVenta.fecha_venta) {
            setError('La fecha de venta es obligatoria.');
            return;
        }

        try {
            await axios.patch(`http://localhost:3000/ventas/${editVenta.id_venta}`, {
                fecha_venta: editVenta.fecha_venta,
            });
            setIsEditModalOpen(false);
            fetchVentas();
            setError('');
        } catch (error) {
            console.error('Error updating venta:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al actualizar la venta';
            setError(errorMessage);
        }
    };

    // Handle edit detail
    const handleEditDetail = async () => {
        if (editDetail.cantidad < 1) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }

        try {
            await axios.patch(`http://localhost:3000/venta_detalle/${editDetail.id_det_venta}`, {
                cantidad: parseInt(editDetail.cantidad),
            });
            setIsEditDetailModalOpen(false);
            fetchVentas();
            setCurrentDetails(currentDetails.map(detalle =>
                detalle.id_det_venta === editDetail.id_det_venta
                    ? { ...detalle, cantidad: parseInt(editDetail.cantidad) }
                    : detalle
            ));
            setError('');
        } catch (error) {
            console.error('Error updating detail:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Error al actualizar el detalle';
            setError(errorMessage);
        }
    };

    // Handle delete detail
    const handleDeleteDetail = async () => {
        try {
            await axios.delete(`http://localhost:3000/venta_detalle/${deleteDetailId}`);
            setIsDeleteDetailModalOpen(false);
            // Actualizar currentDetails para reflejar la eliminación
            setCurrentDetails(currentDetails.filter(detalle => detalle.id_det_venta !== deleteDetailId));
            // Actualizar ventas para mantener consistencia
            fetchVentas();
            setError('');
        } catch (error) {
            console.error('Error deleting detail:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar el detalle';
            setError(errorMessage);
        }
    };

    // Open detail modal
    const openDetailModal = (venta) => {
        setCurrentDetails(venta.detalles);
        setIsDetailModalOpen(true);
        setError('');
    };

    // Open edit venta modal
    const openEditVentaModal = (venta) => {
        setEditVenta({
            id_venta: venta.id_venta,
            fecha_venta: dayjs(venta.fecha_venta).format('YYYY-MM-DD'),
        });
        setIsEditModalOpen(true);
        setError('');
    };

    // Open edit detail modal
    const openEditDetailModal = (detalle) => {
        setEditDetail({
            id_det_venta: detalle.id_det_venta,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
        });
        setIsEditDetailModalOpen(true);
        setError('');
    };

    // Open delete detail modal
    const openDeleteDetailModal = (id) => {
        setDeleteDetailId(id);
        setIsDeleteDetailModalOpen(true);
        setError('');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Registro de Ventas</h1>
            <p className="text-gray-600 mb-6">Gestión de ventas en el inventario.</p>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Create Venta Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Agregar Venta
                </button>
            </div>

            {/* Ventas Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Detalle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {ventas.length > 0 ? (
                            ventas.map((venta) => (
                                <tr key={venta.id_venta}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {venta.id_venta}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {dayjs(venta.fecha_venta).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openDetailModal(venta)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Detalle
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openEditVentaModal(venta)}
                                            className="text-yellow-600 hover:text-yellow-800"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay ventas disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Venta Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Crear Venta</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Fecha de Venta</label>
                            <input
                                type="date"
                                value={newVenta.fecha_venta}
                                onChange={(e) => setNewVenta({ ...newVenta, fecha_venta: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Detalles</h3>
                            <div className="flex space-x-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Producto</label>
                                    <select
                                        value={newDetalle.id_producto}
                                        onChange={(e) => setNewDetalle({ ...newDetalle, id_producto: e.target.value })}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Seleccione un producto</option>
                                        {productos.map((producto) => (
                                            <option key={producto.id_producto} value={producto.id_producto}>
                                                {producto.nombre_producto} (Stock: {producto.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newDetalle.cantidad}
                                        onChange={(e) => setNewDetalle({ ...newDetalle, cantidad: e.target.value })}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddDetalle}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                    >
                                        Agregar Detalle
                                    </button>
                                </div>
                            </div>
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Producto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Cantidad
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {newVenta.detalles.length > 0 ? (
                                        newVenta.detalles.map((detalle, index) => {
                                            const producto = productos.find(p => p.id_producto === detalle.id_producto);
                                            return (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {producto ? producto.nombre_producto : 'Desconocido'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {detalle.cantidad}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No hay detalles agregados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewVenta({ fecha_venta: dayjs().format('YYYY-MM-DD'), detalles: [] });
                                    setNewDetalle({ id_producto: '', cantidad: 1 });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateVenta}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Venta Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Venta</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Fecha de Venta</label>
                            <input
                                type="date"
                                value={editVenta.fecha_venta}
                                onChange={(e) => setEditVenta({ ...editVenta, fecha_venta: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditVenta({ id_venta: null, fecha_venta: '' });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditVenta}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Detalles de la Venta</h2>
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        ID Detalle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Cantidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentDetails.length > 0 ? (
                                    currentDetails.map((detalle) => (
                                        <tr key={detalle.id_det_venta}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {detalle.id_det_venta}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {detalle.nombre_producto}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {detalle.cantidad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${parseFloat(detalle.valor_venta).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openEditDetailModal(detalle)}
                                                    className="text-yellow-600 hover:text-yellow-800 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDetailModal(detalle.id_det_venta)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay detalles disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    setCurrentDetails([]);
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Detail Modal */}
            {isEditDetailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Detalle</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                value={editDetail.cantidad}
                                onChange={(e) => setEditDetail({ ...editDetail, cantidad: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsEditDetailModalOpen(false);
                                    setEditDetail({ id_det_venta: null, id_producto: '', cantidad: 1 });
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditDetail}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Detail Confirmation Modal */}
            {isDeleteDetailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                        <p className="mb-4">¿Estás seguro de que deseas eliminar este detalle?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setIsDeleteDetailModalOpen(false);
                                    setDeleteDetailId(null);
                                    setError('');
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteDetail}
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