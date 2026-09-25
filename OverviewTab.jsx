import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  BarChart, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers
} from 'lucide-react';

export default function OverviewTab({ analysis, audit, insights, schema, dataset, onGoToDataStudio }) {
  if (!analysis) return null;

  const { descriptiveStats = {}, outliers = {}, correlationMatrix = {}, primaryColumns = {} } = analysis;
  const primaryMetric = primaryColumns?.metric;
  const stats = primaryMetric ? descriptiveStats[primaryMetric] : null;

  // Find top correlations
  const topCorrelations = [];
  if (correlationMatrix) {
    const seen = new Set();
    for (const [colA, cols] of Object.entries(correlationMatrix)) {
      for (const [colB, r] of Object.entries(cols)) {
        if (colA !== colB && Math.abs(r) >= 0.4) {
          const key = [colA, colB].sort().join('::');
          if (!seen.has(key)) {
            seen.add(key);
            topCorrelations.push({ colA, colB, r });
          }
        }
      }
    }
  }
  topCorrelations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="space-y-6">
      
      {/* Executive AI Narrative Banner */}
      {insights?.executiveSummary && (
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-cyan-500 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-400 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900">Executive AI Intelligence Summary</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-300">
                  Autonomous Synthesis
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insights.executiveSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total {primaryMetric}</span>
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {stats.sum.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              Sum across {stats.count.toLocaleString()} valid entries
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average (Mean)</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {stats.mean.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              Median baseline: <span className="text-slate-900 font-medium">{stats.median.toLocaleString()}</span>
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Min - Max Spread</span>
              <BarChart className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {stats.min.toLocaleString()} — {stats.max.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              IQR: {stats.iqr.toLocaleString()} (StdDev: {stats.stdDev.toLocaleString()})
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Outlier Anomalies</span>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {outliers[primaryMetric]?.count || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {outliers[primaryMetric]?.percentage || 0}% of records exceed IQR bounds
            </p>
          </div>

        </div>
      )}

      {/* Grid: Correlations & Outliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strong Statistical Correlations */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Key Dimension Correlations
            </h4>
            <span className="text-xs text-slate-500">Pearson Coefficient</span>
          </div>

          {topCorrelations.length > 0 ? (
            <div className="space-y-3">
              {topCorrelations.slice(0, 5).map((corr, idx) => {
                const isPositive = corr.r > 0;
                const percentage = Math.abs(corr.r) * 100;
                return (
                  <div key={idx} className="glass-panel-subtle rounded-xl p-3 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="text-slate-700">
                        {corr.colA} <span className="text-slate-500">↔</span> {corr.colB}
                      </div>
                      <div className={`flex items-center gap-1 font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {corr.r}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No strong linear correlations (|r| ≥ 0.4) detected across numeric attributes.
            </p>
          )}
        </div>

        {/* Anomaly & Outlier Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Anomaly Detection (IQR 1.5x)
            </h4>
            <span className="text-xs text-slate-500">Extreme Data Points</span>
          </div>

          {outliers[primaryMetric]?.count > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                Values outside normal threshold <span className="font-mono text-cyan-400">[{outliers[primaryMetric].lowerBound} to {outliers[primaryMetric].upperBound}]</span>:
              </div>
              <div className="flex flex-wrap gap-2">
                {outliers[primaryMetric].sampleOutliers.map((val, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  >
                    {val.toLocaleString()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Identified {outliers[primaryMetric].count} anomalous transactions. Recommend reviewing for data entry typos or VIP account behavior.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-xs">No extreme outliers detected. Data values follow standard normal variance.</p>
            </div>
          )}
        </div>

      </div>

      {/* Quick Data Studio & Cleaning Banner */}
      {onGoToDataStudio && (
        <div className="glass-panel rounded-2xl p-6 border border-cyan-200 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-400 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Data Studio & Cleaning Studio</h4>
              <p className="text-xs text-slate-500">
                Inspect raw vs cleaned records, customize imputation strategies, filter columns, or export to CSV/JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToDataStudio}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap self-start sm:self-auto"
          >
            Open Data Studio &rarr;
          </button>
        </div>
      )}

    </div>
  );
}
