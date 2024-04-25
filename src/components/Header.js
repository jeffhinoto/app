import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { FaShop } from "react-icons/fa6";
import avatarImg from '../assets/logo.webp';
import './header.css';
import { auth } from '../firebase'; // Importe o módulo de autenticação do Firebase
import { RiLogoutBoxRFill } from "react-icons/ri";



const Header = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUsuarioLogado(true);
      } else {
        setUsuarioLogado(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const desconectarUsuario = () => {
    auth.signOut();
    <Navigate to="/"/>
  };

  return (
    usuarioLogado && (
      <div className="sidebar">
        <div>
          <img src={avatarImg} alt="Foto do usuário" />
        </div>

        <Link className='Vendas' to="/pagina-venda">
          <FaShop color="#FFF" size={24} />
          <span>Vendas</span>
        </Link>

        <Link className='Estoque' to="/gestao-estoque">
          <FiSettings color="#FFF" size={24} />
         <span>Estoque</span>
        </Link>
      <div className='logoff'>
        <Link onClick={desconectarUsuario}>
        <RiLogoutBoxRFill color="#FFF" size={24} />
        <span>Sair</span>
          </Link>
          </div>
      </div>
    )
  );
};

export default Header;
