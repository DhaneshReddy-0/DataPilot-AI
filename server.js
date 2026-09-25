import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { parseUploadedFile } from './parser.js';
import { cleanData } from './cleaner.js';
import { analyzeData } from './analyzer.js';
import { forecastTimeSeries, simulateScenario, performKMeansClustering, calculateFeatureImportance, runAutoMLTournament } from './predictor.js';
import { generateInsights, answerDataQuestion } from './insights.js';
import { generatePDFReport } from './pdfGenerator.js';
import { SAMPLE_DATASETS } from './sampleData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration allowing all origins and methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Friendly status route for backend root
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'DataPilot AI Backend API',
    version: '1.0.0',
    message: 'Backend server is active and running perfectly.'
  });
});

// Multer storage in memory up to 50MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

/**
 * Helper to process raw records through the entire pipeline:
 * Clean -> Analyze -> ML Forecast -> Clustering -> Feature Importance -> Insights
 */
function processPipeline(rawData, filename = 'Dataset', cleanOptions = {}) {
  // 1. Data Cleaning & Hygiene Audit
  const { cleanedData, schema, audit } = cleanData(rawData, cleanOptions);

  // 2. Statistical Analysis
  const analysis = analyzeData(cleanedData, schema);

  // 3. Predictive ML Forecasting & AutoML
  let forecast = null;
  if (analysis.timeSeriesData && analysis.timeSeriesData.length >= 3) {
    forecast = forecastTimeSeries(analysis.timeSeriesData, {
      horizon: 10,
      targetKey: 'total',
      dateKey: 'date'
    });
  } else if (cleanedData.length >= 3 && analysis.primaryColumns.metric) {
    const sequential = cleanedData.slice(0, 50).map((r, i) => ({
      date: `Record #${i + 1}`,
      total: parseFloat(String(r[analysis.primaryColumns.metric]).replace(/[$,%]/g, '')) || 0
    }));
    forecast = forecastTimeSeries(sequential, { horizon: 10 });
  }

  // 4. K-Means Clustering (Persona / Record Segmentation)
  const numericCols = analysis.primaryColumns.numericCols || [];
  let clusters = null;
  if (cleanedData.length >= 4 && numericCols.length >= 2) {
    clusters = performKMeansClustering(cleanedData, numericCols.slice(0, 4), 3);
  }

  // 5. Machine Learning Feature Importance
  let featureImportance = [];
  if (analysis.primaryColumns.metric && numericCols.length >= 2) {
    featureImportance = calculateFeatureImportance(cleanedData, analysis.primaryColumns.metric, numericCols);
  }

  // 6. AI Insights & Narrative
  const insights = generateInsights(analysis, audit, cleanedData);

  // 7. Initial What-If Simulation
  const whatIf = simulateScenario(cleanedData, analysis.primaryColumns.metric, {
    [analysis.primaryColumns.metric]: 10
  });

  return {
    filename,
    rawDataCount: rawData.length,
    audit,
    schema,
    analysis,
    forecast,
    clusters,
    featureImportance,
    insights,
    whatIf,
    cleanedDataSample: cleanedData.slice(0, 10000),
    totalCleanedRows: cleanedData.length
  };
}

let currentActiveSession = null;

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'DataPilot AI Data Analyst API' });
});

// File Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[Upload] Processing ${req.file.originalname} (${req.file.size} bytes)`);
    const rawRecords = parseUploadedFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    console.log(`[Upload] Parsed ${rawRecords.length} records successfully.`);

    const result = processPipeline(rawRecords, req.file.originalname);
    currentActiveSession = {
      rawRecords,
      cleanedData: result.cleanedDataSample,
      lastResult: result
    };

    res.json(result);
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to process file' });
  }
});

// Load Built-in Sample Datasets
app.post('/api/samples/:name', (req, res) => {
  try {
    const datasetName = req.params.name?.toLowerCase();
    const rawRecords = SAMPLE_DATASETS[datasetName];

    if (!rawRecords) {
      return res.status(404).json({ error: `Sample dataset "${datasetName}" not found.` });
    }

    const result = processPipeline(rawRecords, `Sample_${datasetName.toUpperCase()}`);
    currentActiveSession = {
      rawRecords,
      cleanedData: result.cleanedDataSample,
      lastResult: result
    };

    res.json(result);
  } catch (err) {
    console.error('[Sample Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to load sample dataset' });
  }
});

