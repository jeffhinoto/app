// App.js

import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './authContext';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import CadastroProduto from './components/CadastroProduto';
import GestaoEstoque from './components/GestaoEstoque';
import PaginaVenda from './components/PaginaVenda';
import Header from './components/Header';
import './App.css';

function PrivateRoute({ element, ...rest }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return user ? element : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/cadastro-produto" element={<PrivateRoute element={<CadastroProduto />} />} />
              <Route path="/gestao-estoque" element={<PrivateRoute element={<GestaoEstoque />} />} />
              <Route path="/pagina-venda" element={<PrivateRoute element={<PaginaVenda />} />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
