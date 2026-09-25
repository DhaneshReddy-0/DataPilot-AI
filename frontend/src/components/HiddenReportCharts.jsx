import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend 
} from 'recharts';

export default function HiddenReportCharts({ analysis, forecast }) {
  if (!analysis) return null;

  const timeSeriesData = analysis.timeSeriesData || [];
  const categoryData = analysis.aggregations?.[0]?.data || [];
  const forecastSeries = forecast?.combinedSeries || [];
  const primaryMetric = analysis.primaryColumns?.metric || 'Metric';
  const primaryCategory = analysis.primaryColumns?.category || 'Category';

  return (
    <div 
      id="hidden-report-charts-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '740px',
        height: 'auto',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -50,
        backgroundColor: '#ffffff',
        overflow: 'hidden'
      }}
    >
      {/* Chart 1: Historical Trend */}
      <div id="report-chart-trend" style={{ width: '720px', height: '300px', backgroundColor: '#ffffff', padding: '10px' }}>
        <div style={{ width: '700px', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData.slice(-30)} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="reportTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <Area type="monotone" dataKey="total" stroke="#0284c7" strokeWidth={2.5} fill="url(#reportTrendGrad)" name={primaryMetric} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Volume Breakdown */}
      <div id="report-chart-category" style={{ width: '720px', height: '300px', backgroundColor: '#ffffff', padding: '10px' }}>
        <div style={{ width: '700px', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData.slice(0, 6)} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} name={`Total ${primaryMetric}`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Predictive ML Forecast with 95% Confidence Band */}
      <div id="report-chart-forecast" style={{ width: '720px', height: '300px', backgroundColor: '#ffffff', padding: '10px' }}>
        <div style={{ width: '700px', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastSeries} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="reportForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} />
              <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="url(#reportForecastGrad)" name="95% Upper Bound" />
              <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" fillOpacity={1} name="95% Lower Bound" />
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} name="Historical Actual" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#0ea5e9' }} name="ML Projected Trend" />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
