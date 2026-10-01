/**
 * AI Insights Engine & Natural Language Query Assistant
 * Generates natural language executive narratives, anomaly flags, strategic recommendations,
 * and answers user questions about the data.
 */

export function generateInsights(analysis, audit, data) {
  const { descriptiveStats, outliers, correlationMatrix, aggregations, timeSeriesData, primaryColumns } = analysis;
  const { metric: primaryMetric, category: primaryCategory, date: primaryDate } = primaryColumns;

  const insightsList = [];
  const recommendations = [];
  const riskAlerts = [];

  // 1. Primary Metric & Volume Insights
  if (primaryMetric && descriptiveStats[primaryMetric]) {
    const stats = descriptiveStats[primaryMetric];
    insightsList.push({
      type: 'kpi',
      category: 'Volume & Scale',
      title: `Overall ${primaryMetric} Overview`,
      text: `Total cumulative ${primaryMetric} stands at ${stats.sum.toLocaleString()} across ${stats.count.toLocaleString()} recorded entries, averaging ${stats.mean.toLocaleString()} per unit (median: ${stats.median.toLocaleString()}).`,
      impact: 'positive'
    });
  }

  // 2. Trend & Growth Insights
  if (timeSeriesData && timeSeriesData.length >= 2) {
    const firstPeriod = timeSeriesData[0].total;
    const lastPeriod = timeSeriesData[timeSeriesData.length - 1].total;
    const growth = firstPeriod !== 0 ? (((lastPeriod - firstPeriod) / firstPeriod) * 100) : 0;
    const formattedGrowth = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    const direction = growth >= 0 ? 'increased' : 'decreased';

    insightsList.push({
      type: 'trend',
      category: 'Growth & Momentum',
      title: `Historical Trend Trajectory`,
      text: `${primaryMetric} ${direction} by ${Math.abs(growth).toFixed(1)}% between ${timeSeriesData[0].date} and ${timeSeriesData[timeSeriesData.length - 1].date} (${firstPeriod.toLocaleString()} -> ${lastPeriod.toLocaleString()}).`,
      impact: growth >= 0 ? 'positive' : 'warning'
    });

    if (growth < 0) {
      riskAlerts.push(`Downside trajectory detected: ${primaryMetric} has contracted by ${Math.abs(growth).toFixed(1)}% over the tracked timeline.`);
    }
  }

  // 3. Category Concentration & Pareto (80/20) Insights
  if (aggregations && aggregations.length > 0 && aggregations[0].data.length > 0) {
    const topCat = aggregations[0].data[0];
    const totalAgg = aggregations[0].data.reduce((sum, d) => sum + d.total, 0);
    const topShare = totalAgg > 0 ? ((topCat.total / totalAgg) * 100).toFixed(1) : 0;

    insightsList.push({
      type: 'segment',
      category: 'Market Dominance',
      title: `Top Contributor: ${topCat.category}`,
      text: `The "${topCat.category}" segment is the clear leader, generating ${topCat.total.toLocaleString()} or ${topShare}% of top segment volume.`,
      impact: 'highlight'
    });

    if (Number(topShare) > 45) {
      riskAlerts.push(`High concentration risk: "${topCat.category}" accounts for over ${topShare}% of volume. A disturbance in this category would severely impact overall performance.`);
      recommendations.push(`Diversify revenue streams to reduce systemic reliance on "${topCat.category}".`);
    } else {
      recommendations.push(`Scale promotional and operational support behind high-performing segments like "${topCat.category}".`);
    }
  }

  // 4. Strong Correlations
  if (correlationMatrix) {
    const strongCorrelations = [];
    const checked = new Set();

    for (const [colA, cols] of Object.entries(correlationMatrix)) {
      for (const [colB, r] of Object.entries(cols)) {
        if (colA !== colB && Math.abs(r) >= 0.5) {
          const key = [colA, colB].sort().join('::');
          if (!checked.has(key)) {
            checked.add(key);
            strongCorrelations.push({ colA, colB, r });
          }
        }
      }
    }

    if (strongCorrelations.length > 0) {
      const topCorr = strongCorrelations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0];
      const relType = topCorr.r > 0 ? 'positive' : 'inverse';
      insightsList.push({
        type: 'correlation',
        category: 'Statistical Linkage',
        title: `Correlation Between ${topCorr.colA} & ${topCorr.colB}`,
        text: `Strong ${relType} correlation detected (r = ${topCorr.r}). An increase in ${topCorr.colA} is strongly associated with an ${topCorr.r > 0 ? 'increase' : 'decrease'} in ${topCorr.colB}.`,
        impact: 'info'
      });
      recommendations.push(`Leverage ${topCorr.colA} as an operational predictive lever to influence ${topCorr.colB}.`);
    }
  }

  // 5. Outliers & Anomaly Detection
  if (outliers && primaryMetric && outliers[primaryMetric]) {
    const o = outliers[primaryMetric];
    if (o.count > 0) {
      insightsList.push({
        type: 'anomaly',
        category: 'Anomaly Detection',
        title: `Outlier Detection in ${primaryMetric}`,
        text: `Detected ${o.count} statistical anomalies (${o.percentage}% of entries) outside normal thresholds [${o.lowerBound} to ${o.upperBound}].`,
        impact: 'warning'
      });
      riskAlerts.push(`${o.count} anomalous transactions/records were identified in ${primaryMetric}; investigate for high-value client behavior or recording discrepancies.`);
    }
  }

  // 6. Data Hygiene & Audit Summary
  if (audit) {
    if (audit.duplicateCount > 0) {
      riskAlerts.push(`Found ${audit.duplicateCount} duplicate records in raw input. Automated deduplication cleaned your dataset.`);
    }
    if (audit.missingValuesFound > 0) {
      riskAlerts.push(`Identified ${audit.missingValuesFound} null or missing values across columns; median/mode imputation was applied to maintain analytical validity.`);
    }
  }

  // Fallback recommendations if empty
  if (recommendations.length === 0) {
    recommendations.push('Establish automated weekly performance tracking for key numeric dimensions.');
    recommendations.push('Regularly audit data collection points to maintain top hygiene score.');
  }

  // Executive Narrative
  const executiveSummary = `Executive Data Synthesis: Analyzed ${audit.cleanedRowsCount.toLocaleString()} verified records across ${audit.columnsCount} attributes with a Data Health Score of ${audit.healthScore}% (Grade ${audit.healthGrade}). ${primaryMetric ? `Core business metric "${primaryMetric}" reflects total volume of ${descriptiveStats[primaryMetric]?.sum?.toLocaleString() || 0}.` : ''} Key segment dynamics and predictive trajectories indicate strategic opportunities for optimization and diversification.`;

  return {
    executiveSummary,
    insights: insightsList,
    riskAlerts,
    recommendations
  };
}

