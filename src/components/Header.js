import React from 'react';
import { Link } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { MdSpaceDashboard } from "react-icons/md";

import { FaShop } from "react-icons/fa6";
import avatarImg from '../assets/logo.png';
import './header.css';

const Header = () => {

  return (
    <div className="sidebar">
      <div>
        <img src={avatarImg} alt="Foto do usuário" />
      </div>

      <Link to="/dashboard">
      <MdSpaceDashboard color="#FFF" size={24} />
        Dashboard
      </Link>

      <Link to="/pagina-venda">
      <FaShop color="#FFF" size={24} />
        Vendas
      </Link>

      <Link to="/gestao-estoque">
        <FiSettings color="#FFF" size={24} />
        Controle de Estoque
      </Link>
    </div>
  );
};

export default Header;
