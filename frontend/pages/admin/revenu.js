'use client';
import { useEffect, useState } from 'react';
import Header from './components/header';
import Footer from './components/footer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaChevronDown, FaChevronRight, FaFilePdf, FaSearch } from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminRevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMonth, setSearchMonth] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [expandedFormations, setExpandedFormations] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('platform');
  const [chartData, setChartData] = useState(null);

  // Initialiser le dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Charger les données et préparer les graphiques
  useEffect(() => {
    // In the fetchRevenueData function inside AdminRevenuePage component
const fetchRevenueData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Récupérer d'abord les formations publiées
    const formationsResponse = await axios.get('http://localhost:8080/api/formation/pub', {
      withCredentials: true
    });

    if (!formationsResponse.data.success || !formationsResponse.data.data) {
      throw new Error('Erreur lors de la récupération des formations');
    }

    const formations = formationsResponse.data.data;

    // Ensuite, récupérer les revenus pour chaque formation
    const revenueData = {
      formations: [],
      revenuTotalGlobal: 0
    };

    // Récupérer tous les revenus en une seule requête
    try {
      const endpoint = viewMode === 'platform' 
        ? 'http://localhost:8080/api/admin/revenus-platform'
        : 'http://localhost:8080/api/admin/revenus-formateurs';
      
      const revenueResponse = await axios.get(endpoint, { withCredentials: true });
      
      if (revenueResponse.data.success && revenueResponse.data.data) {
        // Associer les données de revenus avec les formations
        revenueData.formations = formations.map(formation => {
          const revenueInfo = revenueResponse.data.data.formations.find(f => 
            f.formation && f.formation._id === formation._id
          );
          
          if (revenueInfo) {
            revenueData.revenuTotalGlobal += revenueInfo.totalRevenu || 0;
            return {
              formation,
              formateur: formation.formateur,
              ...revenueInfo
            };
          }
          
          return {
            formation,
            formateur: formation.formateur,
            revenusParMois: {},
            totalRevenu: 0
          };
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des revenus:', err);
      // Si l'API des revenus échoue, initialiser avec des données vides
      revenueData.formations = formations.map(formation => ({
        formation,
        formateur: formation.formateur,
        revenusParMois: {},
        totalRevenu: 0
      }));
    }

    setData(revenueData);
    setFilteredData(revenueData);
    prepareChartData(revenueData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données:', err);
    setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération des données');
  } finally {
    setLoading(false);
  }
};

    fetchRevenueData();
  }, [viewMode]);

  // Préparer les données pour les graphiques
  const prepareChartData = (revenueData) => {
    if (!revenueData) return;

    // Données pour le graphique à barres (revenus par mois)
    const months = {};
    revenueData.formations.forEach(formation => {
      if (formation.revenusParMois) {
        Object.entries(formation.revenusParMois).forEach(([month, info]) => {
          if (!months[month]) months[month] = 0;
          months[month] += info.total;
        });
      }
    });

    const sortedMonths = Object.keys(months).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      return aYear - bYear || aMonth - bMonth;
    });

    const barData = {
      labels: sortedMonths.map(month => formatMonthYear(month)),
      datasets: [{
        label: `Revenus (${viewMode === 'platform' ? 'Plateforme' : 'Formateurs'})`,
        data: sortedMonths.map(month => months[month]),
        backgroundColor: viewMode === 'platform' 
          ? 'rgba(54, 162, 235, 0.7)'
          : 'rgba(75, 192, 192, 0.7)',
        borderColor: viewMode === 'platform' 
          ? 'rgba(54, 162, 235, 1)'
          : 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    // Données pour le graphique circulaire (répartition par formation)
    const formationRevenue = {};
    revenueData.formations.forEach(formation => {
      if (formation.totalRevenu > 0) {
        formationRevenue[formation.formation.titre] = formation.totalRevenu;
      }
    });

    const pieData = {
      labels: Object.keys(formationRevenue),
      datasets: [{
        data: Object.values(formationRevenue),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    };

    setChartData({
      bar: barData,
      pie: pieData
    });
  };

  // Filtrer les données par mois
  useEffect(() => {
    if (data && searchMonth) {
      const filtered = {
        ...data,
        formations: data.formations
          .filter(formation => formation.revenusParMois && Object.keys(formation.revenusParMois).some(month => month.includes(searchMonth)))
          .map(formation => ({
            ...formation,
            revenusParMois: formation.revenusParMois ? Object.fromEntries(
              Object.entries(formation.revenusParMois)
                .filter(([month]) => month.includes(searchMonth))
            ) : {}
          }))
      };
      setFilteredData(filtered);
    } else if (data) {
      setFilteredData(data);
    }
  }, [searchMonth, data]);

  const formatMonthYear = (monthYearString) => {
    const [month, year] = monthYearString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const toggleFormation = (formationId) => {
    setExpandedFormations(prev => ({
      ...prev,
      [formationId]: !prev[formationId]
    }));
  };

  const toggleMonth = (formationId, month) => {
    setExpandedMonths(prev => ({
      ...prev,
      [`${formationId}-${month}`]: !prev[`${formationId}-${month}`]
    }));
  };

  const exportToPDF = () => {
    if (!filteredData) return;

    const doc = new jsPDF();
    
    // Titre principal
    doc.setFontSize(18);
    doc.text(`Rapport des Revenus (${viewMode === 'platform' ? 'Plateforme' : 'Formateurs'})`, 105, 15, { align: 'center' });
    
    // Date de génération
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' });
    
    // Total global
    doc.setFontSize(14);
    doc.text(`Total des revenus: ${filteredData.revenuTotalGlobal.toFixed(2)} TND`, 14, 30);
    
    let yPosition = 40;
    
    // Parcourir les formations
    filteredData.formations.forEach(formation => {
      if (formation.totalRevenu > 0) {
        // Titre de la formation
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Formation: ${formation.formation.titre}`, 14, yPosition);
        yPosition += 7;
        
        // Prix et part
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const part = viewMode === 'platform' ? formation.formation.prix * 0.6 : formation.formation.prix * 0.4;
        doc.text(`Prix: ${formation.formation.prix} TND | ${viewMode === 'platform' ? 'Part plateforme' : 'Part formateur'}: ${part.toFixed(2)} TND`, 14, yPosition);
        yPosition += 7;
        
        // Total formation
        doc.text(`Total pour cette formation: ${formation.totalRevenu.toFixed(2)} TND`, 14, yPosition);
        yPosition += 10;
        
        // Tableau des revenus par mois (si existant)
        if (formation.revenusParMois) {
          const tableData = [];
          Object.entries(formation.revenusParMois).forEach(([month, info]) => {
            info.details.forEach(detail => {
              tableData.push([
                formatMonthYear(month),
                detail.apprenant.name,
                formatDate(detail.date),
                `${detail.revenu.toFixed(2)} TND`,
                viewMode === 'platform' ? detail.formateur?.name || 'N/A' : ''
              ]);
            });
          });
          
          if (tableData.length > 0) {
            const headers = viewMode === 'platform' 
              ? ['Mois', 'Apprenant', 'Date', 'Revenu', 'Formateur']
              : ['Mois', 'Apprenant', 'Date', 'Revenu'];
              
            autoTable(doc, {
              startY: yPosition,
              head: [headers],
              body: tableData,
              margin: { left: 14 },
              styles: { fontSize: 8 },
              headStyles: { fillColor: [41, 128, 185], textColor: 255 }
            });
            yPosition = doc.lastAutoTable.finalY + 10;
          }
        }
        
        // Ajout d'une nouvelle page si nécessaire
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      }
    });
    
    doc.save(`revenus-${viewMode}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 dark:text-gray-300">Chargement des revenus...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900 rounded-lg max-w-md">
            <p className="font-medium">Erreur lors du chargement des données</p>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 p-4 rounded-lg">
            <p>Aucune donnée de revenus disponible.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formationsAvecRevenu = filteredData.formations.filter(f => f.totalRevenu > 0);

  // Générer la liste des mois disponibles pour la recherche
  const allMonths = [];
  filteredData.formations.forEach(formation => {
    if (formation.revenusParMois) {
      Object.keys(formation.revenusParMois).forEach(month => {
        if (!allMonths.includes(month)) {
          allMonths.push(month);
        }
      });
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Revenus {viewMode === 'platform' ? 'de la Plateforme (60%)' : 'des Formateurs (40%)'}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <select
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">Tous les mois</option>
                {allMonths.sort((a, b) => {
                  const [aMonth, aYear] = a.split('/').map(Number);
                  const [bMonth, bYear] = b.split('/').map(Number);
                  return bYear - aYear || bMonth - aMonth;
                }).map(month => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaFilePdf className="w-5 h-5" />
              Exporter PDF
            </button>
          </div>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setViewMode('platform')}
            className={`px-4 py-2 rounded-l-lg ${viewMode === 'platform' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Revenus Plateforme (60%)
          </button>
          <button
            onClick={() => setViewMode('formateurs')}
            className={`px-4 py-2 rounded-r-lg ${viewMode === 'formateurs' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Revenus Formateurs (40%)
          </button>
        </div>

        {/* Section des statistiques */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Répartition des revenus par mois
              </h2>
              <div className="h-80">
                <Bar 
                  data={chartData.bar}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: darkMode ? '#fff' : '#333'
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} TND`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: darkMode ? '#fff' : '#333',
                          callback: function(value) {
                            return `${value} TND`;
                          }
                        },
                        grid: {
                          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: darkMode ? '#fff' : '#333'
                        },
                        grid: {
                          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Répartition par formation
              </h2>
              <div className="h-80">
                <Pie 
                  data={chartData.pie}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: darkMode ? '#fff' : '#333'
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toFixed(2)} TND (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg flex-1 min-w-[200px]">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Revenu Total</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {filteredData.revenuTotalGlobal.toFixed(2)} TND
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg flex-1 min-w-[200px]">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Formations avec revenus</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formationsAvecRevenu.length}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg flex-1 min-w-[200px]">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Période</h3>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {searchMonth ? formatMonthYear(searchMonth) : 'Tous les mois'}
              </p>
            </div>
          </div>
        </div>

        {formationsAvecRevenu.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchMonth 
                ? `Aucun revenu trouvé pour ${formatMonthYear(searchMonth)}`
                : 'Aucun revenu disponible pour le moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {formationsAvecRevenu.map((formation) => (
              <div key={formation.formation._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFormation(formation.formation._id)}
                  className="w-full flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{formation.formation.titre}</h2>
                    <div className="flex flex-wrap items-center mt-2 gap-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Prix :</span> {formation.formation.prix} TND
                      </span>
                      <span className={viewMode === 'platform' ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"}>
                        <span className="font-medium">Votre part :</span> {(formation.formation.prix * (viewMode === 'platform' ? 0.6 : 0.4)).toFixed(2)} TND
                      </span>
                      {viewMode === 'platform' && formation.formateur && (
                        <span className="text-purple-600 dark:text-purple-400">
                          <span className="font-medium">Formateur :</span> {formation.formateur.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium mr-4">
                      Total : {formation.totalRevenu.toFixed(2)} TND
                    </span>
                    {expandedFormations[formation.formation._id] ? (
                      <FaChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedFormations[formation.formation._id] && (
                  <div className="border-t dark:border-gray-700 p-6">
                    <div className="space-y-4">
                      {formation.revenusParMois && Object.entries(formation.revenusParMois).map(([mois, info]) => (
                        <div key={mois} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleMonth(formation.formation._id, mois)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <div className="font-medium text-gray-800 dark:text-white">
                              {formatMonthYear(mois)} - Total : {info.total.toFixed(2)} TND
                            </div>
                            {expandedMonths[`${formation.formation._id}-${mois}`] ? (
                              <FaChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <FaChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>

                          {expandedMonths[`${formation.formation._id}-${mois}`] && (
                            <div className="bg-white dark:bg-gray-800 p-4">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Apprenant
                                      </th>
                                      {viewMode === 'platform' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                          Formateur
                                        </th>
                                      )}
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Revenu
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {info.details.map((detail, index) => (
                                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">{detail.apprenant.name}</div>
                                          <div className="text-sm text-gray-500 dark:text-gray-400">{detail.apprenant.email}</div>
                                        </td>
                                        {viewMode === 'platform' && (
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                              {detail.formateur?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                              {detail.formateur?.email || ''}
                                            </div>
                                          </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                          {formatDate(detail.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                          {detail.revenu.toFixed(2)} TND
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}