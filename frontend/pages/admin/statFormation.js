'use client'; // Important for Next.js 13+ with MUI

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  PieChart 
} from '@mui/x-charts';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Button,
  Box
} from '@mui/material';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('adminToken');

    if (typeof window !== 'undefined' && !token) {
      router.push('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/formation/stats', {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          withCredentials: true,
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Invalid server response');
        }

        setStats(response.data.data);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        
        if (err.response?.status === 401 || err.message?.includes('token')) {
          Cookies.remove('adminToken');
          router.push('/admin/login');
          return;
        }

        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ 
          bgcolor: 'error.light',
          borderLeft: 4,
          borderColor: 'error.main',
          color: 'error.dark',
          p: 2,
          mb: 2
        }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Courses
              </Typography>
              <Typography variant="h3">
                {stats?.totalFormations || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Price
              </Typography>
              <Typography variant="h3">
                {stats?.moyennePrix ? stats.moyennePrix.toFixed(2) : '0.00'} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h3">
                {stats?.formationsParStatut?.encours || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Status
              </Typography>
              <BarChart
                series={[
                  {
                    data: [
                      stats?.formationsParStatut?.encours || 0,
                      stats?.formationsParStatut?.acceptees || 0,
                      stats?.formationsParStatut?.refusees || 0
                    ]
                  }
                ]}
                height={300}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: ['Pending', 'Approved', 'Rejected']
                  }
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories Distribution
              </Typography>
              <PieChart
                series={[
                  {
                    data: Object.entries(stats?.categories || {}).map(([label, value]) => ({
                      id: label,
                      value,
                      label
                    }))
                  }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Courses
          </Typography>
          <List>
            {stats?.dernieresFormations?.length > 0 ? (
              stats.dernieresFormations.map((formation, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemText
                      primary={formation.titre}
                      secondary={
                        <>
                          <span style={{ marginRight: '0.5rem' }}>{formation.categorie || 'Uncategorized'}</span>
                          <span style={{ marginRight: '0.5rem' }}>| {formation.formateur || 'Unknown instructor'}</span>
                          <span style={{ marginRight: '0.5rem' }}>| {formation.prix} €</span>
                          <span>| Status: {formation.statut}</span>
                        </>
                      }
                    />
                  </ListItem>
                  {index < stats.dernieresFormations.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No recent courses available" />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;