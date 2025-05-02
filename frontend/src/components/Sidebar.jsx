import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaBox, FaClipboardList, FaBoxes, FaAddressCard } from 'react-icons/fa';
import { GoCopilot } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

function Sidebar({ setSelectedOption }) {
  const [activeOption, setActiveOption] = useState('');
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setActiveOption(option);
  };

  return (
    <div className="fixed top-0 left-0 h-full bg-white shadow-lg w-64">
      <h2 className="text-2xl font-bold p-4 bg-red-700 text-white">Menú</h2>
      <div className="flex flex-col items-center py-4">
        <FaAddressCard className="w-20 h-20 text-gray-500" />
        <p className="mt-2 text-lg font-semibold">
          BIENVENIDO
        </p>
      </div>
      <ul className="space-y-2">
        <li
          className={`px-4 py-2 cursor-pointer border flex items-center gap-2 ${activeOption === 'productos' ? 'bg-red-800 text-white' : 'hover:bg-red-800'
            }`}
          onClick={() => handleOptionClick('productos')}
        >
          <FaBox /> Productos
        </li>
        <li
          className={`px-4 py-2 cursor-pointer border flex items-center gap-2 ${activeOption === 'categorias' ? 'bg-red-800 text-white' : 'hover:bg-red-800'
            }`}
          onClick={() => handleOptionClick('categorias')}
        >
          <FaBoxes /> Categorias
        </li>
        <li
          className={`px-4 py-2 cursor-pointer border flex items-center gap-2 ${activeOption === 'registroventas' ? 'bg-red-800 text-white' : 'hover:bg-red-800'
            }`}
          onClick={() => handleOptionClick('registroventas')}
        >
          <FaClipboardList /> Registro de ventas
        </li>
      </ul>

      <div className="absolute bottom-1 left-0 w-full text-center text-gray-500 text-lg">
        Desarrollado por soulLeo <br />
        Todos los derechos reservados &copy; 2025
      </div>
    </div>
  );
}

export default Sidebar;