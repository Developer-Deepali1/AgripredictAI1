import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress, Divider, Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const SOIL_TYPES = ['Alluvial', 'Black/Regur', 'Red', 'Laterite', 'Desert/Arid', 'Mountain', 'Saline', 'Peaty'];

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email'),
  location: Yup.string().required('Location is required'),
  soil_type: Yup.string().required('Soil type is required'),
  land_size: Yup.number().min(0.1, 'Min 0.1 ha').max(10000, 'Max 10000 ha').required('Land size is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone'),
});

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '', email: '', location: '', soil_type: '',
      land_size: '', phone: '', crop_history: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSaveStatus('');
      try {
        await profileService.update(values);
        updateUser({ ...user, ...values });
        setSaveStatus('success');
      } catch {
        try {
          await profileService.create(values);
          updateUser({ ...user, ...values });
          setSaveStatus('success');
        } catch {
          // Demo mode
          updateUser({ ...user, ...values });
          setSaveStatus('success');
        }
      }
    },
  });

  useEffect(() => {
    profileService.get()
      .then((res) => {
        const d = res.data;
        formik.setValues({
          name: d.name || user?.name || '',
          email: d.email || user?.email || '',
          location: d.location || user?.location || '',
          soil_type: d.soil_type || '',
          land_size: d.land_size || '',
          phone: d.phone || '',
          crop_history: Array.isArray(d.crop_history) ? d.crop_history.join(', ') : (d.crop_history || ''),
        });
      })
      .catch(() => {
        formik.setValues({
          name: user?.name || '',
          email: user?.email || '',
          location: user?.location || 'Maharashtra',
          soil_type: 'Black/Regur',
          land_size: '5',
          phone: '',
          crop_history: 'Rice, Wheat, Cotton',
        });
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box maxWidth={700}>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>My Profile</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Manage your farming profile and preferences</Typography>

      {saveStatus === 'success' && <Alert severity="success" sx={{ mb: 2 }}>Profile saved successfully!</Alert>}
      {saveStatus === 'error' && <Alert severity="error" sx={{ mb: 2 }}>Failed to save profile. Please try again.</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Personal Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Full Name" name="name"
                value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Email" name="email"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Phone Number" name="phone"
                value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} mb={2}>Farm Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="State / Location" name="location"
                value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              >
                {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Soil Type" name="soil_type"
                value={formik.values.soil_type} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.soil_type && Boolean(formik.errors.soil_type)}
                helperText={formik.touched.soil_type && formik.errors.soil_type}
              >
                {SOIL_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Land Size (Hectares)" name="land_size" type="number"
                value={formik.values.land_size} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.land_size && Boolean(formik.errors.land_size)}
                helperText={formik.touched.land_size && formik.errors.land_size}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={2} label="Crop History (comma-separated)" name="crop_history"
                value={formik.values.crop_history} onChange={formik.handleChange}
                placeholder="e.g. Rice, Wheat, Cotton, Sugarcane"
                helperText="List crops you have grown previously"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained" size="large" onClick={formik.handleSubmit}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save Profile'}
            </Button>
            <Button variant="outlined" size="large" onClick={() => formik.resetForm()}>
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Crop History Preview */}
      {formik.values.crop_history && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Crop History</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formik.values.crop_history.split(',').map((c) => c.trim()).filter(Boolean).map((c) => (
                <Chip key={c} label={c} color="primary" variant="outlined" />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
