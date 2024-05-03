import { useState, useEffect } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; 
import './Login.css'; 
import { Link } from 'react-router-dom'; 
import avatarImg from '../assets/logo.webp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      console.error("Error logging in:", error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="container-center">
        <div className="login">
          <h2>Você já está logado</h2>
          <p>Clique <Link to="/gestao-estoque">aqui</Link> para acessar a página de gestão de estoque.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-center">
      {!isLoggedIn && (
        <div className="login">
          <img src={avatarImg} width="100px" height="100px" alt='logo'/>
          <h2>Login</h2>
          <br/>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button className='button' onClick={handleLogin}>Login</button>
          {error && <p>{error}</p>}
          <center><p>Não tem uma conta? <br/><b><u><Link to="/cadastro">Cadastre-se</Link></u></b></p></center>
        </div>
      )}
    </div>
  );
};

export default Login;
