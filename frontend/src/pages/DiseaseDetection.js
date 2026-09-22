import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Chip, LinearProgress, CircularProgress, Button, Divider, Alert,
  Stack, Tabs, Tab
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpaIcon from '@mui/icons-material/Spa';
import ScienceIcon from '@mui/icons-material/Science';
import HealingIcon from '@mui/icons-material/Healing';
import ShieldIcon from '@mui/icons-material/Shield';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import { diseaseService } from '../services/api';

const CROPS = ['Auto-Detect', 'Rice', 'Wheat', 'Corn', 'Potato', 'Tomato', 'Cotton'];

const DEFAULT_SAMPLES = [
  {
    id: 'rice_blast',
    label: 'Rice Blast',
    crop: 'Rice',
    pathogen: 'Magnaporthe oryzae',
    image_url: '/leaf_samples/rice_blast.jpg',
    description: 'Spindle-shaped necrotic lesions with grey centers',
    severity_estimate: 'MODERATE',
  },
  {
    id: 'wheat_yellow_rust',
    label: 'Wheat Stripe Rust',
    crop: 'Wheat',
    pathogen: 'Puccinia striiformis',
    image_url: '/leaf_samples/wheat_rust.jpg',
    description: 'Bright yellow pustules in parallel linear stripes',
    severity_estimate: 'SEVERE',
  },
  {
    id: 'corn_blight',
    label: 'Corn Leaf Blight',
    crop: 'Corn',
    pathogen: 'Exserohilum turcicum',
    image_url: '/leaf_samples/corn_blight.jpg',
    description: 'Long elliptical cigar-shaped grayish-tan lesions',
    severity_estimate: 'MODERATE',
  },
  {
    id: 'potato_late_blight',
    label: 'Potato Late Blight',
    crop: 'Potato',
    pathogen: 'Phytophthora infestans',
    image_url: '/leaf_samples/potato_blight.jpg',
    description: 'Dark water-soaked necrotic patches with pale margins',
    severity_estimate: 'SEVERE',
  },
  {
    id: 'tomato_early_blight',
    label: 'Tomato Early Blight',
    crop: 'Tomato',
    pathogen: 'Alternaria solani',
    image_url: '/leaf_samples/tomato_early_blight.jpg',
    description: 'Concentric target-board rings with yellow halos',
    severity_estimate: 'MODERATE',
  },
  {
    id: 'cotton_bacterial_blight',
    label: 'Cotton Angular Spot',
    crop: 'Cotton',
    pathogen: 'Xanthomonas citri',
    image_url: '/leaf_samples/cotton_blight.jpg',
    description: 'Angular water-soaked spots bounded by leaf veins',
    severity_estimate: 'MILD',
  },
  {
    id: 'rice_healthy',
    label: 'Healthy Rice Leaf',
    crop: 'Rice',
    pathogen: 'Clean / Disease-Free',
    image_url: '/leaf_samples/healthy_rice.jpg',
    description: 'Pristine chlorophyll-rich upright rice foliage',
    severity_estimate: 'HEALTHY',
  },
];

