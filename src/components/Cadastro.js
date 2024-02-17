import { useState } from 'react';
import { auth, firestore } from '../firebase'; // Importe auth e firestore corretamente
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importe a função createUserWithEmailAndPassword
import { setDoc, doc } from 'firebase/firestore'; // Importe as funções setDoc e doc

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      // Criação do usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Escrita no banco de dados
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email
      });

      console.log("User signed up successfully!");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Cadastro;
