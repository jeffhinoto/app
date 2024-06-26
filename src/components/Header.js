import React, { useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { FaShop } from "react-icons/fa6";
import avatarImg from "../assets/logo.webp";
import profileImg from "../assets/imgprofile.png";
import "./header.css";
import { auth } from "../firebase";
import { RiLogoutBoxRFill } from "react-icons/ri";

const Header = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
    <Navigate to="/" />;
  };
  const isWideScreen = window.innerWidth >= 700;
  return (
    usuarioLogado && (
      <div className="sidebar">
        <div>
          <img src={avatarImg} alt="Foto do usuário" />
        </div>

        <Link
          className={
            location.pathname === "/pagina-venda" ? "Vendas active" : "Vendas"
          }
          to="/pagina-venda"
        >
          <FaShop color="#FFF" size={24} />
          <span>Vendas</span>
        </Link>

        <Link
          className={
            location.pathname === "/gestao-estoque"
              ? "Estoque active"
              : "Estoque"
          }
          to="/gestao-estoque"
        >
          <FiSettings color="#FFF" size={24} />
          <span>Estoque</span>
        </Link>
        <Link
          className={isWideScreen ? "exit" : ""}
          onClick={desconectarUsuario}
        >
          <RiLogoutBoxRFill color="#FFF" size={24} />
          <span>Sair</span>
        </Link>
        <div className="sidebar user">
          <div className="user-profile">
            {auth.currentUser.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="user" />
            ) : (
              <img src={profileImg} alt="user" />
            )}
            <div className="user-email">{auth.currentUser.email}</div>
          </div>
        </div>
      </div>
    )
  );
};

export default Header;
