import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Layers, 
  Settings2, 
  Sparkles,
  Maximize2,
  Grid,
  Crosshair,
  Compass
} from 'lucide-react';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function SmartChartsTab({ analysis, data, schema }) {
  if (!analysis) return null;

  const { 
    recommendedCharts = [], 
    primaryColumns = {}, 
    radarData = [], 
    scatterPairs = [], 
    correlationMatrix = {} 
  } = analysis;
  const { numericCols = [], categoricalCols = [], dateCols = [] } = primaryColumns;

  // Custom Chart Builder State
  const [customChartType, setCustomChartType] = useState('bar');
  const [customXAxis, setCustomXAxis] = useState(categoricalCols[0] || dateCols[0] || Object.keys(schema)[0]);
  const [customYAxis, setCustomYAxis] = useState(numericCols[0] || Object.keys(schema)[1]);
  const [customAgg, setCustomAgg] = useState('sum'); // 'sum' | 'avg' | 'count'

  // Compute Custom Chart Data
  const customData = useMemo(() => {
    if (!data || !customXAxis || !customYAxis) return [];

    const grouped = {};
    for (const row of data) {
      const xKey = String(row[customXAxis] || 'Unknown');
      const yVal = parseFloat(String(row[customYAxis]).replace(/[$,%]/g, '')) || 0;

      if (!grouped[xKey]) {
        grouped[xKey] = { [customXAxis]: xKey, sum: 0, count: 0 };
      }
      grouped[xKey].sum += yVal;
      grouped[xKey].count += 1;
    }

    return Object.values(grouped).map(item => {
      let finalVal = item.sum;
      if (customAgg === 'avg') finalVal = item.sum / item.count;
      else if (customAgg === 'count') finalVal = item.count;
      return {
        [customXAxis]: item[customXAxis],
        [customYAxis]: Number(finalVal.toFixed(2)),
        subject: item[customXAxis],
        value: Number(finalVal.toFixed(2))
      };
    }).sort((a, b) => b[customYAxis] - a[customYAxis]).slice(0, 15);
  }, [data, customXAxis, customYAxis, customAgg]);

  // Heatmap Cells
  const numMatrixCols = numericCols.slice(0, 6);

  return (
    <div className="space-y-8">
      
      {/* Visual Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Autonomous Smart Dashboards & Multi-Visual Telemetry
          </h3>
          <p className="text-xs text-slate-500">
            Multi-dimensional visuals including Time Series, Categorical, Radar, Scatter, and Heatmap
          </p>
        </div>
        <span className="text-xs text-cyan-400 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-xl self-start sm:self-auto font-medium">
          6 Visual Archetypes Auto-Constructed
        </span>
      </div>

      {/* Auto-Generated Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendedCharts.map((chart) => (
          <div key={chart.id} className="glass-panel rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{chart.title}</h4>
                <p className="text-[11px] text-slate-500">{chart.description}</p>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'AreaChart' ? (
                  <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`color_${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={chart.xAxis} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey={chart.yAxis} stroke="#06b6d4" fillOpacity={1} fill={`url(#color_${chart.id})`} strokeWidth={2} />
                  </AreaChart>
                ) : chart.type === 'BarChart' ? (
                  <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={chart.xAxis} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey={chart.yAxis} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chart.type === 'PieChart' ? (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey={chart.dataKey}
                      nameKey={chart.nameKey}
                    >
                      {chart.data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                ) : chart.type === 'RadarChart' ? (
                  <RadarChart data={chart.data} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    {chart.categories.map((cat, idx) => (
                      <Radar
                        key={cat}
                        name={cat}
                        dataKey={cat}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.35}
                      />
                    ))}
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  </RadarChart>
                ) : chart.type === 'ScatterChart' ? (
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" dataKey="x" name={chart.xMetric} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name={chart.yMetric} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <ZAxis range={[40, 120]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px' }} />
                    <Scatter name={`${chart.xMetric} vs ${chart.yMetric}`} data={chart.data} fill="#8b5cf6" />
                  </ScatterChart>
                ) : null}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Correlation Heatmap Grid */}
      {numMatrixCols.length >= 2 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid className="h-4 w-4 text-cyan-400" />
                Pearson Correlation Heatmap Matrix
              </h4>
              <p className="text-xs text-slate-500">
                Pairwise linear dependency coefficient from -1.0 (inverse) to +1.0 (positive)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-200 inline-block"></span> Negative</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block"></span> Neutral</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-300 inline-block"></span> Positive</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2.5 text-left text-slate-500 font-semibold text-[11px] border-b border-slate-200">Dimension</th>
                  {numMatrixCols.map(col => (
                    <th key={col} className="p-2.5 text-slate-600 font-semibold text-[11px] border-b border-slate-200 truncate max-w-[100px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {numMatrixCols.map(rowCol => (
                  <tr key={rowCol}>
                    <td className="p-2.5 text-left text-slate-600 font-sans font-medium text-[11px] bg-slate-50 truncate max-w-[120px]">
                      {rowCol}
                    </td>
                    {numMatrixCols.map(colCol => {
                      const r = correlationMatrix[rowCol]?.[colCol] ?? 0;
                      let bgStyle = 'rgba(241, 245, 249, 1)'; // slate-100
                      let textCol = '#64748b'; // slate-500

                      if (rowCol === colCol) {
                        bgStyle = 'rgba(186, 230, 253, 1)'; // sky-200
                        textCol = '#0369a1'; // sky-700
                      } else if (r > 0.4) {
                        bgStyle = `rgba(125, 211, 252, ${Math.min(1, r)})`; 
                        textCol = '#0c4a6e';
                      } else if (r < -0.4) {
                        bgStyle = `rgba(254, 202, 202, ${Math.min(1, Math.abs(r))})`; 
                        textCol = '#7f1d1d';
                      }

                      return (
                        <td 
                          key={colCol} 
                          className="p-2.5 text-[11px] font-semibold transition-colors"
                          style={{ backgroundColor: bgStyle, color: textCol }}
                        >
                          {r > 0 && rowCol !== colCol ? `+${r}` : r}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Custom Chart Studio */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-cyan-400" />
              Custom Interactive Chart Studio
            </h3>
            <p className="text-xs text-slate-500">
              Customize chart types, dimensions, metrics, and aggregation methods
            </p>
          </div>
        </div>

        {/* Builder Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chart Type</label>
            <select
              value={customChartType}
              onChange={(e) => setCustomChartType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 capitalize"
            >
              {['bar', 'line', 'area', 'pie', 'radar'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">X-Axis (Dimension)</label>
            <select
              value={customXAxis}
              onChange={(e) => setCustomXAxis(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              {Object.keys(schema).map(col => (
                <option key={col} value={col}>{col} ({schema[col].type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Y-Axis (Metric)</label>
            <select
              value={customYAxis}
              onChange={(e) => setCustomYAxis(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              {numericCols.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Aggregation</label>
            <select
              value={customAgg}
              onChange={(e) => setCustomAgg(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              <option value="sum">Sum (Total)</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Count of Records</option>
            </select>
          </div>
        </div>

        {/* Live Chart Rendering */}
        <div className="h-80 w-full bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <ResponsiveContainer width="100%" height="100%">
            {customChartType === 'bar' ? (
              <BarChart data={customData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={customXAxis} stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey={customYAxis} fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : customChartType === 'line' ? (
              <LineChart data={customData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={customXAxis} stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey={customYAxis} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            ) : customChartType === 'area' ? (
              <AreaChart data={customData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <defs>
                  <linearGradient id="customAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={customXAxis} stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey={customYAxis} stroke="#8b5cf6" fill="url(#customAreaGrad)" strokeWidth={2} />
              </AreaChart>
            ) : customChartType === 'radar' ? (
              <RadarChart data={customData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey={customXAxis} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name={customYAxis} dataKey={customYAxis} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px' }} />
              </RadarChart>
            ) : (
              <PieChart>
                <Pie
                  data={customData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey={customYAxis}
                  nameKey={customXAxis}
                >
                  {customData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
