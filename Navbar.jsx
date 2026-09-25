import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  FileDown, 
  UploadCloud, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  TableProperties
} from 'lucide-react';

export default function Navbar({ 
  activeDatasetName, 
  healthGrade, 
  healthScore, 
  onOpenUpload, 
  onLoadSample, 
  onExportPDF, 
  isExportingPDF,
  activeTab,
  setActiveTab
}) {
  const tabs = [
    { id: 'overview', label: 'Overview & Health' },
    { id: 'data', label: 'Data Studio & Cleaning' },
    { id: 'charts', label: 'Smart Visualizations' },
    { id: 'insights', label: 'AI Executive Briefing' },
    { id: 'forecast', label: 'ML & Predictive Studio' },
    { id: 'chat', label: 'Ask AI Analyst' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-600">
                  DataPilot AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full uppercase tracking-wider">
                  Data Analyst Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {activeDatasetName || 'No dataset loaded'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {healthScore !== undefined && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Health: {healthScore}% ({healthGrade})</span>
              </div>
            )}

            {/* Upload File CTA */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Data</span>
            </button>

            {/* Export PDF Report */}
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-700 text-slate-700 border border-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <FileDown className={`h-4 w-4 ${isExportingPDF ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Data Studio placed right beside Overview & Health */}
        {activeDatasetName && (
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-200/60 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.id === 'data' && <TableProperties className="h-3.5 w-3.5" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
