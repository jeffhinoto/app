import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { collection, getDocs } from 'firebase/firestore'; // Importe a função collection e getDocs
import { firestore } from '../firebase'; // Importe a referência do Firestore

const Graph = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const vendasCollection = collection(firestore, 'vendas');

    getDocs(vendasCollection).then((vendasSnapshot) => {
      const sd = vendasSnapshot.docs.map((doc) => doc.data());
      setSalesData(sd);
    });
  }, []);

  function getUsageData(){
    const dailySalesData = [];

    if (salesData.length > 0) {
      const salesByDate = salesData.reduce((acc, sale) => {
        const date = new Date(sale.data);
        const dateKey = date.setHours(0, 0, 0, 0);

        if (acc[dateKey]) {
          acc[dateKey] += 1;
        } else {
          acc[dateKey] = 1;
        }

        return acc;
      }, {});

      for (const date in salesByDate) {
        dailySalesData.push([Number(date), salesByDate[date]]);
      }
      dailySalesData.sort((a, b) => a[0] - b[0]);
    }

    return [{ name: 'daily', data: dailySalesData }];
  }
  
  function getChartOptions() {
    const usageData = getUsageData();
    console.log(usageData)
    let minDate;
    try {
      minDate = (usageData[0].data[0])[0];
    } catch {
      minDate = new Date().getTime();
    }

    return {
      chart: {
        id: 'area-datetime',
        type: 'area',
        height: 350,
        background: "#ffffff00",
        zoom: {
          autoScaleYaxis: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'datetime',
        min: minDate,
        tickAmount: 6,
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
    };
  }

  return (
    <div>
      <h2>Dashboard de Vendas</h2>
      <div>
        <h3>Vendas Diárias</h3>
        <ReactApexChart options={getChartOptions()} series={getUsageData()} type="area" height={300} />
      </div>
      <div>
        <h3>Vendas Mensais</h3>
      </div>
    </div>
  );
};

export default Graph;