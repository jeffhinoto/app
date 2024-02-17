import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';

const Dashboard = () => {
  const [vendasDia, setVendasDia] = useState([]);
  const [vendasMes, setVendasMes] = useState([]);

  useEffect(() => {
    const fetchVendas = async () => {
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      try {
        // Consulta ao Firestore para buscar as vendas do dia
        const vendasDiaRef = firestore.collection('vendas').where('data', '>=', hoje);
        const vendasDiaSnapshot = await vendasDiaRef.get();
        const vendasDiaData = vendasDiaSnapshot.docs.map(doc => doc.data());

        setVendasDia(vendasDiaData);

        // Consulta ao Firestore para buscar as vendas do mês
        const vendasMesRef = firestore.collection('vendas').where('data', '>=', primeiroDiaDoMes);
        const vendasMesSnapshot = await vendasMesRef.get();
        const vendasMesData = vendasMesSnapshot.docs.map(doc => doc.data());

        setVendasMes(vendasMesData);
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
      }
    };

    fetchVendas();
  }, []);

  // Função para calcular o valor total das vendas
  const calcularTotalVendas = (vendas) => {
    return vendas.reduce((total, venda) => total + venda.valor, 0);
  };

  return (
    <div>
      <h2>Vendas do Dia</h2>
      <ul>
        {vendasDia.map((venda, index) => (
          <li key={index}>{/* Exibir os detalhes da venda */}</li>
        ))}
      </ul>
      <h3>Total do Dia: R$ {calcularTotalVendas(vendasDia).toFixed(2)}</h3> {/* Adicionar o total das vendas do dia */}
      
      <h2>Vendas do Mês</h2>
      <ul>
        {vendasMes.map((venda, index) => (
          <li key={index}>{/* Exibir os detalhes da venda */}</li>
        ))}
      </ul>
      <h3>Total do Mês: R$ {calcularTotalVendas(vendasMes).toFixed(2)}</h3> {/* Adicionar o total das vendas do mês */}
    </div>
  );
};

export default Dashboard;
