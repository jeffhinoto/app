import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import './PaginaVenda.css';

const PaginaVenda = () => {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [carrinho, setCarrinho] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [valorPago, setValorPago] = useState(0);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const categoriasCollection = collection(firestore, 'categorias');
      const categoriasSnapshot = await getDocs(categoriasCollection);
      const categoriasData = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchProdutosByCategoria = async (categoriaId) => {
    try {
      const produtosCollection = collection(firestore, 'produtos');
      const produtosSnapshot = await getDocs(produtosCollection);
      const produtosData = produtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const produtosFiltrados = produtosData.filter(produto => produto.categoria === categoriaId && produto.ativo && produto.quantidade > 0);
      setProdutos(produtosFiltrados);
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
    }
  };

  const handleCategoriaClick = (categoriaId) => {
    setCategoriaSelecionada(categoriaId);
    fetchProdutosByCategoria(categoriaId);
  };

  const addToCart = (produto) => {
    setCarrinho(prevCarrinho => {
      const updatedCarrinho = { ...prevCarrinho };
      if (updatedCarrinho[produto.id]) {
        updatedCarrinho[produto.id].quantidade += 1;
      } else {
        updatedCarrinho[produto.id] = { ...produto, quantidade: 1 };
      }
      return updatedCarrinho;
    });
  };

  const removeFromCart = (produtoId) => {
    setCarrinho(prevCarrinho => {
      const updatedCarrinho = { ...prevCarrinho };
      delete updatedCarrinho[produtoId];
      return updatedCarrinho;
    });
  };

  const increaseQuantity = (produtoId) => {
    setCarrinho(prevCarrinho => {
      const updatedCarrinho = { ...prevCarrinho };
      updatedCarrinho[produtoId].quantidade += 1;
      return updatedCarrinho;
    });
  };

  const decreaseQuantity = (produtoId) => {
    setCarrinho(prevCarrinho => {
      const updatedCarrinho = { ...prevCarrinho };
      if (updatedCarrinho[produtoId].quantidade > 1) {
        updatedCarrinho[produtoId].quantidade -= 1;
      }
      return updatedCarrinho;
    });
  };

  const handleConfirmarVenda = async () => {
    try {
      const batch = firestore.batch();
      Object.entries(carrinho).forEach(([produtoId, item]) => {
        const produtoRef = doc(firestore, 'produtos', produtoId);
        batch.update(produtoRef, { quantidade: firestore.FieldValue.increment(-item.quantidade) });
        console.log("testando log"+batch.update)
      });
      await batch.commit();
      console.log('Venda confirmada!');
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
    }
  };

  const handleModalClose = () => {
    setModalAberto(false);
  };

  useEffect(() => {
    const total = Object.values(carrinho).reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    setValorPago(total);
  }, [carrinho]);

  return (
    <div className="pagina-venda">
      <h2>Escolha uma categoria para ver os produtos disponíveis:</h2>
      <div className="categorias">
        {categorias.map(categoria => (
          <div key={categoria.id} className={`categoria-card ${categoria.id === categoriaSelecionada ? 'selected' : ''}`} onClick={() => handleCategoriaClick(categoria.id)}>
            <h3>{categoria.nome}</h3>
          </div>
        ))}
      </div>
      <div className="produtos">
        {produtos.map(produto => (
          <div key={produto.id} className="produto-card" onClick={() => addToCart(produto)}>
            <h3>{produto.nome}</h3>
            <p>Preço: <strong>R$ {produto.preco}</strong></p>
          </div>
        ))}
      </div>
      <div className="carrinho">
        <h3>Carrinho</h3>
        <ul>
          {Object.values(carrinho).map(item => (
            <li key={item.id}>
              <span className='txt'>{item.nome}</span>
              <button className='remover' onClick={() => removeFromCart(item.id)}>X</button>
              <button className='diminuir' onClick={() => decreaseQuantity(item.id)}>-</button>
              <span className="quantidade">{item.quantidade}</span>
              <button className='aumentar' onClick={() => increaseQuantity(item.id)}>+</button>
            </li>
          ))}
        </ul>
        <p>Total: R$ {Object.values(carrinho).reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}</p>
        <button onClick={() => setModalAberto(true)}>Efetuar Venda</button>
      </div>
      {modalAberto && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal" onClick={handleModalClose}>X</button>
            <h2>Confirmação de Venda</h2>
            <div className="form-group">
              <label htmlFor="metodoPagamento">Método de Pagamento:</label>
              <select id="metodoPagamento" value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="debito">Cartão de Débito</option>
                <option value="credito">Cartão de Crédito</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="valorPago">Valor Pago:</label>
              <input type="number" id="valorPago" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
            </div>
            <div className="form-group">
              <button onClick={handleConfirmarVenda} disabled={!metodoPagamento}>Confirmar Venda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaVenda;
