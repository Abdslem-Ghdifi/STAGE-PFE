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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Grid,
  IconButton,
  Toolbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Publish as PublishIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Verified as VerifiedIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import Footer from './components/footer';
import Header from './components/header';

const FormationsAdmin = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attenteAdmin');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchFormations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/formation/pub', {
        withCredentials: true
      });
      setFormations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des formations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleValidate = async (formationId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/formation/${formationId}/admin/accept`,
        {},
        { withCredentials: true }
      );
      fetchFormations();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation.');
    }
  };

  const handleReject = async (formationId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/formation/${formationId}/admin/reject`,
        {},
        { withCredentials: true }
      );
      fetchFormations();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du refus.');
    }
  };

  const filteredFormations = formations.filter((formation) => {
    const matchesSearch =
      formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.categorie?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.formateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.formateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.prix?.toString().includes(searchTerm);

    switch (activeTab) {
      case 'attenteExpert':
        return matchesSearch && formation.accepteParExpert === 'encours';
      case 'accepteExpert':
        return matchesSearch && formation.accepteParExpert === 'accepter';
      case 'attenteAdmin':
        return matchesSearch && formation.accepteParExpert === 'accepter' && formation.accepteParAdmin === 'encours';
      case 'publie':
        return matchesSearch && formation.accepteParAdmin === 'accepter';
      default:
        return matchesSearch;
    }
  });

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={activeTab === 'attenteAdmin'} onClick={() => setActiveTab('attenteAdmin')}>
            <ListItemIcon>
              <GavelIcon color={activeTab === 'attenteAdmin' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="En attente (Admin)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton selected={activeTab === 'publie'} onClick={() => setActiveTab('publie')}>
            <ListItemIcon>
              <PublishIcon color={activeTab === 'publie' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Publiées" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton selected={activeTab === 'attenteExpert'} onClick={() => setActiveTab('attenteExpert')}>
            <ListItemIcon>
              <HourglassEmptyIcon color={activeTab === 'attenteExpert' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="En attente (Expert)" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton selected={activeTab === 'accepteExpert'} onClick={() => setActiveTab('accepteExpert')}>
            <ListItemIcon>
              <VerifiedIcon color={activeTab === 'accepteExpert' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Acceptées (Expert)" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

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
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 128px)' }}>
        {/* Drawer mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer desktop */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              position: 'relative',
              height: 'calc(100vh - 64px)',
              top: 'auto'
            }
          }}
          open
        >
          {drawer}
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` }
          }}
        >
          <Toolbar />

          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item sx={{ display: { sm: 'none' } }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {activeTab === 'attenteExpert' && 'Formations en attente de validation par expert'}
                {activeTab === 'accepteExpert' && 'Formations validées par expert'}
                {activeTab === 'attenteAdmin' && 'Formations en attente de publication'}
                {activeTab === 'publie' && 'Formations publiées'}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3, width: '100%', maxWidth: '1200px' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher dans tous les champs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 1
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={3} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Titre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }}>Formateur</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Prix (TND)</TableCell>
                  {activeTab === 'attenteAdmin' && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFormations.length > 0 ? (
                  filteredFormations.map((formation) => (
                    <TableRow key={formation._id} hover>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={formation.image}
                          alt={formation.titre}
                          sx={{ width: 56, height: 56 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{formation.titre}</TableCell>
                      <TableCell>
                        <Tooltip title={formation.description}>
                          <Box
                            sx={{
                              maxWidth: 400,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {formation.description}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formation.categorie?.nom || 'Non spécifiée'}</TableCell>
                      <TableCell>
                        {formation.formateur
                          ? `${formation.formateur.nom} ${formation.formateur.prenom}`
                          : 'Non attribué'}
                      </TableCell>
                      <TableCell>{formation.prix}</TableCell>
                      {activeTab === 'attenteAdmin' && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleValidate(formation._id)}
                              startIcon={<PublishIcon />}
                            >
                              Publier
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleReject(formation._id)}
                              startIcon={<GavelIcon />}
                            >
                              Refuser
                            </Button>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'attenteAdmin' ? 7 : 6} align="center">
                      <Typography variant="body1" color="textSecondary">
                        Aucune formation trouvée
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default FormationsAdmin;