// Re-clean Data with Custom Options
app.post('/api/clean', (req, res) => {
  try {
    const { cleanOptions, dataset } = req.body;
    const records = dataset || currentActiveSession?.rawRecords;

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'No active dataset available to re-clean.' });
    }

    const result = processPipeline(records, currentActiveSession?.lastResult?.filename || 'Dataset', cleanOptions);
    currentActiveSession.lastResult = result;

    res.json(result);
  } catch (err) {
    console.error('[Clean Error]:', err);
    res.status(500).json({ error: err.message || 'Data cleaning failed.' });
  }
});

// Custom Forecast Endpoint
app.post('/api/forecast', (req, res) => {
  try {
    const { timeSeriesData, options } = req.body;
    const dataToForecast = timeSeriesData || currentActiveSession?.lastResult?.analysis?.timeSeriesData;

    if (!dataToForecast || dataToForecast.length === 0) {
      return res.status(400).json({ error: 'Insufficient time series data for forecasting.' });
    }

    const result = forecastTimeSeries(dataToForecast, options);
    res.json(result);
  } catch (err) {
    console.error('[Forecast Error]:', err);
    res.status(500).json({ error: err.message || 'Forecasting failed.' });
  }
});

// K-Means Clustering Endpoint
app.post('/api/ml/cluster', (req, res) => {
  try {
    const { features, k = 3, data } = req.body;
    const records = data || currentActiveSession?.rawRecords;
    const numericCols = features || currentActiveSession?.lastResult?.analysis?.primaryColumns?.numericCols;

    if (!records || records.length < k || !numericCols || numericCols.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 numeric features and adequate records for clustering.' });
    }

    const clusterResult = performKMeansClustering(records, numericCols, parseInt(k, 10));
    res.json(clusterResult);
  } catch (err) {
    console.error('[Cluster Error]:', err);
    res.status(500).json({ error: err.message || 'Clustering failed.' });
  }
});

// What-If Scenario Simulation
app.post('/api/what-if', (req, res) => {
  try {
    const { targetMetric, adjustments, data } = req.body;
    const activeData = data || currentActiveSession?.rawRecords;
    const metric = targetMetric || currentActiveSession?.lastResult?.analysis?.primaryColumns?.metric;

    if (!activeData || !metric) {
      return res.status(400).json({ error: 'Missing target metric or data for scenario simulation.' });
    }

    const result = simulateScenario(activeData, metric, adjustments || {});
    res.json(result);
  } catch (err) {
    console.error('[What-If Error]:', err);
    res.status(500).json({ error: err.message || 'Scenario simulation failed.' });
  }
});

// Ask AI / Natural Language Query Engine
app.post('/api/ask', (req, res) => {
  try {
    const { question, dataset, schema, analysis } = req.body;
    const activeData = dataset || currentActiveSession?.rawRecords;
    const activeSchema = schema || currentActiveSession?.lastResult?.schema;
    const activeAnalysis = analysis || currentActiveSession?.lastResult?.analysis;

    if (!activeData || !question) {
      return res.status(400).json({ error: 'Please provide a question and dataset.' });
    }

    const answerPayload = answerDataQuestion(question, activeData, activeSchema, activeAnalysis);
    res.json(answerPayload);
  } catch (err) {
    console.error('[Ask Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to answer data question.' });
  }
});

// PDF Report Download
app.post('/api/export-pdf', (req, res) => {
  try {
    const reportData = req.body || currentActiveSession?.lastResult;

    if (!reportData || !reportData.analysis) {
      return res.status(400).json({ error: 'No report data provided.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DataPilot_AI_Analyst_Report_${Date.now()}.pdf"`);

    generatePDFReport(reportData, res);
  } catch (err) {
    console.error('[PDF Export Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to generate PDF.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DataPilot AI Data Analyst Agent backend running on http://localhost:${PORT}`);
});