/**
 * Natural Language Query Engine ("Ask your Data")
 * Parses user questions in natural language and returns computed figures, filtered records, and chart hints.
 */
export function answerDataQuestion(question, data, schema, analysis) {
  const q = (question || '').toLowerCase().trim();
  const safeSchema = (schema && typeof schema === 'object') ? schema : {};
  let columns = Object.keys(safeSchema);
  if (columns.length === 0 && data && data.length > 0) {
    columns = Object.keys(data[0]);
  }

  // Detect Numeric and Categorical columns safely
  const numericCols = columns.filter(c => {
    if (safeSchema[c]?.type === 'numeric' || safeSchema[c]?.type === 'number') return true;
    const val = data.find(r => r && r[c] !== null && r[c] !== undefined)?.[c];
    return typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && typeof val !== 'boolean');
  });
  const categoricalCols = columns.filter(c => !numericCols.includes(c));

  const safeAnalysis = (analysis && typeof analysis === 'object') ? analysis : {};
  const primaryMetric = safeAnalysis.primaryColumns?.metric || numericCols[0] || columns[0] || 'Value';
  const primaryCategory = safeAnalysis.primaryColumns?.category || categoricalCols[0] || columns[0] || 'Category';

  // 1. Greetings & Capabilities
  if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('who are you') || q.includes('what can you do') || q.includes('help')) {
    return {
      answer: `Hello! I am your AI Data Analyst Agent. I analyze your dataset in real time. Ask me questions like: "What are the top 5 ${primaryCategory} by ${primaryMetric}?", "What is the average ${primaryMetric}?", or "How many records are there?".`,
      type: 'metric',
      data: [
        { metric: 'Total Records', value: data.length },
        { metric: 'Primary Category', value: primaryCategory },
        { metric: 'Primary Metric', value: primaryMetric }
      ]
    };
  }

  // 2. Count / How many rows
  if (q.includes('how many') || q.includes('total rows') || q.includes('record count') || q.includes('number of') || q.includes('total records') || q.includes('size')) {
    return {
      answer: `The dataset contains a total of ${data.length.toLocaleString()} records across ${columns.length} columns (${numericCols.length} numerical metrics and ${categoricalCols.length} categorical attributes).`,
      type: 'metric',
      data: [
        { metric: 'Total Records', value: data.length },
        { metric: 'Total Columns', value: columns.length },
        { metric: 'Numeric Columns', value: numericCols.length }
      ]
    };
  }

  // 3. Top N or Bottom N entities by metric
  const isBottom = q.includes('bottom') || q.includes('lowest') || q.includes('worst') || q.includes('least');
  const topMatch = q.match(/(?:top|bottom|lowest|highest|best|worst)\s*(\d+)/i) || 
                   (q.includes('top') || isBottom || q.includes('highest') || q.includes('best') ? [null, '5'] : null);
  if (topMatch) {
    const limit = Math.min(25, Math.max(1, parseInt(topMatch[1], 10) || 5));
    const targetMetric = numericCols.find(c => q.includes(c.toLowerCase())) || primaryMetric;
    const targetCategory = categoricalCols.find(c => q.includes(c.toLowerCase())) || primaryCategory;

    if (targetMetric && targetCategory) {
      const grouped = {};
      for (const row of data) {
        const cat = String(row[targetCategory] ?? 'Unknown');
        const raw = row[targetMetric];
        const val = typeof raw === 'number' ? raw : (parseFloat(String(raw).replace(/[$,%]/g, '')) || 0);
        grouped[cat] = (grouped[cat] || 0) + val;
      }
      const sorted = Object.entries(grouped)
        .map(([name, total]) => ({ [targetCategory]: name, [targetMetric]: Number(total.toFixed(2)) }))
        .sort((a, b) => isBottom ? a[targetMetric] - b[targetMetric] : b[targetMetric] - a[targetMetric])
        .slice(0, limit);

      const topName = sorted[0]?.[targetCategory] || 'N/A';
      const topVal = sorted[0]?.[targetMetric] ?? 0;
      const rankWord = isBottom ? 'bottom' : 'top';

      return {
        answer: `The ${rankWord} ${limit} ${targetCategory}s by ${targetMetric} are led by "${topName}" with ${topVal.toLocaleString()}.`,
        type: 'table_and_chart',
        chartType: 'BarChart',
        xAxis: targetCategory,
        yAxis: targetMetric,
        data: sorted
      };
    }
  }

  // 4. Average / Mean / Median
  if (q.includes('average') || q.includes('mean') || q.includes('median')) {
    const targetMetric = numericCols.find(c => q.includes(c.toLowerCase())) || primaryMetric;
    const values = data.map(r => {
      const raw = r[targetMetric];
      return typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[$,%]/g, ''));
    }).filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const median = values[Math.floor(values.length / 2)];
      return {
        answer: `For ${targetMetric}: The average (mean) is ${Number(mean.toFixed(2)).toLocaleString()}, with a median of ${Number(median.toFixed(2)).toLocaleString()} across ${values.length.toLocaleString()} valid entries.`,
        type: 'metric',
        data: [
          { metric: `Average ${targetMetric}`, value: Number(mean.toFixed(2)) },
          { metric: `Median ${targetMetric}`, value: Number(median.toFixed(2)) },
          { metric: 'Total Sum', value: Number(sum.toFixed(2)) }
        ]
      };
    }
  }

  // 5. Maximum / Minimum
  if (q.includes('maximum') || q.includes('max') || q.includes('highest') || q.includes('minimum') || q.includes('min') || q.includes('lowest')) {
    const targetMetric = numericCols.find(c => q.includes(c.toLowerCase())) || primaryMetric;
    const values = data.map(r => {
      const raw = r[targetMetric];
      return typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[$,%]/g, ''));
    }).filter(v => typeof v === 'number' && !isNaN(v));

    if (values.length > 0) {
      const max = Math.max(...values);
      const min = Math.min(...values);
      return {
        answer: `For ${targetMetric}: The maximum recorded value is ${Number(max.toFixed(2)).toLocaleString()}, and the minimum recorded value is ${Number(min.toFixed(2)).toLocaleString()}.`,
        type: 'metric',
        data: [
          { metric: `Maximum ${targetMetric}`, value: Number(max.toFixed(2)) },
          { metric: `Minimum ${targetMetric}`, value: Number(min.toFixed(2)) }
        ]
      };
    }
  }

  // 6. Outliers / Anomalies
  if (q.includes('outlier') || q.includes('anomal')) {
    const targetMetric = numericCols.find(c => q.includes(c.toLowerCase())) || primaryMetric;
    if (safeAnalysis.outliers && safeAnalysis.outliers[targetMetric]) {
      const o = safeAnalysis.outliers[targetMetric];
      return {
        answer: `Found ${o.count} statistical outliers in ${targetMetric} (${o.percentage}% of records) lying beyond expected bounds [${o.lowerBound} to ${o.upperBound}].`,
        type: 'metric',
        data: [
          { metric: 'Outlier Count', value: o.count },
          { metric: 'Outlier %', value: `${o.percentage}%` },
          { metric: 'Lower Bound', value: o.lowerBound },
          { metric: 'Upper Bound', value: o.upperBound }
        ]
      };
    }
  }

  // 7. Filter by category match
  for (const col of categoricalCols) {
    for (const row of data.slice(0, 100)) {
      const val = String(row[col] || '').toLowerCase();
      if (val.length > 2 && q.includes(val)) {
        const filtered = data.filter(r => String(r[col] || '').toLowerCase() === val);
        const metricCol = primaryMetric;
        const total = filtered.reduce((acc, curr) => acc + (parseFloat(String(curr[metricCol]).replace(/[$,%]/g, '')) || 0), 0);
        return {
          answer: `Found ${filtered.length.toLocaleString()} records matching "${val}" in ${col}. Total ${metricCol}: ${Number(total.toFixed(2)).toLocaleString()}.`,
          type: 'table',
          data: filtered.slice(0, 10)
        };
      }
    }
  }

  // 8. General Comprehensive Fallback
  const summaryMetric = primaryMetric;
  const values = data.map(r => parseFloat(String(r[summaryMetric]).replace(/[$,%]/g, ''))).filter(v => typeof v === 'number' && !isNaN(v));
  const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A';

  return {
    answer: `Analysis for "${question}": Processed across ${data.length.toLocaleString()} records. Primary metric is "${summaryMetric}" with an overall average of ${avg}. Try asking: "Top 5 ${primaryCategory} by ${primaryMetric}", "What is the average ${primaryMetric}?", or "Show maximum ${primaryMetric}".`,
    type: 'metric',
    data: [
      { metric: 'Target Metric', value: summaryMetric },
      { metric: 'Average Value', value: avg },
      { metric: 'Total Records', value: data.length }
    ]
  };
}
