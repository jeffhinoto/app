import React, { useState, useEffect } from "react";
import { firestore } from "../firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import "./PaginaVenda.css";
import { MdShoppingCartCheckout } from "react-icons/md";

const PaginaVenda = () => {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [carrinho, setCarrinho] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [valorPago, setValorPago] = useState(valorTotal);
  const [carrinhoMinimizado, setCarrinhoMinimizado] = useState(true);

  useEffect(() => {
    try {
      const categoriasCollection = collection(firestore, "categorias");
      getDocs(categoriasCollection).then((categoriasSnapshot) => {
        const categoriasData = categoriasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategorias(categoriasData);
      });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }, [carrinho]);

  const fetchProdutosByCategoria = async (categoriaId) => {
    try {
      const produtosCollection = collection(firestore, "produtos");
      const produtosSnapshot = await getDocs(produtosCollection);
      const produtosData = produtosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const produtosFiltrados = produtosData.filter(
        (produto) =>
          produto.categoria === categoriaId &&
          produto.ativo &&
          produto.quantidade > 0
      );
      setProdutos(produtosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar produtos por categoria:", error);
    }
  };
  const fechaModal = () =>{
  setModalAberto(false);
}
  const handleCategoriaClick = (categoriaId) => {
    setCategoriaSelecionada(categoriaId);
    fetchProdutosByCategoria(categoriaId);
  };

  const updateValorTotal = (carrinho) => {
    const atualizar = Object.values(carrinho)
      .reduce((total, item) => total + item.preco * item.comprando, 0)
      .toFixed(2);
    setValorTotal(atualizar);
    setValorPago(atualizar);
  };

  const addToCart = (produto) => {
    if (carrinho[produto.id]) {
      increaseQuantity(produto.id);
    } else {
      const novoCarrinho = { ...carrinho };
      novoCarrinho[produto.id] = { ...produto, comprando: 1 };
      setCarrinho(novoCarrinho);
      updateValorTotal(novoCarrinho);
    }
  };

  const removeFromCart = (produtoId) => {
    const updatedCarrinho = { ...carrinho };
    delete updatedCarrinho[produtoId];
    setCarrinho(updatedCarrinho);
    updateValorTotal(updatedCarrinho);
  };

  const increaseQuantity = (produtoId) => {
    const novoCarrinho = { ...carrinho };
    if (
      novoCarrinho[produtoId] &&
      novoCarrinho[produtoId].quantidade > novoCarrinho[produtoId].comprando
    ) {
      novoCarrinho[produtoId].comprando += 1;
      setCarrinho(novoCarrinho);
    }
    updateValorTotal(novoCarrinho);
  };

  const decreaseQuantity = (produtoId) => {
    const updatedCarrinho = { ...carrinho };
    if (updatedCarrinho[produtoId].comprando > 1) {
      updatedCarrinho[produtoId].comprando -= 1;
    }
    setCarrinho(updatedCarrinho);
    updateValorTotal(updatedCarrinho);
  };

  const handleConfirmarVenda = async () => {
    try {
      const vendasCollection = collection(firestore, "vendas");
      const docRef = await addDoc(vendasCollection, {
        produtos: carrinho,
        valorPago,
        metodoPagamento,
        data: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
      });
      console.log("Venda registrada com ID: ", docRef.id);
      for (const item of Object.values(carrinho)) {
        const produtoRef = doc(firestore, "produtos", item.id);
        const document = await getDoc(produtoRef);
        const data = await document.data();
        await updateDoc(produtoRef, {
          quantidade: data.quantidade - item.comprando,
        });
      }
      console.log("Venda confirmada!");
      toggleCarrinhoSize();
      setModalAberto(false);
      setCarrinho({});
      setValorTotal(0);
    } catch (error) {
      console.error("Erro ao confirmar venda:", error);
    }
  };

  const toggleCarrinhoSize = () => {
    setCarrinhoMinimizado(!carrinhoMinimizado);
  };

  return (
    <div className="pagina-venda">
      <div className="categorias">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`categoria-card ${
              categoria.id === categoriaSelecionada ? "selected" : ""
            }`}
            onClick={() => handleCategoriaClick(categoria.id)}
          >
            <h3>{categoria.nome}</h3>
          </div>
        ))}
      </div>
      <div className="produtos">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="produto-card"
            onClick={() => addToCart(produto)}
          >
            <h3>{produto.nome}</h3>
            <p>
              Preço: <strong>R$ {produto.preco}</strong>
            </p>
          </div>
        ))}
      </div>
      <div className={`carrinho ${carrinhoMinimizado ? "minimizado" : ""}`}>
        <h3>Total R$ {valorTotal}</h3>
        {!carrinhoMinimizado && (
          <>
            <div className="x" onClick={toggleCarrinhoSize}>
            x
            </div>
            <ul>
              {Object.values(carrinho).map((item) => (
                <li key={item.id}>
                  <div className="infos">
                    <div
                      className="remover"
                      onClick={() => removeFromCart(item.id)}
                    >
                      X
                    </div>
                    <span>{item.nome}</span>
                  </div>
                  <div className="infos">
                    <button
                      className="diminuir"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      -
                    </button>
                    <input type="number" className="quantidade" value={item.comprando}></input>
                    <button
                      className="aumentar"
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="checkout" onClick={setModalAberto}>
              <MdShoppingCartCheckout />
            </button>
          </>
        )}
        {carrinhoMinimizado ? (
          <button className="checkout" onClick={toggleCarrinhoSize}>
            <MdShoppingCartCheckout />
          </button>
        ) : (
          ""
        )}
        {modalAberto && (
          <div className="modal">
            <div className="modal-content">
            <div className="x" onClick={fechaModal}>
              x
            </div>
              <h2>Confirmação de Venda</h2>
              <div className="form-group">
                <label htmlFor="metodoPagamento">Método de Pagamento:</label>
                <select
                  id="metodoPagamento"
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                >
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
                  <input
                    type="number"
                    id="valorPago"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <button
                  onClick={handleConfirmarVenda}
                  disabled={!metodoPagamento}
                >
                  Confirmar Venda
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaVenda;
