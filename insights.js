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
  const q = question.toLowerCase().trim();
  const columns = Object.keys(schema);
  const numericCols = columns.filter(c => schema[c].type === 'numeric');
  const categoricalCols = columns.filter(c => schema[c].type === 'categorical' || schema[c].type === 'text');

  // Question 1: Count / How many rows
  if (q.includes('how many') || q.includes('total rows') || q.includes('record count') || q.includes('number of')) {
    return {
      answer: `The dataset contains a total of ${data.length.toLocaleString()} records across ${columns.length} columns.`,
      type: 'metric',
      data: [{ metric: 'Total Records', value: data.length }]
    };
  }

  // Question 2: Top N entities by metric (e.g. "top 5 products by sales", "highest profit")
  const topMatch = q.match(/top\s*(\d+)/i) || (q.includes('highest') || q.includes('best') ? [null, '5'] : null);
  if (topMatch) {
    const limit = parseInt(topMatch[1], 10) || 5;
    const targetMetric = numericCols.find(c => q.includes(c.toLowerCase())) || analysis.primaryColumns.metric;
    const targetCategory = categoricalCols.find(c => q.includes(c.toLowerCase())) || analysis.primaryColumns.category;

    if (targetMetric && targetCategory) {
      const grouped = {};
      for (const row of data) {
        const cat = String(row[targetCategory] || 'Unknown');
        const val = parseFloat(row[targetMetric]) || 0;
        grouped[cat] = (grouped[cat] || 0) + val;
      }
      const sorted = Object.entries(grouped)
        .map(([name, total]) => ({ [targetCategory]: name, [targetMetric]: Number(total.toFixed(2)) }))
        .sort((a, b) => b[targetMetric] - a[targetMetric])
        .slice(0, limit);

      const topName = sorted[0]?.[targetCategory];
      const topVal = sorted[0]?.[targetMetric];

      return {
        answer: `The top ${limit} ${targetCategory}s by ${targetMetric} are led by "${topName}" with ${topVal?.toLocaleString()}.`,
        type: 'table_and_chart',
        chartType: 'BarChart',
        xAxis: targetCategory,
        yAxis: targetMetric,
        data: sorted
      };
    }
  }

  // Question 3: Average / Mean of a column
  if (q.includes('average') || q.includes('mean')) {
    const foundCol = numericCols.find(c => q.includes(c.toLowerCase()));
    if (foundCol && analysis.descriptiveStats[foundCol]) {
      const stats = analysis.descriptiveStats[foundCol];
      return {
        answer: `The average (mean) ${foundCol} is ${stats.mean.toLocaleString()} (with a median of ${stats.median.toLocaleString()} and standard deviation of ${stats.stdDev.toLocaleString()}).`,
        type: 'metric',
        data: [{ metric: `Average ${foundCol}`, value: stats.mean }, { metric: `Median ${foundCol}`, value: stats.median }]
      };
    }
  }

  // Question 4: Maximum / Minimum
  if (q.includes('maximum') || q.includes('max') || q.includes('highest')) {
    const foundCol = numericCols.find(c => q.includes(c.toLowerCase()));
    if (foundCol && analysis.descriptiveStats[foundCol]) {
      const stats = analysis.descriptiveStats[foundCol];
      return {
        answer: `The maximum recorded ${foundCol} is ${stats.max.toLocaleString()}, while the minimum is ${stats.min.toLocaleString()}.`,
        type: 'metric',
        data: [{ metric: `Maximum ${foundCol}`, value: stats.max }, { metric: `Minimum ${foundCol}`, value: stats.min }]
      };
    }
  }

  // Question 5: Outliers / Anomalies
  if (q.includes('outlier') || q.includes('anomal')) {
    const foundCol = numericCols.find(c => q.includes(c.toLowerCase())) || analysis.primaryColumns.metric;
    if (foundCol && analysis.outliers[foundCol]) {
      const o = analysis.outliers[foundCol];
      return {
        answer: `Found ${o.count} statistical outliers in ${foundCol} (${o.percentage}% of records) lying beyond bounds [${o.lowerBound} to ${o.upperBound}].`,
        type: 'list',
        data: o.sampleOutliers.map((val, i) => ({ id: i + 1, outlierValue: val }))
      };
    }
  }

  // Question 6: Filter by category value (e.g. "sales in West", "technology category")
  for (const col of categoricalCols) {
    for (const row of data.slice(0, 100)) {
      const val = String(row[col] || '').toLowerCase();
      if (val.length > 2 && q.includes(val)) {
        const filtered = data.filter(r => String(r[col] || '').toLowerCase() === val);
        const metricCol = analysis.primaryColumns.metric;
        const total = filtered.reduce((acc, curr) => acc + (parseFloat(curr[metricCol]) || 0), 0);
        return {
          answer: `Found ${filtered.length} records matching "${val}" in ${col}. Total ${metricCol || 'sum'}: ${total.toLocaleString()}.`,
          type: 'table',
          data: filtered.slice(0, 10)
        };
      }
    }
  }

  // General Fallback
  return {
    answer: `Here is a summary of ${analysis.primaryColumns.metric || 'primary metrics'} based on your query: Overall mean is ${analysis.descriptiveStats[analysis.primaryColumns.metric]?.mean || 'N/A'}, across ${data.length} records. Try asking "Top 5 products by sales", "Average profit", or "How many records are there?".`,
    type: 'general',
    data: Object.entries(analysis.descriptiveStats).slice(0, 4).map(([col, s]) => ({ column: col, mean: s.mean, sum: s.sum }))
  };
}
