import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import UploadModal from './components/UploadModal.jsx';
import HealthScorecard from './components/HealthScorecard.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import SmartChartsTab from './components/SmartChartsTab.jsx';
import AiInsightsTab from './components/AiInsightsTab.jsx';
import ForecastingTab from './components/ForecastingTab.jsx';
import AskAiTab from './components/AskAiTab.jsx';
import DataStudioTab from './components/DataStudioTab.jsx';
import HiddenReportCharts from './components/HiddenReportCharts.jsx';
import html2canvas from 'html2canvas';
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp, FileText, UploadCloud } from 'lucide-react';

// Use direct backend port 5001 with fallback to relative path
// Use environment variable for production, fallback to localhost for development
const API_BASE = 'https://datapilot-ai-untl.onrender.com';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isReCleaning, setIsReCleaning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active Pipeline State
  const [datasetPayload, setDatasetPayload] = useState(null);
  const [whatIfResult, setWhatIfResult] = useState(null);

  const loadSampleDataset = async (sampleName) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let res;
      res = await fetch(`${API_BASE}/api/samples/${sampleName}`, { method: 'POST' });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText || 'Failed to load sample dataset';
        try { const j = JSON.parse(errText); errMsg = j.error || errMsg; } catch(e){}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setDatasetPayload(data);
      setWhatIfResult(data.whatIf);
      setIsUploadOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error loading sample dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      let res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        let errMsg = 'Failed to process file';
        const errText = await res.text();
        try {
          const errorData = JSON.parse(errText);
          errMsg = errorData.error || errMsg;
        } catch (_) {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setDatasetPayload(data);
      setWhatIfResult(data.whatIf);
      setIsUploadOpen(false);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to analyze uploaded file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReClean = async (cleanOptions) => {
    if (!datasetPayload) return;
    setIsReCleaning(true);
    try {
      const url = `${API_BASE}/api/clean`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanOptions })
      });
      if (!res.ok) throw new Error('Re-cleaning data failed.');
      const data = await res.json();
      setDatasetPayload(data);
      setWhatIfResult(data.whatIf);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to re-clean dataset.');
    } finally {
      setIsReCleaning(false);
    }
  };

  const handleReForecast = async (options) => {
    if (!datasetPayload?.analysis?.timeSeriesData) return;
    try {
      const res = await fetch(`${API_BASE}/api/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSeriesData: datasetPayload.analysis.timeSeriesData,
          options
        })
      });
      if (!res.ok) throw new Error('Forecast failed.');
      const forecastResult = await res.json();
      setDatasetPayload(prev => ({
        ...prev,
        forecast: forecastResult
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateWhatIf = async (adjustments) => {
    if (!datasetPayload) return;
    try {
      const res = await fetch(`${API_BASE}/api/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMetric: datasetPayload.analysis.primaryColumns.metric,
          adjustments
        })
      });
      if (!res.ok) throw new Error('What-if simulation failed.');
      const result = await res.json();
      setWhatIfResult(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    if (!datasetPayload) return;
    setIsExportingPDF(true);
    try {
      // Capture high-resolution graphical charts for embedding in PDF
      const charts = {};
      const trendEl = document.getElementById('report-chart-trend');
      const catEl = document.getElementById('report-chart-category');
      const forecastEl = document.getElementById('report-chart-forecast');

      if (trendEl) {
        try {
          const c1 = await html2canvas(trendEl, { scale: 2, backgroundColor: '#ffffff', logging: false });
          charts.trendChart = c1.toDataURL('image/png');
        } catch (e) {
          console.warn('Trend chart capture skipped:', e);
        }
      }

      if (catEl) {
        try {
          const c2 = await html2canvas(catEl, { scale: 2, backgroundColor: '#ffffff', logging: false });
          charts.categoryChart = c2.toDataURL('image/png');
        } catch (e) {
          console.warn('Category chart capture skipped:', e);
        }
      }

      if (forecastEl) {
        try {
          const c3 = await html2canvas(forecastEl, { scale: 2, backgroundColor: '#ffffff', logging: false });
          charts.forecastChart = c3.toDataURL('image/png');
        } catch (e) {
          console.warn('Forecast chart capture skipped:', e);
        }
      }

      const res = await fetch(`${API_BASE}/api/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: datasetPayload.filename,
          audit: datasetPayload.audit,
          analysis: datasetPayload.analysis,
          insights: datasetPayload.insights,
          forecast: datasetPayload.forecast,
          clusters: datasetPayload.clusters,
          charts
        })
      });

      if (!res.ok) throw new Error('Failed to generate PDF.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataPilot_AI_Executive_Report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report: ' + err.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Navigation */}
      <Navbar
        activeDatasetName={datasetPayload?.filename}
        healthGrade={datasetPayload?.audit?.healthGrade}
        healthScore={datasetPayload?.audit?.healthScore}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={loadSampleDataset}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadSampleDataset('sales')}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-semibold whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Health Scorecard */}
        {datasetPayload?.audit && (
          <HealthScorecard
            audit={datasetPayload.audit}
            schema={datasetPayload.schema}
          />
        )}

        {/* Tab Content Rendering */}
        {datasetPayload ? (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                analysis={datasetPayload.analysis}
                audit={datasetPayload.audit}
                insights={datasetPayload.insights}
                schema={datasetPayload.schema}
                dataset={datasetPayload.cleanedDataSample}
                onGoToDataStudio={() => setActiveTab('data')}
              />
            )}

            {activeTab === 'data' && (
              <DataStudioTab
                dataset={datasetPayload.cleanedDataSample}
                audit={datasetPayload.audit}
                schema={datasetPayload.schema}
                onReClean={handleReClean}
                isReCleaning={isReCleaning}
              />
            )}

            {activeTab === 'charts' && (
              <SmartChartsTab
                analysis={datasetPayload.analysis}
                data={datasetPayload.cleanedDataSample}
                schema={datasetPayload.schema}
              />
            )}

            {activeTab === 'insights' && (
              <AiInsightsTab
                insights={datasetPayload.insights}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastingTab
                forecast={datasetPayload.forecast}
                analysis={datasetPayload.analysis}
                clusters={datasetPayload.clusters}
                featureImportance={datasetPayload.featureImportance}
                onReForecast={handleReForecast}
                onSimulateWhatIf={handleSimulateWhatIf}
                whatIfResult={whatIfResult}
              />
            )}

            {activeTab === 'chat' && (
              <AskAiTab
                dataset={datasetPayload.cleanedDataSample}
                schema={datasetPayload.schema}
                analysis={datasetPayload.analysis}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-3xl mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-slate-800/80 border border-slate-200 flex items-center justify-center text-blue-400 mb-6 shadow-sm">
              <Sparkles className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              DataPilot AI Analytics Platform
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-2xl leading-relaxed">
              Upload your raw enterprise data and let our autonomous AI instantly clean, analyze, visualize, and generate professional PDF executive reports. Supports CSV and Excel (.xlsx, .xls) formats.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all text-sm flex items-center gap-2"
              >
                <UploadCloud className="h-5 w-5" />
                Upload Dataset
              </button>
              <button
                onClick={() => loadSampleDataset('sales')}
                className="px-8 py-3.5 rounded-xl font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 shadow-sm transition-all text-sm flex items-center gap-2"
              >
                View Live Demo
              </button>
            </div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">Automated Cleaning</h3>
                <p className="text-sm text-slate-500">Instantly drops duplicates, imputes missing values, and checks data health automatically.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">Machine Learning</h3>
                <p className="text-sm text-slate-500">Built-in AutoML forecasts trends with 95% confidence bands and K-means clustering.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl">
                <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-400 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">Executive Reports</h3>
                <p className="text-sm text-slate-500">Generates pixel-perfect, 4-page PDF dossiers with vector charts and narrative insights.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden High-Res Chart Renderer for PDF Generation */}
        {datasetPayload && (
          <HiddenReportCharts
            analysis={datasetPayload.analysis}
            forecast={datasetPayload.forecast}
          />
        )}

      </main>

      {/* Upload & Sample Selector Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileUpload={handleFileUpload}
        onLoadSample={loadSampleDataset}
        isLoading={isLoading}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DataPilot AI — Autonomous Statistical Machine Learning Platform</span>
          <span className="font-mono text-slate-600">Built with Node.js & React</span>
        </div>
      </footer>

    </div>
  );
}
