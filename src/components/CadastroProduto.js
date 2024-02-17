import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

const CadastroProduto = () => {
  const [nome, setNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasCollection = collection(firestore, 'categorias');
        const categoriasSnapshot = await getDocs(categoriasCollection);
        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nome);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleCadastroProduto = async (e) => {
    e.preventDefault();

    try {
      if (novaCategoria) {
        // Adiciona nova categoria ao banco de dados
        const categoriaDocRef = doc(collection(firestore, 'categorias'));
        await setDoc(categoriaDocRef, { nome: novaCategoria });

        // Atualiza lista de categorias no estado
        setCategorias([...categorias, novaCategoria]);
      }

      // Adicionar produto ao Firestore
      await addDoc(collection(firestore, 'produtos'), {
        nome: nome,
        categoria: categoriaSelecionada || novaCategoria
      });

      // Limpar campos do formulário após o sucesso
      setNome('');
      setCategoriaSelecionada('');
      setNovaCategoria('');

      alert('Produto cadastrado com sucesso!');
    } catch (error) {
      setError('Erro ao cadastrar produto: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Cadastro de Produto</h2>
      <form onSubmit={handleCadastroProduto}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="nome" style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Nome do Produto</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite o nome do produto" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="categoria" style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Categoria</label>
          <select id="categoria" value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="">Selecione uma categoria existente</option>
            {categorias.map((categoria, index) => (
              <option key={index} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="novaCategoria" style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Nova Categoria</label>
          <input type="text" id="novaCategoria" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} placeholder="Digite uma nova categoria" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>Cadastrar Produto</button>
      </form>
      {error && <p style={{ marginTop: '20px', color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

export default CadastroProduto;
