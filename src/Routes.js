// App.js

import React from 'react';
import { HashRouter as Router, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './authContext';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Dashboard from './components/Dashboard';
import CadastroProduto from './components/CadastroProduto';
import GestaoEstoque from './components/GestaoEstoque';
import PaginaVenda from './components/PaginaVenda';
import Header from './components/Header';
import './App.css';

const PrivateRoute = ({ element, ...rest }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return user ? element : <Navigate to="/" />;
};

function RoutesApp() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <div className="content-container">
              <Route path="/" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <PrivateRoute path="/dashboard" element={<Dashboard />} />
              <PrivateRoute path="/cadastro-produto" element={<CadastroProduto />} />
              <PrivateRoute path="/gestao-estoque" element={<GestaoEstoque />} />
              <PrivateRoute path="/pagina-venda" element={<PaginaVenda />} />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default RoutesApp;
