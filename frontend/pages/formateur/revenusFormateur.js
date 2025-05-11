'use client';
import { useEffect, useState } from 'react';
import HeaderFormateur from './components/header';
import Footer from '../user/components/footer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaChevronDown, FaChevronRight, FaFilePdf, FaSearch } from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function RevenusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchMonth, setSearchMonth] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [expandedFormations, setExpandedFormations] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    const fetchRevenus = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/suivi/getFormationsWithRevenue', {
          credentials: 'include',
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          setFilteredData(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du fetch des revenus :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenus();
  }, []);

  useEffect(() => {
    if (data && searchMonth) {
      const filtered = {
        ...data,
        formations: data.formations
          .filter(formation => Object.keys(formation.revenusParMois).some(month => month.includes(searchMonth)))
          .map(formation => ({
            ...formation,
            revenusParMois: Object.fromEntries(
              Object.entries(formation.revenusParMois)
                .filter(([month]) => month.includes(searchMonth))
            )
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
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
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
    doc.text('Rapport des Revenus', 105, 15, { align: 'center' });
    
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
        doc.text(`Prix: ${formation.formation.prix} TND | Votre part: ${(formation.formation.prix * 0.4).toFixed(2)} TND`, 14, yPosition);
        yPosition += 7;
        
        // Total formation
        doc.text(`Total pour cette formation: ${formation.totalRevenu.toFixed(2)} TND`, 14, yPosition);
        yPosition += 10;
        
        // Tableau des revenus par mois
        const tableData = [];
        Object.entries(formation.revenusParMois).forEach(([month, info]) => {
          info.details.forEach(detail => {
            tableData.push([
              formatMonthYear(month),
              detail.apprenant.name,
              formatDate(detail.date),
              `${detail.revenu.toFixed(2)} TND`
            ]);
          });
        });
        
        if (tableData.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Mois', 'Apprenant', 'Date', 'Revenu']],
            body: tableData,
            margin: { left: 14 },
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
          });
          yPosition = doc.lastAutoTable.finalY + 10;
        }
        
        // Ajout d'une nouvelle page si nécessaire
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      }
    });
    
    doc.save(`revenus-formateur-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeaderFormateur darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 dark:text-gray-300">Chargement de vos revenus...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeaderFormateur darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <p>Aucune donnée de revenus disponible.</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard ou contacter le support.</p>
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
    Object.keys(formation.revenusParMois).forEach(month => {
      if (!allMonths.includes(month)) {
        allMonths.push(month);
      }
    });
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeaderFormateur darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Mes Revenus</h1>
          
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
                      <span className="text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Votre part :</span> {(formation.formation.prix * 0.4).toFixed(2)} TND
                      </span>
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
                      {Object.entries(formation.revenusParMois).map(([mois, info]) => (
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