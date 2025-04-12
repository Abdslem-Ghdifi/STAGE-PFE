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
  Chip,
  Tooltip,
  Box,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const FormationsAdmin = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getStatusDetails = (status) => {
    switch (status) {
      case 'accepter':
        return {
          label: 'Accepté',
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'refuser':
        return {
          label: 'Refusé',
          color: 'error',
          icon: <CancelIcon fontSize="small" />
        };
      case 'encours':
        return {
          label: 'En cours',
          color: 'warning',
          icon: <PendingIcon fontSize="small" />
        };
      default:
        return {
          label: 'Statut inconnu',
          color: 'default',
          icon: <HelpIcon fontSize="small" />
        };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6" gutterBottom>
          Erreur : {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Gestion des Formations
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="tableau des formations">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Formateur</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Prix</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formations.map((formation) => {
              const status = getStatusDetails(formation.accepteParExpert);
              return (
                <TableRow
                  key={formation._id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
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
                      <Box sx={{ 
                        maxWidth: 200, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
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
                  <TableCell>{formation.prix} TND</TableCell>
                  <TableCell>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default FormationsAdmin;