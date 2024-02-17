import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Importe auth do Firebase
import { Link, Navigate } from 'react-router-dom'; // Importe Link e Navigate do React Router

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Adicione um estado para controlar o login

  const handleLogin = async () => {
    try {
      // Autenticação do usuário
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true); // Define isLoggedIn como true após o login
      console.log("User logged in successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  // Se o usuário estiver logado, redirecione para a página inicial
  if (isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <p>Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </div>
  );
};

export default Login;
