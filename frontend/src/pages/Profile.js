import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress, Divider, Chip, Switch, FormControlLabel,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ALL_STATES, getDistricts, getLocalAreas } from '../data/locationData';

const SOIL_TYPES = ['Alluvial', 'Black/Regur', 'Red', 'Laterite', 'Desert/Arid', 'Mountain', 'Saline', 'Peaty'];

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email'),
  location: Yup.string().required('State is required'),
  district: Yup.string().required('District is required'),
  local_area: Yup.string().required('Local Area is required'),
  soil_type: Yup.string().required('Soil type is required'),
  land_size: Yup.number().min(0.1, 'Min 0.1 ha').max(10000, 'Max 10000 ha').required('Land size is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone'),
});

export default function Profile() {
  const { user, updateUser, saveUserProfile, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('HIGH');

  const formik = useFormik({
    initialValues: {
      name: '', email: '', location: '', district: '', local_area: '',
      soil_type: '', land_size: '', phone: '', crop_history: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSaveStatus('');
      const fullProfile = {
        ...values,
        notify_email: notifyEmail,
        notify_sms: notifySms,
        alert_threshold: alertThreshold,
      };
      try {
        await profileService.update(fullProfile);
      } catch {
        try {
          await profileService.create(fullProfile);
        } catch {
          // Demo mode – proceed with local save
        }
      }
      updateUser({ ...user, ...values });
      saveUserProfile(fullProfile);
      setSaveStatus('success');
    },
  });

  // Derived district and local area lists based on current form values
  const districts = getDistricts(formik.values.location);
  const localAreas = getLocalAreas(formik.values.location, formik.values.district);

  // Reset district + local area when state changes
  const handleStateChange = (e) => {
    formik.setFieldValue('location', e.target.value);
    formik.setFieldValue('district', '');
    formik.setFieldValue('local_area', '');
  };

  // Reset local area when district changes
  const handleDistrictChange = (e) => {
    formik.setFieldValue('district', e.target.value);
    formik.setFieldValue('local_area', '');
  };

  useEffect(() => {
    const loadProfile = (d) => {
      formik.setValues({
        name: d.name || user?.name || '',
        email: d.email || user?.email || '',
        location: d.location || user?.location || '',
        district: d.district || '',
        local_area: d.local_area || '',
        soil_type: d.soil_type || '',
        land_size: d.land_size || '',
        phone: d.phone || '',
        crop_history: Array.isArray(d.crop_history) ? d.crop_history.join(', ') : (d.crop_history || ''),
      });
      setNotifyEmail(Boolean(d.notify_email));
      setNotifySms(Boolean(d.notify_sms));
      setAlertThreshold(d.alert_threshold || 'HIGH');
    };

    // Use locally saved profile first if available
    if (userProfile) {
      loadProfile(userProfile);
      setLoading(false);
      return;
    }

    profileService.get()
      .then((res) => loadProfile(res.data))
      .catch(() => {
        loadProfile({
          name: user?.name || '',
          email: user?.email || '',
          location: user?.location || 'Maharashtra',
          district: 'Pune',
          local_area: 'Pune City',
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
    <Box maxWidth={750}>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>My Profile</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Manage your farming profile and location preferences</Typography>

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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Location (State → District → Local Area)</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="State" name="location"
                value={formik.values.location} onChange={handleStateChange} onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                {ALL_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="District" name="district"
                value={formik.values.district} onChange={handleDistrictChange} onBlur={formik.handleBlur}
                error={formik.touched.district && Boolean(formik.errors.district)}
                helperText={formik.touched.district && formik.errors.district}
                disabled={!formik.values.location}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                {districts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                {formik.values.district && !districts.includes(formik.values.district) && (
                  <MenuItem key={formik.values.district} value={formik.values.district}>{formik.values.district}</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="Local Area / Taluk" name="local_area"
                value={formik.values.local_area} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.local_area && Boolean(formik.errors.local_area)}
                helperText={formik.touched.local_area && formik.errors.local_area}
                disabled={!formik.values.district}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                {localAreas.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                {formik.values.local_area && !localAreas.includes(formik.values.local_area) && (
                  <MenuItem key={formik.values.local_area} value={formik.values.local_area}>{formik.values.local_area}</MenuItem>
                )}
              </TextField>
            </Grid>
          </Grid>

          {formik.values.location && formik.values.district && formik.values.local_area && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main" fontWeight={600}>
                Active Location: {formik.values.local_area}, {formik.values.district}, {formik.values.location}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} mb={2}>Farm Details</Typography>
          <Grid container spacing={2}>
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

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Notification Preferences</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, border: 1, borderColor: notifyEmail ? 'primary.main' : 'divider', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Switch checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} color="primary" />}
                  label={<Typography fontWeight={600}>Email Notifications</Typography>}
                />
                <Typography variant="body2" color="text.secondary" ml={4}>
                  Send alerts at or above your threshold to {formik.values.email || 'your email'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, border: 1, borderColor: notifySms ? 'primary.main' : 'divider', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Switch checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} color="primary" />}
                  label={<Typography fontWeight={600}>SMS Notifications</Typography>}
                />
                <Typography variant="body2" color="text.secondary" ml={4}>
                  Send alerts at or above your threshold to {formik.values.phone || 'your phone'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Alert Threshold" value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                helperText="Notify for alerts at or above this severity"
              >
                {['HIGH', 'MEDIUM', 'LOW'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
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
