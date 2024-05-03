import { useState } from "react";
import { auth, firestore } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Cadastro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
      });

      console.log("User signed up successfully!");

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
        <br/>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="button" onClick={handleSignUp}>Cadastrar</button>
        {error && <p>{error}</p>}
        <center>
          <p>
            {" "}
            Já tem uma conta? Faça login
            <br />
            <b>
              <u>
                <Link to="/">Clique Aqui</Link>
              </u>
            </b>
          </p>
        </center>
      </div>
    </div>
  );
};

export default Cadastro;