export default function DiseaseDetection() {
  const [selectedCrop, setSelectedCrop] = useState('Auto-Detect');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // 'original' | 'heatmap'
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [samples, setSamples] = useState(DEFAULT_SAMPLES);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchSamples();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await diseaseService.getHistory(10);
      if (res.data) setHistory(res.data);
    } catch (err) {
      console.warn('Could not fetch diagnosis history:', err.message);
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await diseaseService.getSamples();
      if (res.data && Array.isArray(res.data)) {
        setSamples(res.data);
      }
    } catch (err) {
      console.warn('Could not load samples from backend, using defaults:', err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    setSelectedFile(file);
    setError(null);
    setDiagnosis(null);
    setFeedbackSent(false);
    setFeedbackSuccess('');

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleAnalyze = async (sampleData = null) => {
    setLoading(true);
    setError(null);
    setFeedbackSent(false);
    setFeedbackSuccess('');

    try {
      let fileToUpload = selectedFile;

      // If testing sample button, fetch real photographic image from backend public folder
      if (sampleData) {
        setSelectedCrop(sampleData.crop);
        setPreviewUrl(sampleData.image_url);
        try {
          const resp = await fetch(sampleData.image_url);
          const blob = await resp.blob();
          fileToUpload = new File([blob], `${sampleData.id}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(fileToUpload);
        } catch (fetchErr) {
          console.error('Failed to load sample image:', fetchErr);
        }
      }

      if (!fileToUpload) {
        setError('Please upload or select a leaf photo to diagnose.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      const targetCrop = sampleData ? sampleData.crop : selectedCrop;
      if (targetCrop && targetCrop !== 'Auto-Detect') {
        formData.append('crop', targetCrop);
      }

      const res = await diseaseService.predict(formData);
      setDiagnosis(res.data);
      fetchHistory();
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(err.response?.data?.detail || 'Diagnosis failed. Please ensure your image is a clear leaf photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isCorrect) => {
    if (!diagnosis?.prediction_id || feedbackSent) return;
    try {
      await diseaseService.submitFeedback({
        prediction_id: diagnosis.prediction_id,
        feedback: isCorrect ? 'CORRECT' : 'INCORRECT',
        notes: isCorrect ? 'Farmer confirmed accurate diagnosis' : 'Farmer flagged discrepancy',
      });
      setFeedbackSent(true);
      setFeedbackSuccess(
        isCorrect
          ? 'Thank you! Confirmed diagnosis recorded.'
          : 'Thank you! Your feedback will help refine model accuracy.'
      );
      fetchHistory();
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const getSeverityChip = (grade) => {
    switch (grade) {
      case 'HEALTHY':
        return <Chip label="HEALTHY" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case 'MILD':
        return <Chip label="MILD INFECTION" color="info" size="small" sx={{ fontWeight: 700 }} />;
      case 'MODERATE':
        return <Chip label="MODERATE INFECTION" color="warning" size="small" sx={{ fontWeight: 700 }} />;
      case 'SEVERE':
        return <Chip label="SEVERE OUTBREAK" color="error" size="small" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={grade || 'ACTIVE'} size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1350, mx: 'auto' }}>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <SpaIcon color="success" sx={{ fontSize: 38 }} />
          <Typography variant="h4" fontWeight={700}>
            Crop Doctor — Leaf Disease Scanner
          </Typography>
          <Chip
            icon={<AutoAwesomeIcon />}
            label="Grad-CAM Visual Heatmap"
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<LocalHospitalIcon />}
            label="Organic & Bio Treatment Engine"
            color="success"
            variant="outlined"
            size="small"
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Computer vision diagnosis for field crops (Rice, Wheat, Corn, Potato, Tomato, Cotton). Detects disease pathologies, visualizes lesion saliency heatmaps, and prescribes agronomic organic bio-treatments.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Left Column: Upload & Image Control ── */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Upload Leaf Photo
              </Typography>

              {/* Crop hint selector */}
              <TextField
                select
                fullWidth
                label="Target Crop"
                size="small"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                sx={{ mb: 2 }}
              >
                {CROPS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>

              {/* Dropzone */}
              <Box
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: previewUrl ? 'success.main' : 'primary.light',
                  borderRadius: 2.5,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: previewUrl ? 'rgba(76, 175, 80, 0.04)' : 'rgba(33, 150, 243, 0.03)',
                  transition: 'all 0.25s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={viewMode === 'heatmap' && diagnosis?.gradcam_image ? diagnosis.gradcam_image : previewUrl}
                      alt="Leaf Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 280,
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Click or drag a new image to replace
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 3 }}>
                    <CloudUploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Drag & Drop leaf photo here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      or click to browse from your device
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                      Supports JPEG, PNG, WEBP (Clear leaf close-up recommended)
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* View mode toggle if heatmap exists */}
              {diagnosis?.gradcam_image && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Tabs
                    value={viewMode}
                    onChange={(e, val) => setViewMode(val)}
                    textColor="primary"
                    indicatorColor="primary"
                  >
                    <Tab value="heatmap" label="Grad-CAM Heatmap" icon={<AutoAwesomeIcon />} iconPosition="start" />
                    <Tab value="original" label="Original Leaf" icon={<VisibilityIcon />} iconPosition="start" />
                  </Tabs>
                </Box>
              )}

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || !selectedFile}
                  onClick={() => handleAnalyze()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
                  sx={{ borderRadius: 2, py: 1.2, fontWeight: 600 }}
                >
                  {loading ? 'Diagnosing Pathology...' : 'Scan & Diagnose Leaf'}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => cameraInputRef.current?.click()}
                  startIcon={<PhotoCameraIcon />}
                  sx={{ borderRadius: 2, py: 1.2, fontWeight: 600, minWidth: 140 }}
                >
                  Camera
                </Button>
              </Stack>

              {/* Curated Authentic Field Samples Gallery */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
                  Curated Field Samples (Real Leaf Photos):
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Click any authentic field photo below to test instant diagnostic detection:
                </Typography>

                <Grid container spacing={1.5}>
                  {samples.map((s) => (
                    <Grid item xs={6} sm={4} key={s.id}>
                      <Box
                        onClick={() => handleAnalyze(s)}
                        sx={{
                          p: 1,
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          cursor: 'pointer',
                          textAlign: 'center',
                          bgcolor: '#FAFAFA',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(33, 150, 243, 0.05)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={s.image_url}
                          alt={s.label}
                          sx={{
                            width: '100%',
                            height: 70,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            mb: 0.5,
                          }}
                        />
                        <Typography variant="caption" fontWeight={700} display="block" noWrap>
                          {s.label}
                        </Typography>
                        <Chip
                          label={s.crop}
                          size="small"
                          sx={{ height: 16, fontSize: 9, mt: 0.3 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* ── Recent Diagnosis History ── */}
          {history.length > 0 && (
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <HistoryIcon color="action" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Recent Diagnosis History
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={1}>
                  {history.slice(0, 5).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: 'background.default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.crop}: {item.predicted_disease}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      {item.feedback && (
                        <Chip
                          label={item.feedback}
                          size="small"
                          color={item.feedback === 'CORRECT' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* ── Right Column: Diagnosis Results & Remedies ── */}
        <Grid item xs={12} md={7}>
          {diagnosis ? (
            <Stack spacing={3}>
              {/* Primary Diagnostic Banner */}
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: '6px solid',
                  borderColor: diagnosis.is_healthy ? 'success.main' : 'error.main',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Chip
                        label={diagnosis.crop}
                        size="small"
                        color="default"
                        sx={{ mb: 0.5, fontWeight: 600 }}
                      />
                      <Typography variant="h5" fontWeight={700} color={diagnosis.is_healthy ? 'success.main' : 'text.primary'}>
                        {diagnosis.predicted_disease}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {getSeverityChip(diagnosis.severity_grade)}
                      <Chip
                        icon={diagnosis.is_healthy ? <CheckCircleIcon /> : <WarningAmberIcon />}
                        label={diagnosis.is_healthy ? 'Healthy Leaf' : 'Pathology Detected'}
                        color={diagnosis.is_healthy ? 'success' : 'error'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>

                  {/* Confidence & Affected Area Gauges */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">
                            Diagnosis Confidence
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="primary.main">
                            {(diagnosis.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={diagnosis.confidence * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: diagnosis.confidence > 0.7 ? 'success.main' : 'warning.main',
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">
                            Affected Leaf Area
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color={diagnosis.affected_area_pct > 15 ? 'error.main' : 'warning.main'}>
                            {diagnosis.affected_area_pct?.toFixed(1) || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (diagnosis.affected_area_pct || 0) * 2)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: diagnosis.affected_area_pct > 20 ? 'error.main' : diagnosis.affected_area_pct > 5 ? 'warning.main' : 'info.main',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Weather Risk Correlation Alert */}
                  {diagnosis.weather_risk_note && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.08)', border: '1px solid rgba(255, 152, 0, 0.3)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <WbSunnyIcon color="warning" />
                      <Typography variant="body2" color="warning.dark">
                        <strong>Weather Risk Correlation:</strong> {diagnosis.weather_risk_note}
                      </Typography>
                    </Box>
                  )}

                  {/* Class Probabilities Distribution */}
                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom>
                      Class Probability Distribution:
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      {Object.entries(diagnosis.probabilities || {}).map(([className, prob]) => (
                        <Grid item xs={6} sm={4} key={className}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" noWrap display="block" fontWeight={500}>
                              {className.replace(/^[A-Za-z]+_/, '').replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {(prob * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>

              {/* Symptoms & Cause */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon color="primary" /> Disease Symptoms & Pathology
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    <strong>Symptoms:</strong> {diagnosis.symptoms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Primary Cause:</strong> {diagnosis.cause}
                  </Typography>
                </CardContent>
              </Card>

              {/* Actionable Treatment Protocol */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealingIcon color="success" /> Agronomic Remediation Protocol
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  {/* Organic Treatment */}
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderLeft: '4px solid', borderColor: 'success.main' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="success.dark" gutterBottom>
                      🌿 Organic & Bio-Fungicide Solution (First-Line Remedy)
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {diagnosis.treatment?.organic_remedy}
                    </Typography>
                    {diagnosis.treatment?.dosages && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        <strong>Dilution & Dosage:</strong> {diagnosis.treatment.dosages}
                      </Typography>
                    )}
                  </Box>

                  {/* Chemical Backup */}
                  {!diagnosis.is_healthy && (
                    <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.08)', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                      <Typography variant="subtitle2" fontWeight={700} color="warning.dark" gutterBottom>
                        ⚠️ Chemical Fallback (Severe Outbreak Only)
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {diagnosis.treatment?.chemical_backup}
                      </Typography>
                    </Box>
                  )}

                  {/* Prevention Guidelines */}
                  {diagnosis.treatment?.prevention_tips?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ShieldIcon fontSize="small" color="action" /> Cultural Prevention & Field Hygiene
                      </Typography>
                      <Stack spacing={0.5}>
                        {diagnosis.treatment.prevention_tips.map((tip, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            • {tip}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Farmer Active Learning Feedback Card */}
              <Card sx={{ borderRadius: 3, p: 1, bgcolor: 'rgba(33, 150, 243, 0.04)', border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Was this diagnosis accurate for your crop?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Your feedback trains and strengthens the model's accuracy on field conditions.
                  </Typography>

                  {feedbackSuccess ? (
                    <Alert severity="success" sx={{ mx: 'auto', maxWidth: 450 }}>
                      {feedbackSuccess}
                    </Alert>
                  ) : (
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ThumbUpAltIcon />}
                        onClick={() => handleFeedback(true)}
                        disabled={feedbackSent}
                        sx={{ px: 3, borderRadius: 2 }}
                      >
                        Yes, Correct
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<ThumbDownAltIcon />}
                        onClick={() => handleFeedback(false)}
                        disabled={feedbackSent}
                        sx={{ px: 3, borderRadius: 2 }}
                      >
                        No, Incorrect
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Stack>
          ) : (
            /* Empty State */
            <Card
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <SpaIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                No Leaf Scanned Yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 450, mx: 'auto', mt: 1 }}>
                Upload a clear photo of an infected or healthy leaf (Rice, Wheat, Corn, Potato, Tomato, or Cotton) or click one of the curated field samples on the left to view instant AI disease diagnosis and visual Grad-CAM heatmap.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
