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
  Toolbar,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
          <ListItemButton 
            selected={activeTab === 'attenteAdmin'} 
            onClick={() => setActiveTab('attenteAdmin')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                }
              }
            }}
          >
            <ListItemIcon>
              <GavelIcon color={activeTab === 'attenteAdmin' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="En attente (Admin)" 
              primaryTypographyProps={{
                fontWeight: activeTab === 'attenteAdmin' ? 'bold' : 'normal'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTab === 'publie'} 
            onClick={() => setActiveTab('publie')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                }
              }
            }}
          >
            <ListItemIcon>
              <PublishIcon color={activeTab === 'publie' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Publiées" 
              primaryTypographyProps={{
                fontWeight: activeTab === 'publie' ? 'bold' : 'normal'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTab === 'attenteExpert'} 
            onClick={() => setActiveTab('attenteExpert')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                }
              }
            }}
          >
            <ListItemIcon>
              <HourglassEmptyIcon color={activeTab === 'attenteExpert' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="En attente (Expert)" 
              primaryTypographyProps={{
                fontWeight: activeTab === 'attenteExpert' ? 'bold' : 'normal'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTab === 'accepteExpert'} 
            onClick={() => setActiveTab('accepteExpert')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                }
              }
            }}
          >
            <ListItemIcon>
              <VerifiedIcon color={activeTab === 'accepteExpert' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Acceptées (Expert)" 
              primaryTypographyProps={{
                fontWeight: activeTab === 'accepteExpert' ? 'bold' : 'normal'
              }} 
            />
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
      <Box sx={{ 
        display: 'flex', 
        minHeight: 'calc(100vh - 128px)',
        backgroundColor: theme.palette.background.default
      }}>
        {/* Drawer mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              backgroundColor: theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
            }
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
              top: 'auto',
              backgroundColor: theme.palette.background.paper,
              borderRight: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
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
            width: { sm: `calc(100% - 240px)` },
            backgroundColor: theme.palette.background.default
          }}
        >
          <Toolbar />

          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            {isMobile && (
              <Grid item>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
            )}
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
                {activeTab === 'attenteExpert' && 'Formations en attente de validation par expert'}
                {activeTab === 'accepteExpert' && 'Formations validées par expert'}
                {activeTab === 'attenteAdmin' && 'Formations en attente de publication'}
                {activeTab === 'publie' && 'Formations publiées'}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ 
            mb: 3, 
            width: '100%', 
            maxWidth: '1200px',
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
              placeholder="Rechercher dans tous les champs..."
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
                  <TableCell sx={{ fontWeight: 'bold', width: '100px', color: theme.palette.text.primary }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '200px', color: theme.palette.text.primary }}>Titre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '300px', color: theme.palette.text.primary }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '150px', color: theme.palette.text.primary }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '150px', color: theme.palette.text.primary }}>Formateur</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Prix (TND)</TableCell>
                  {activeTab === 'attenteAdmin' && <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFormations.length > 0 ? (
                  filteredFormations.map((formation) => (
                    <TableRow 
                      key={formation._id} 
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
                        }
                      }}
                    >
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={formation.image}
                          alt={formation.titre}
                          sx={{ width: 56, height: 56 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                        {formation.titre}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formation.description}>
                          <Box
                            sx={{
                              maxWidth: 400,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: theme.palette.text.primary
                            }}
                          >
                            {formation.description}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {formation.categorie?.nom || 'Non spécifiée'}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {formation.formateur
                          ? `${formation.formateur.nom} ${formation.formateur.prenom}`
                          : 'Non attribué'}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {formation.prix}
                      </TableCell>
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
                    <TableCell 
                      colSpan={activeTab === 'attenteAdmin' ? 7 : 6} 
                      align="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <Typography variant="body1">
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