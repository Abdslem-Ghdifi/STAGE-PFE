import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Container,
  Tooltip,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  IconButton,
  Toolbar,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Footer from './components/footer';
import Header from './components/header';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SuiviFormationsAdmin = () => {
  const theme = useTheme();
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuivi, setSelectedSuivi] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformRevenue: 0,
    formateurRevenue: 0,
    formationsCount: 0,
    completedCount: 0,
    pendingCount: 0
  });
  const [chartData, setChartData] = useState([]);

  const fetchSuivis = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/suivi/adminSuivi', {
        withCredentials: true
      });
      setSuivis(response.data);
      calculateStats(response.data);
      prepareChartData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des suivis.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let totalRevenue = 0;
    let platformRevenue = 0;
    let formateurRevenue = 0;
    let formationsCount = 0;
    let completedCount = 0;
    let pendingCount = 0;

    data.forEach(suivi => {
      if (suivi.datePaiement) {
        totalRevenue += suivi.total || 0;
        platformRevenue += (suivi.total || 0) * 0.6;
        formateurRevenue += (suivi.total || 0) * 0.4;
        completedCount++;
      } else {
        pendingCount++;
      }
      formationsCount += suivi.formations?.length || 0;
    });

    setStats({
      totalRevenue,
      platformRevenue,
      formateurRevenue,
      formationsCount,
      completedCount,
      pendingCount
    });
  };

  const prepareChartData = (data) => {
    const revenueByMonth = {};
    const formationPopularity = {};

    data.forEach(suivi => {
      if (suivi.datePaiement) {
        const monthYear = format(new Date(suivi.datePaiement), 'MM/yyyy');
        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0;
        }
        revenueByMonth[monthYear] += suivi.total || 0;

        suivi.formations.forEach(f => {
          const formationName = f.formation?.titre || 'Inconnu';
          if (!formationPopularity[formationName]) {
            formationPopularity[formationName] = 0;
          }
          formationPopularity[formationName]++;
        });
      }
    });

    const monthData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      name: month,
      total: revenue,
      platform: revenue * 0.6,
      formateur: revenue * 0.4
    })).sort((a, b) => new Date(`01/${a.name}`) - new Date(`01/${b.name}`));

    const formationData = Object.entries(formationPopularity).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    setChartData({
      monthlyRevenue: monthData,
      popularFormations: formationData
    });
  };

  useEffect(() => {
    fetchSuivis();
  }, []);

  const handleOpenDetails = (suivi) => {
    setSelectedSuivi(suivi);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const filteredSuivis = suivis.filter((suivi) => {
    const matchesSearch =
      suivi.apprenant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suivi.apprenant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suivi.apprenant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suivi.formations?.some(f => 
        f.formation?.titre?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      suivi.referencePaiement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suivi.total?.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Titre principal
    doc.setFontSize(18);
    doc.text('Rapport des Formations - Administration', 105, 15, { align: 'center' });
    
    // Date de génération
    doc.setFontSize(10);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy')}`, 105, 22, { align: 'center' });
    
    // Statistiques
    doc.setFontSize(14);
    doc.text('Statistiques Globales', 14, 30);
    
    // Tableau des stats
    doc.autoTable({
      startY: 40,
      head: [['Statistique', 'Valeur']],
      body: [
        ['Revenu Total', `${stats.totalRevenue.toFixed(2)} TND`],
        ['Part Plateforme (60%)', `${stats.platformRevenue.toFixed(2)} TND`],
        ['Part Formateurs (40%)', `${stats.formateurRevenue.toFixed(2)} TND`],
        ['Formations suivies', stats.formationsCount],
        ['Paiements complétés', stats.completedCount],
        ['Paiements en attente', stats.pendingCount]
      ],
      margin: { left: 14 },
      styles: { fontSize: 10 }
    });
    
    let yPosition = doc.lastAutoTable.finalY + 15;
    
    // Détails des suivis
    doc.setFontSize(14);
    doc.text('Détails des Suivis', 14, yPosition);
    yPosition += 10;
    
    const tableData = filteredSuivis.map(suivi => [
      `${suivi.apprenant?.prenom} ${suivi.apprenant?.nom}`,
      suivi.formations.map(f => f.formation?.titre).join(', '),
      `${suivi.total?.toFixed(2)} TND`,
      suivi.datePaiement ? 'Payé' : 'En attente',
      suivi.datePaiement ? format(new Date(suivi.datePaiement), 'dd/MM/yyyy') : '-'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Apprenant', 'Formations', 'Total', 'Statut', 'Date Paiement']],
      body: tableData,
      margin: { left: 14 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save(`suivi-formations-admin-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error" variant="h6" gutterBottom>
            Erreur : {error}
          </Typography>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ 
        backgroundColor: theme.palette.background.default,
        minHeight: 'calc(100vh - 128px)'
      }}>
        <Container maxWidth="lg">
          <Toolbar />

          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary
                }}
              >
                Suivi des formations
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Gestion des formations suivies par les apprenants
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={exportToPDF}
                sx={{
                  backgroundColor: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark
                  }
                }}
              >
                Exporter PDF
              </Button>
            </Grid>
          </Grid>

          {/* Statistiques et graphiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenu Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalRevenue.toFixed(2)} TND
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Plateforme (60%)
                      </Typography>
                      <Typography variant="body1">
                        {stats.platformRevenue.toFixed(2)} TND
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Formateurs (40%)
                      </Typography>
                      <Typography variant="body1">
                        {stats.formateurRevenue.toFixed(2)} TND
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Formations suivies
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.formationsCount}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Paiements complétés
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {stats.completedCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Paiements en attente
                      </Typography>
                      <Typography variant="body1" color="warning.main">
                        {stats.pendingCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition des revenus
                  </Typography>
                  <Box sx={{ height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Plateforme', value: stats.platformRevenue },
                            { name: 'Formateurs', value: stats.formateurRevenue }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [`${value.toFixed(2)} TND`, 'Valeur']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {chartData.monthlyRevenue && chartData.monthlyRevenue.length > 0 && (
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenus par mois
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.monthlyRevenue}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value) => [`${value.toFixed(2)} TND`, 'Valeur']}
                          />
                          <Legend />
                          <Bar dataKey="platform" name="Plateforme (60%)" stackId="a" fill="#0088FE" />
                          <Bar dataKey="formateur" name="Formateurs (40%)" stackId="a" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {chartData.popularFormations && chartData.popularFormations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Formations populaires
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.popularFormations}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="count" name="Nombre d'inscriptions" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          <Box sx={{ 
            mb: 3, 
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
            }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par apprenant, formation, référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                sx: {
                  color: theme.palette.text.primary,
                }
              }}
              sx={{
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                }
              }}
            />
          </Box>

          <TableContainer 
            component={Paper} 
            elevation={3} 
            sx={{ 
              width: '100%', 
              overflowX: 'auto',
              backgroundColor: theme.palette.background.paper,
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] 
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Apprenant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Formations</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Progression</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Total (TND)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Paiement</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuivis.length > 0 ? (
                  filteredSuivis.map((suivi) => (
                    <TableRow 
                      key={suivi._id} 
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={suivi.apprenant?.image}
                            alt={`${suivi.apprenant?.prenom} ${suivi.apprenant?.nom}`}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                              {suivi.apprenant?.prenom} {suivi.apprenant?.nom}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {suivi.apprenant?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {suivi.formations.slice(0, 2).map((formationSuivi) => (
                            <Chip
                              key={formationSuivi.formation?._id}
                              label={formationSuivi.formation?.titre}
                              size="small"
                              avatar={<Avatar src={formationSuivi.formation?.image} />}
                            />
                          ))}
                          {suivi.formations.length > 2 && (
                            <Chip
                              label={`+${suivi.formations.length - 2}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 150 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={suivi.formations.reduce((acc, f) => acc + f.progression, 0) / suivi.formations.length} 
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            {Math.round(suivi.formations.reduce((acc, f) => acc + f.progression, 0) / suivi.formations.length)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {suivi.total?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {suivi.datePaiement ? (
                          <Box>
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Payé"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                              {format(new Date(suivi.datePaiement), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                            {suivi.referencePaiement && (
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Ref: {suivi.referencePaiement}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Chip
                            icon={<PendingIcon />}
                            label="En attente"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenDetails(suivi)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={6} 
                      align="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <Typography variant="body1">
                        Aucun suivi trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Dialog pour les détails */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={selectedSuivi?.apprenant?.image}
              alt={`${selectedSuivi?.apprenant?.prenom} ${selectedSuivi?.apprenant?.nom}`}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">
                {selectedSuivi?.apprenant?.prenom} {selectedSuivi?.apprenant?.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSuivi?.apprenant?.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSuivi && (
            <Box>
              <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Total payé</Typography>
                    <Typography variant="h5">{selectedSuivi.total?.toFixed(2)} TND</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plateforme: {(selectedSuivi.total * 0.6).toFixed(2)} TND (60%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Formateurs: {(selectedSuivi.total * 0.4).toFixed(2)} TND (40%)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Date de paiement</Typography>
                    <Typography variant="body1">
                      {selectedSuivi.datePaiement 
                        ? format(new Date(selectedSuivi.datePaiement), 'dd MMMM yyyy', { locale: fr })
                        : 'Non payé'}
                    </Typography>
                    {selectedSuivi.referencePaiement && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                          Référence de paiement
                        </Typography>
                        <Typography variant="body1">
                          {selectedSuivi.referencePaiement}
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>Formations suivies</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Formation</TableCell>
                      <TableCell>Formateur</TableCell>
                      <TableCell align="center">Progression</TableCell>
                      <TableCell align="right">Prix</TableCell>
                      <TableCell align="center">Revenu formateur</TableCell>
                      <TableCell align="center">Date d'inscription</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSuivi.formations.map((formationSuivi) => (
                      <TableRow key={formationSuivi.formation?._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={formationSuivi.formation?.image}
                              alt={formationSuivi.formation?.titre}
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Typography>
                              {formationSuivi.formation?.titre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {formationSuivi.formation?.formateur?.prenom} {formationSuivi.formation?.formateur?.nom} 
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={formationSuivi.progression} 
                              />
                            </Box>
                            <Typography variant="body2">
                              {formationSuivi.progression}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formationSuivi.prix?.toFixed(2)} TND
                        </TableCell>
                        <TableCell align="right">
                          {(formationSuivi.prix * 0.4).toFixed(2)} TND
                        </TableCell>
                        
                        <TableCell align="center">
                          {format(new Date(formationSuivi.dateAjout), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default SuiviFormationsAdmin;