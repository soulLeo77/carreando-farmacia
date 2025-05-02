import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Productos from './Productos';
import Categorias from './Categorias';
import RegistroVentas from './RegistroVentas';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('productos');

  const renderContent = () => {
    switch (selectedOption) {
      case 'productos':
        return <Productos />
      case 'categorias':
        return <Categorias />
      case 'registroventas':
        return <RegistroVentas />
      default:
        return <Productos />;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar setSelectedOption={setSelectedOption} />
      <div className="flex-grow bg-gray-100 p-4 ml-64">
        {renderContent()}
      </div>
    </div>
  );
}