import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './GestaoEstoque.css';

const GestaoEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaTermo, setBuscaTermo] = useState('');
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');
  const [dataValidadeProduto, setDataValidadeProduto] = useState('');
  const [ativoProduto, setAtivoProduto] = useState(true);

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      const produtosCollection = collection(firestore, 'produtos');
      const produtosSnapshot = await getDocs(produtosCollection);
      const produtosData = produtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosData);
    } catch (error) {
      setError('Erro ao buscar produtos: ' + error.message);
    }
  };

  const fetchCategorias = async () => {
    try {
      const categoriasCollection = collection(firestore, 'categorias');
      const categoriasSnapshot = await getDocs(categoriasCollection);
      const categoriasData = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategorias(categoriasData);
    } catch (error) {
      setError('Erro ao buscar categorias: ' + error.message);
    }
  };

  const handleUpdateProduto = async (id, novosDados) => {
    try {
      const produtoRef = doc(firestore, 'produtos', id);
      await updateDoc(produtoRef, novosDados);
      toast.success('Produto atualizado com sucesso!');
      setModalOpen(false);
      setProdutoSelecionado(null);
      fetchProdutos();
    } catch (error) {
      setError('Erro ao atualizar produto: ' + error.message);
    }
  };

  const handleDeleteProduto = async () => {
    try {
      const produtoRef = doc(firestore, 'produtos', produtoSelecionado.id);
      await deleteDoc(produtoRef);
      toast.success('Produto excluído com sucesso!');
      setConfirmacaoExclusao(false);
      setModalOpen(false);
      setProdutoSelecionado(null);
      fetchProdutos();
    } catch (error) {
      setError('Erro ao excluir produto: ' + error.message);
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    if (filtroCategoria === '' || produto.categoria === filtroCategoria) {
      return true;
    }
    return false;
  }).filter(produto => {
    if (buscaTermo === '') {
      return true;
    }
    return produto.nome.toLowerCase().includes(buscaTermo.toLowerCase());
  });

  const handleSalvarEdicao = () => {
    handleUpdateProduto(produtoSelecionado.id, produtoSelecionado);
  };

  const abrirConfirmacaoExclusao = (produto) => {
    setProdutoSelecionado(produto);
    setConfirmacaoExclusao(true);
  };

  const fecharModais = () => {
    setModalOpen(false);
    setModalCadastroOpen(false);
    setConfirmacaoExclusao(false);
  };

  const handleCadastrarProduto = async () => {
    try {
      let categoriaId = categoriaSelecionada;
      if (categoriaSelecionada === 'nova') {
        const novaCategoriaRef = await addDoc(collection(firestore, 'categorias'), { nome: novaCategoria });
        categoriaId = novaCategoriaRef.id;
      }

      const novoProduto = {
        nome: nomeProduto,
        preco: parseFloat(precoProduto),
        quantidade: parseInt(quantidadeProduto),
        dataValidade: dataValidadeProduto,
        ativo: ativoProduto,
        categoria: categoriaId,
      };

      await addDoc(collection(firestore, 'produtos'), novoProduto);

      toast.success('Produto cadastrado com sucesso!');

      setModalCadastroOpen(false);

      fetchProdutos();
    } catch (error) {
      setError('Erro ao cadastrar produto: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="filter-container">
        <div className='busca'>
          <input type="text" value={buscaTermo} onChange={(e) => setBuscaTermo(e.target.value)} placeholder="Buscar produto..." />
        </div>
      </div>
      <div className='categoria'>
        <span>Filtrar por Categoria:  </span>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria.id}>{categoria.nome}</option>
          ))}
        </select>
      </div>
      <div className="product-container">
        {produtosFiltrados.map(produto => (
          <div key={produto.id} className="product-card">
            <h3>{produto.nome}</h3>
            <p>Preço: <strong>R$ {produto.preco.toFixed(2)}</strong></p>
            <p>Quantidade: <strong>{produto.quantidade}</strong></p>
            <p>Data de Validade: <strong>{produto.dataValidade}</strong></p>
            <p>Status: <strong>{produto.ativo ? 'Ativo' : 'Não Ativo'}</strong></p>
            <button onClick={() => {
              setProdutoSelecionado(produto);
              setModalOpen(true);
            }}>Editar</button>
            
          </div>
        ))}
      </div>
      {error && <p className="error-message">{error}</p>}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Produto</h2>
            <div className="form-group">
              <label>Nome:</label>
              <input type="text" value={produtoSelecionado.nome} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, nome: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Preço:</label>
              <input type="number" value={produtoSelecionado.preco} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, preco: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Quantidade:</label>
              <input type="number" value={produtoSelecionado.quantidade} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, quantidade: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Data de Validade:</label>
              <input type="date" value={produtoSelecionado.dataValidade} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, dataValidade: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select value={produtoSelecionado.ativo.toString()} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, ativo: e.target.value === 'true' })}>
                <option value="true">Ativo</option>
                <option value="false">Não Ativo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Categoria:</label>
              <select value={produtoSelecionado.categoria} onChange={(e) => setProdutoSelecionado({ ...produtoSelecionado, categoria: e.target.value })}>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={handleSalvarEdicao}>Salvar</button>
              <button className='nao' onClick={() => abrirConfirmacaoExclusao(produtoSelecionado)}>Excluir</button>
              <div className='x' onClick={fecharModais}>x</div>
            </div>
          </div>
        </div>
      )}
      {confirmacaoExclusao && (
        <div className="modal">
          <div className="modal-content confirm-delete-modal">
            <h2>Deseja realmente excluir o produto "{produtoSelecionado.nome}"?</h2>
            <div>
              <button className='sim' onClick={handleDeleteProduto}>Sim</button>
              <button className='nao' onClick={fecharModais}>Não</button>
            </div>
          </div>
        </div>
      )}
      <button className="new-product-button" onClick={() => setModalCadastroOpen(true)}>Novo Produto</button>
      {modalCadastroOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cadastrar Novo Produto</h2>
            <div className="form-group">
              <label>Nome:</label>
              <input type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Preço:</label>
              <input type="number" value={precoProduto} onChange={(e) => setPrecoProduto(parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Quantidade:</label>
              <input type="number" value={quantidadeProduto} onChange={(e) => setQuantidadeProduto(parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Validade:</label>
              <input type="date" value={dataValidadeProduto} onChange={(e) => setDataValidadeProduto(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Categoria:</label>
              <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                <option value="">Selecione uma categoria...</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria.id}>{categoria.nome}</option>
                ))}
                <option value="nova">Nova Categoria</option>
              </select>
              {categoriaSelecionada === 'nova' && (
                <input type="text" placeholder="Nova categoria..." value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} />
              )}
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select value={ativoProduto.toString()} onChange={(e) => setAtivoProduto(e.target.value === 'true')}>
                <option value="true">Ativo</option>
                <option value="false">Não Ativo</option>
              </select>
            </div>
            <div>
              <button onClick={handleCadastrarProduto}>Cadastrar</button>
              <button onClick={() => setModalCadastroOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer className="toast-container" autoClose={3000} />
    </div>
  );
};

export default GestaoEstoque;
