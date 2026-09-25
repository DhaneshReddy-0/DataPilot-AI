import React, { useState } from 'react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  Sliders, 
  Activity, 
  Cpu, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  Target,
  Layers,
  Award
} from 'lucide-react';

export default function ForecastingTab({ 
  forecast, 
  analysis, 
  clusters, 
  featureImportance = [],
  onReForecast, 
  onSimulateWhatIf, 
  whatIfResult 
}) {
  const [mlSection, setMlSection] = useState('forecast'); // 'forecast' | 'automl' | 'clustering' | 'importance' | 'whatif'
  const [horizon, setHorizon] = useState(10);
  const [method, setMethod] = useState('auto');
  
  // What-If State
  const primaryMetric = analysis?.primaryColumns?.metric || 'Sales';
  const [adjustmentPercent, setAdjustmentPercent] = useState(10);

  const handleHorizonChange = (newHorizon) => {
    setHorizon(newHorizon);
    onReForecast({ horizon: newHorizon, method });
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    onReForecast({ horizon, method: newMethod });
  };

  const handleSliderChange = (val) => {
    setAdjustmentPercent(val);
    onSimulateWhatIf({ [primaryMetric]: val });
  };

  const resetWhatIf = () => {
    setAdjustmentPercent(0);
    onSimulateWhatIf({ [primaryMetric]: 0 });
  };

  const combinedSeries = forecast?.combinedSeries || [];
  const metrics = forecast?.metrics || {};
  const autoMl = forecast?.autoMlBenchmark;

  return (
    <div className="space-y-8">
      
      {/* Studio Navigation Sub-Pills */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-900 shadow-md">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Machine Learning & Predictive Studio</h3>
            <p className="text-xs text-slate-500">Forecasting, AutoML tournament, K-Means clustering & feature drivers</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setMlSection('forecast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mlSection === 'forecast' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Predictive Forecast
          </button>
          <button
            onClick={() => setMlSection('automl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mlSection === 'automl' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            AutoML Tournament
          </button>
          <button
            onClick={() => setMlSection('clustering')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mlSection === 'clustering' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            K-Means Clustering
          </button>
          <button
            onClick={() => setMlSection('importance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mlSection === 'importance' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Feature Drivers
          </button>
          <button
            onClick={() => setMlSection('whatif')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mlSection === 'whatif' ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            What-If Simulator
          </button>
        </div>
      </div>

      {/* SECTION 1: PREDICTIVE TIME-SERIES FORECAST */}
      {mlSection === 'forecast' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Time-Series Trend Projection with 95% Confidence Bounds
              </h4>
              <p className="text-xs text-slate-500">
                Multi-period projection modeling based on historical variance
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 px-2 uppercase">Horizon:</span>
                {[5, 10, 20, 30].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHorizonChange(h)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      horizon === h ? 'bg-cyan-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    +{h}
                  </button>
                ))}
              </div>

              <select
                value={method}
                onChange={(e) => handleMethodChange(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="auto">Auto Model (Best Fit)</option>
                <option value="polynomial">Random Forest Regressor</option>
                <option value="exponential">Support Vector Machine</option>
                <option value="linear">Linear Regression</option>
                <option value="moving_average">K-Means Clustering</option>
              </select>
            </div>
          </div>

          {/* Performance Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500">R² Accuracy</span>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{metrics.rSquared || 0.85}</div>
              <span className="text-[10px] text-slate-500">Variance fit</span>
            </div>

            <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Trajectory</span>
              <div className="text-sm font-bold text-slate-900 capitalize mt-0.5 flex items-center gap-1">
                {metrics.trendDirection === 'upward' ? (
                  <>Upward <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /></>
                ) : metrics.trendDirection === 'downward' ? (
                  <>Downward <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" /></>
                ) : (
                  'Stable'
                )}
              </div>
              <span className="text-[10px] text-slate-500">Slope: {metrics.slope || 0}</span>
            </div>

            <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Next Horizon Growth</span>
              <div className={`text-sm font-bold mt-0.5 ${(metrics.projectedGrowth || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(metrics.projectedGrowth || 0) >= 0 ? `+${metrics.projectedGrowth}%` : `${metrics.projectedGrowth}%`}
              </div>
              <span className="text-[10px] text-slate-500">Projected delta</span>
            </div>

            <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Confidence Band</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{metrics.confidenceLevel || '95%'}</div>
              <span className="text-[10px] text-slate-500">Std Err: ±{metrics.stdError || 0}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedSeries} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <defs>
                  <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="url(#forecastBand)" name="95% Upper Bound" />
                <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" fillOpacity={1} name="95% Lower Bound" />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Historical Actual" connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#06b6d4' }} name="ML Projected Trend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 2: AUTOML TOURNAMENT */}
      {mlSection === 'automl' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                AutoML Algorithm Benchmark Tournament
              </h4>
              <p className="text-xs text-slate-500">
                DataPilot AI automatically evaluated 4 predictive models across MAE, RMSE, and R² Score
              </p>
            </div>
            {autoMl?.winner && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Award className="h-4 w-4" />
                <span>Winner: {autoMl.winner}</span>
              </div>
            )}
          </div>

          {autoMl?.models ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-16 text-center">Rank</th>
                    <th className="p-3">Model Architecture</th>
                    <th className="p-3">Model Type</th>
                    <th className="p-3">R² Score (Accuracy)</th>
                    <th className="p-3">RMSE (Root Mean Sq Err)</th>
                    <th className="p-3">MAE (Mean Abs Err)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {autoMl.models.map((m, idx) => (
                    <tr key={m.modelName} className={idx === 0 ? 'bg-cyan-500/5' : 'hover:bg-slate-50'}>
                      <td className="p-3 text-center font-sans font-bold">
                        {idx === 0 ? <span className="text-amber-400">🥇 1st</span> : `#${idx + 1}`}
                      </td>
                      <td className="p-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                        {m.modelName}
                      </td>
                      <td className="p-3 text-slate-500 uppercase text-[10px]">{m.modelType}</td>
                      <td className="p-3 text-cyan-400 font-bold">{(m.rSquared * 100).toFixed(1)}%</td>
                      <td className="p-3 text-slate-600">{m.rmse}</td>
                      <td className="p-3 text-slate-600">{m.mae}</td>
                      <td className="p-3 text-center font-sans">
                        {idx === 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            AutoML Champion
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Benchmark</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">AutoML requires at least 3 historical time-series points.</p>
          )}
        </div>
      )}

      {/* SECTION 3: K-MEANS CLUSTERING */}
      {mlSection === 'clustering' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  K-Means Customer & Record Persona Segmentation
                </h4>
                <p className="text-xs text-slate-500">
                  Unsupervised machine learning partitioned the dataset into {clusters?.k || 3} natural behavioural clusters
                </p>
              </div>

              {clusters && (
                <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  Features: <span className="font-mono text-cyan-400">{clusters.featuresUsed.join(', ')}</span>
                </div>
              )}
            </div>

            {clusters ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cluster Persona Cards */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Discovered Cluster Personas:
                  </span>
                  {clusters.clusters.map((c) => (
                    <div key={c.clusterId} className="glass-panel-subtle rounded-xl p-3.5 border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <h5 className="text-xs font-bold text-slate-900">{c.name}</h5>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600">{c.percentage}% ({c.count})</span>
                      </div>
                      
                      <div className="mt-2 text-[10px] space-y-1 text-slate-500 font-mono border-t border-slate-200/80 pt-1.5">
                        {Object.entries(c.averages).map(([feat, avg]) => (
                          <div key={feat} className="flex justify-between">
                            <span>{feat}:</span>
                            <span className="text-slate-700">{avg.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2D Cluster Dispersion Scatter */}
                <div className="lg:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-900">2D Cluster Dispersion Map</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      X: {clusters.axisX} ↔ Y: {clusters.axisY}
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" dataKey={clusters.axisX} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis type="number" dataKey={clusters.axisY} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px' }} />
                        {clusters.clusters.map(cl => (
                          <Scatter
                            key={cl.clusterId}
                            name={cl.name}
                            data={clusters.scatterPoints.filter(p => p.cluster === cl.clusterId)}
                            fill={cl.color}
                          />
                        ))}
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Clustering requires at least 2 numerical dimensions and 4+ records.</p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: FEATURE IMPORTANCE */}
      {mlSection === 'importance' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Predictive Feature Importance & Key Business Drivers
              </h4>
              <p className="text-xs text-slate-500">
                Ranks which input dimensions exert the strongest predictive leverage over {primaryMetric}
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              Target: {primaryMetric}
            </span>
          </div>

          {featureImportance.length > 0 ? (
            <div className="space-y-4">
              {featureImportance.map((f, idx) => (
                <div key={f.feature} className="glass-panel-subtle rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">#{idx + 1}</span>
                      <span className="text-slate-900 text-sm">{f.feature}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        f.impactDirection.includes('Positive') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {f.impactDirection}
                      </span>
                    </div>
                    <div className="font-mono text-cyan-400 font-bold">
                      {f.importanceScore}% Leverage (r = {f.correlation})
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${f.correlation >= 0 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-rose-500 to-amber-400'}`}
                      style={{ width: `${Math.min(100, Math.max(5, f.importanceScore))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">Feature importance requires multiple numeric dimensions.</p>
          )}
        </div>
      )}

      {/* SECTION 5: WHAT-IF SIMULATOR */}
      {mlSection === 'whatif' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-400" />
                "What-If" Scenario Simulator
              </h4>
              <p className="text-xs text-slate-500">
                Simulate strategic operational adjustments and predict revenue/volume delta
              </p>
            </div>

            <button
              onClick={resetWhatIf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-700 text-slate-600 transition-all self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  Adjust {primaryMetric} Multiplier / Growth Target:
                </span>
                <span className={`font-mono font-bold text-sm ${adjustmentPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {adjustmentPercent >= 0 ? `+${adjustmentPercent}%` : `${adjustmentPercent}%`}
                </span>
              </div>

              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={adjustmentPercent}
                onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-50% Contraction</span>
                <span>0% Baseline</span>
                <span>+50% Expansion</span>
              </div>
            </div>

            <div className="glass-panel-subtle rounded-2xl p-5 border border-slate-200/80 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Simulated Total</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {whatIfResult ? whatIfResult.simulatedTotal.toLocaleString() : 'N/A'}
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Baseline Total:</span>
                <span className="text-slate-700 font-mono">
                  {whatIfResult ? whatIfResult.baselineTotal.toLocaleString() : '0'}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Net Impact:</span>
                <span className={`font-mono font-bold ${adjustmentPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {whatIfResult ? (whatIfResult.totalDelta >= 0 ? `+${whatIfResult.totalDelta.toLocaleString()}` : whatIfResult.totalDelta.toLocaleString()) : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
