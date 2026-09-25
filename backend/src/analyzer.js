import * as ss from 'simple-statistics';

/**
 * Statistical Analysis Engine
 * Calculates descriptive stats, correlations, distribution, outliers, radar, and chart configs.
 */
export function analyzeData(data, schema) {
  if (!data || data.length === 0) return {};

  const columns = Object.keys(schema);
  const numericCols = columns.filter(c => schema[c].type === 'numeric');
  const categoricalCols = columns.filter(c => schema[c].type === 'categorical' || (schema[c].type === 'text' && schema[c].uniqueCount <= 50));
  const dateCols = columns.filter(c => schema[c].type === 'datetime');

  // 1. Descriptive statistics & Outliers for Numeric Columns
  const descriptiveStats = {};
  const outliers = {};

  for (const col of numericCols) {
    const values = data
      .map(r => parseFloat(String(r[col]).replace(/[$,%]/g, '')))
      .filter(v => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b);

    if (values.length >= 2) {
      const min = ss.min(values);
      const max = ss.max(values);
      const mean = ss.mean(values);
      const median = ss.median(values);
      const stdDev = ss.standardDeviation(values);
      const q1 = ss.quantile(values, 0.25);
      const q3 = ss.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const detectedOutliers = values.filter(v => v < lowerBound || v > upperBound);

      descriptiveStats[col] = {
        count: values.length,
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        q1: Number(q1.toFixed(2)),
        q3: Number(q3.toFixed(2)),
        iqr: Number(iqr.toFixed(2)),
        sum: Number(ss.sum(values).toFixed(2))
      };

      outliers[col] = {
        count: detectedOutliers.length,
        percentage: Number(((detectedOutliers.length / values.length) * 100).toFixed(1)),
        lowerBound: Number(lowerBound.toFixed(2)),
        upperBound: Number(upperBound.toFixed(2)),
        sampleOutliers: detectedOutliers.slice(0, 10)
      };
    }
  }

  // 2. Correlation Matrix for Numeric Columns & Heatmap Data
  const correlationMatrix = {};
  const correlationHeatmap = [];

  for (let i = 0; i < numericCols.length; i++) {
    const colA = numericCols[i];
    correlationMatrix[colA] = {};
    for (let j = 0; j < numericCols.length; j++) {
      const colB = numericCols[j];
      if (colA === colB) {
        correlationMatrix[colA][colB] = 1;
        correlationHeatmap.push({ x: colA, y: colB, value: 1 });
      } else {
        const paired = [];
        for (const row of data) {
          const valA = parseFloat(String(row[colA]).replace(/[$,%]/g, ''));
          const valB = parseFloat(String(row[colB]).replace(/[$,%]/g, ''));
          if (!isNaN(valA) && !isNaN(valB)) {
            paired.push([valA, valB]);
          }
        }
        if (paired.length >= 3) {
          try {
            const r = ss.sampleCorrelation(paired.map(p => p[0]), paired.map(p => p[1]));
            const rVal = isNaN(r) ? 0 : Number(r.toFixed(3));
            correlationMatrix[colA][colB] = rVal;
            correlationHeatmap.push({ x: colA, y: colB, value: rVal });
          } catch (_) {
            correlationMatrix[colA][colB] = 0;
            correlationHeatmap.push({ x: colA, y: colB, value: 0 });
          }
        } else {
          correlationMatrix[colA][colB] = 0;
          correlationHeatmap.push({ x: colA, y: colB, value: 0 });
        }
      }
    }
  }

  // 3. Primary dimension identification
  const primaryMetric = numericCols.find(c => /sales|revenue|amount|profit|total|balance|cost|price|salary|score|value|growth/i.test(c)) || numericCols[0];
  const primaryCategory = categoricalCols.find(c => /category|region|department|product|type|status|city|country|segment|industry/i.test(c)) || categoricalCols[0];
  const primaryDate = dateCols.find(c => /date|time|day|month|year/i.test(c)) || dateCols[0];

  // 4. Aggregations (Primary Metric by Top Category)
  const aggregations = [];
  if (primaryCategory && primaryMetric) {
    const grouped = {};
    for (const row of data) {
      const cat = String(row[primaryCategory] || 'Unknown');
      const val = parseFloat(String(row[primaryMetric]).replace(/[$,%]/g, '')) || 0;
      if (!grouped[cat]) grouped[cat] = { total: 0, count: 0 };
      grouped[cat].total += val;
      grouped[cat].count += 1;
    }
    const breakdown = Object.entries(grouped)
      .map(([key, v]) => ({
        category: key,
        total: Number(v.total.toFixed(2)),
        average: Number((v.total / v.count).toFixed(2)),
        count: v.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    aggregations.push({
      type: 'category_breakdown',
      title: `${primaryMetric} by ${primaryCategory}`,
      categoryColumn: primaryCategory,
      metricColumn: primaryMetric,
      data: breakdown
    });
  }

  // 5. Time Series Trend if Date column exists
  let timeSeriesData = [];
  if (primaryDate && primaryMetric) {
    const dateMap = {};
    for (const row of data) {
      const rawDate = row[primaryDate];
      if (!rawDate) continue;
      const dateKey = String(rawDate).slice(0, 10);
      const val = parseFloat(String(row[primaryMetric]).replace(/[$,%]/g, '')) || 0;
      if (!dateMap[dateKey]) dateMap[dateKey] = { total: 0, count: 0 };
      dateMap[dateKey].total += val;
      dateMap[dateKey].count += 1;
    }

    timeSeriesData = Object.entries(dateMap)
      .map(([date, v]) => ({
        date,
        total: Number(v.total.toFixed(2)),
        average: Number((v.total / v.count).toFixed(2)),
        count: v.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // 6. Radar / Spider Chart Data (Multi-metric Category Profiles)
  let radarData = [];
  if (primaryCategory && numericCols.length >= 3) {
    const candidateMetrics = numericCols.slice(0, 5);
    const topCats = (aggregations[0]?.data || []).slice(0, 3).map(d => d.category);

    // Normalize each metric to 0-100 scale for clean radar shape
    radarData = candidateMetrics.map(metric => {
      const rowItem = { subject: metric };
      const maxVal = descriptiveStats[metric]?.max || 1;

      topCats.forEach(catName => {
        const matchingRows = data.filter(r => String(r[primaryCategory]) === catName);
        const avg = matchingRows.length > 0 
          ? matchingRows.reduce((acc, curr) => acc + (parseFloat(String(curr[metric]).replace(/[$,%]/g, '')) || 0), 0) / matchingRows.length
          : 0;
        rowItem[catName] = Number(((avg / (maxVal || 1)) * 100).toFixed(1));
      });

      return rowItem;
    });
  }

  // 7. Scatter Plot Pairs (Primary Metric vs Secondary Metric)
  let scatterPairs = [];
  const secondMetric = numericCols.find(c => c !== primaryMetric);
  if (primaryMetric && secondMetric) {
    scatterPairs = data.slice(0, 100).map((r, idx) => ({
      id: idx + 1,
      x: parseFloat(String(r[primaryMetric]).replace(/[$,%]/g, '')) || 0,
      y: parseFloat(String(r[secondMetric]).replace(/[$,%]/g, '')) || 0,
      name: primaryCategory ? String(r[primaryCategory]) : `Row #${idx + 1}`
    }));
  }

  // 8. Recommended Charts
  const recommendedCharts = [];

  // Chart 1: Time Series (Area)
  if (timeSeriesData.length > 1) {
    recommendedCharts.push({
      id: 'chart_trend',
      title: `${primaryMetric} over Time`,
      type: 'AreaChart',
      xAxis: 'date',
      yAxis: 'total',
      data: timeSeriesData.slice(-30),
      description: `Historical progression of ${primaryMetric} along ${primaryDate}.`
    });
  }

  // Chart 2: Category Bar
  if (aggregations.length > 0 && aggregations[0].data.length > 0) {
    recommendedCharts.push({
      id: 'chart_category',
      title: `Top ${aggregations[0].categoryColumn} by ${aggregations[0].metricColumn}`,
      type: 'BarChart',
      xAxis: 'category',
      yAxis: 'total',
      data: aggregations[0].data,
      description: `Comparative distribution of ${aggregations[0].metricColumn} across top categories.`
    });

    // Chart 3: Market Share Donut
    recommendedCharts.push({
      id: 'chart_share',
      title: `Market Share Breakdown (${aggregations[0].categoryColumn})`,
      type: 'PieChart',
      nameKey: 'category',
      dataKey: 'total',
      data: aggregations[0].data.slice(0, 6),
      description: `Proportional contribution of top segments.`
    });
  }

  // Chart 4: Radar Multi-Attribute Profile
  if (radarData.length >= 3) {
    recommendedCharts.push({
      id: 'chart_radar',
      title: `Multi-Dimensional Segment Radar Profile`,
      type: 'RadarChart',
      data: radarData,
      categories: (aggregations[0]?.data || []).slice(0, 3).map(d => d.category),
      description: `Comparative spider-web matrix across ${numericCols.slice(0, 5).join(', ')}.`
    });
  }

  // Chart 5: Scatter Relationship
  if (scatterPairs.length > 0) {
    recommendedCharts.push({
      id: 'chart_scatter',
      title: `${primaryMetric} vs ${secondMetric} Distribution`,
      type: 'ScatterChart',
      xMetric: primaryMetric,
      yMetric: secondMetric,
      data: scatterPairs,
      description: `Bivariate dispersion correlation between ${primaryMetric} and ${secondMetric}.`
    });
  }

  return {
    descriptiveStats,
    outliers,
    correlationMatrix,
    correlationHeatmap,
    aggregations,
    timeSeriesData,
    radarData,
    scatterPairs,
    recommendedCharts,
    primaryColumns: {
      metric: primaryMetric,
      category: primaryCategory,
      date: primaryDate,
      numericCols,
      categoricalCols,
      dateCols
    }
  };
}
