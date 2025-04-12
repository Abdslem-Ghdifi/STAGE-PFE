import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Box,
  ThemeProvider,
  createTheme,
  Avatar,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: '1.4',
    },
    body2: {
      fontSize: '0.85rem',
      color: '#666',
    }
  },
});

const CategoryCard = styled(Card)(() => ({
  height: '100%',
  borderRadius: '10px',
  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  marginBottom: '16px', // Espacement entre les cartes
}));

const ExpertItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  margin: '6px 0',
  borderRadius: '6px',
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  }
}));

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, expertsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/users/getCategories'),
          axios.get('http://localhost:8080/api/users/getAllExperts')
        ]);
        
        setCategories(categoriesRes.data.categories || []);
        setExperts(expertsRes.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getExpertsByCategory = (categoryId) => {
    return experts.filter(expert => expert.categorie && expert.categorie._id === categoryId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        Erreur lors du chargement des données: {error}
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'slate-50', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
            fontWeight: 700,
            mb: 5,
            color: 'primary.main',
            fontSize: { xs: '1.7rem', sm: '2rem' }
          }}>
            Nos Domaines d'Expertise
          </Typography>

          {/* Affichage avec flexbox pour les paires de catégories */}
          <Box display="flex" flexWrap="wrap" justifyContent="space-between">
            {categories.map((category, index) => {
              const categoryExperts = getExpertsByCategory(category._id);
              return (
                <Box 
                  key={category._id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '48%', // Prend 48% de la largeur pour chaque carte
                    marginBottom: '24px', // Marge entre les cartes
                    order: index % 2 === 0 ? 1 : 2 // Alterne l'ordre des cartes (gauche/droite)
                  }}
                >
                  <CategoryCard>
                    <CardContent sx={{ height: '100%' }}>
                      <Typography variant="h5" sx={{ mb: 1.5 }}>
                        {category.nom}
                      </Typography>
                      
                      {/* Description avec gestion des textes longs */}
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '3em' // Pour deux lignes
                        }}
                      >
                        {category.description}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        {categoryExperts.length > 0 ? (
                          categoryExperts.map((expert) => (
                            <ExpertItem key={expert._id}>
                              <Avatar
                                src={expert.image || '/images/default-expert.jpg'}
                                alt={`${expert.prenom} ${expert.nom}`}
                                sx={{ 
                                  width: 50, 
                                  height: 50, 
                                  mr: 2,
                                  border: '2px solid #fff',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Box>
                                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500 }}>
                                  {expert.prenom} {expert.nom}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Expert {category.nom}
                                </Typography>
                              </Box>
                            </ExpertItem>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Aucun expert disponible actuellement
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CategoryCard>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CategoriesPage;
