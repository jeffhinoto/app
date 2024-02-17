import React, {useState, useEffect, useCallback} from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
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
    try {
      const categoriasCollection = collection(firestore, 'categorias');
      getDocs(categoriasCollection).then(categoriasSnapshot => {
        const categoriasData = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategorias(categoriasData);
      })
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, [carrinho]);

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
    if (carrinho[produto.id]) {
      increaseQuantity(produto.id);
    } else {
      const novoCarrinho = {...carrinho};
      novoCarrinho[produto.id] = { ...produto, comprando: 1 };
      setCarrinho(novoCarrinho);
    }
  };

  const removeFromCart = (produtoId) => {
    const updatedCarrinho = {...carrinho};
    delete updatedCarrinho[produtoId];
    setCarrinho(updatedCarrinho)
  };

  const increaseQuantity = (produtoId) => {
    const novoCarrinho = {...carrinho};
    if(novoCarrinho[produtoId] && novoCarrinho[produtoId].quantidade > novoCarrinho[produtoId].comprando){
      novoCarrinho[produtoId].comprando += 1;
      setCarrinho(novoCarrinho)
    }
  };

  const decreaseQuantity = (produtoId) => {
    const updatedCarrinho = {...carrinho};
    if (updatedCarrinho[produtoId].comprando > 1) {
      updatedCarrinho[produtoId].comprando -= 1;
    }
    setCarrinho(updatedCarrinho)
  };

  const handleConfirmarVenda = async () => {
    try {
      for (const item of Object.values(carrinho)) {
        const produtoRef = doc(firestore, 'produtos', item.id);
        const document = await getDoc(produtoRef)
        const data = await document.data()
        await updateDoc(produtoRef, { quantidade: data.quantidade - item.comprando });
      }
      console.log('Venda confirmada!');
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
    }
  };

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
                  <span>{item.nome}</span>
                  <button className='remover' onClick={() => removeFromCart(item.id)}>X</button>
                  <button className='diminuir' onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span className="quantidade">{item.comprando}</span>
                  <button className='aumentar' onClick={() => increaseQuantity(item.id)}>+</button>
                </li>
            ))}
          </ul>
          <p>Total: R$ {Object.values(carrinho).reduce((total, item) => total + (item.preco * item.comprando), 0).toFixed(2)}</p>
          <button onClick={() => setModalAberto(true)}>Efetuar Venda</button>
        </div>
        {modalAberto && (
            <div className="modal">
              <div className="modal-content">
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
                {metodoPagamento && (
                    <div className="form-group">
                      <label htmlFor="valorPago">Valor Pago:</label>
                      <input type="number" id="valorPago" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
                    </div>
                )}
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
