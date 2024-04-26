import { useState } from "react";
import { auth, firestore } from "../firebase"; // Importe auth e firestore corretamente
import { createUserWithEmailAndPassword } from "firebase/auth"; // Importe a função createUserWithEmailAndPassword
import { setDoc, doc } from "firebase/firestore"; // Importe as funções setDoc e doc
import { useNavigate, Link } from "react-router-dom";

const Cadastro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSignUp = async () => {


    try {
      // Criação do usuário
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Escrita no banco de dados
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
      });

      console.log("User signed up successfully!");

      // Redirecionar para a home page
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message);
    }
  };
  return (
    <div className="container-center">
      <div className="login">
          <h2>Cadastro</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleSignUp}>Cadastrar</button>
          {error && <p>{error}</p>}
          <center><p> Já tem uma conta? Faça login<br/><b><u><Link to="/">Clique Aqui</Link></u></b></p></center>
        </div>
        </div>
  );
};

export default Cadastro;
