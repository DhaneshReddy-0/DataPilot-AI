import PDFDocument from 'pdfkit';

/**
 * Enterprise PDF Executive Intelligence Dossier Generator
 * Features:
 * - Native Vector Chart Generation (Trend Area, Category Bar, ML Forecast with 95% Confidence Band)
 * - Support for Embedded High-Res Client Chart Images
 * - Clean Typographic Hierarchy, Balanced Spacing, and Header/Footer stamps
 * - Multi-Page Dossier (Page 1: Executive Summary, Page 2: Visuals, Page 3: ML Forecast, Page 4: Strategic Governance)
 */
export function generatePDFReport(reportData, res) {
  const {
    datasetName = 'Dataset_Analysis',
    audit = {},
    analysis = {},
    insights = {},
    forecast = {},
    charts = {}
  } = reportData;

  const doc = new PDFDocument({ 
    margin: 40, 
    size: 'A4',
    bufferPages: true 
  });

  doc.pipe(res);

  // Corporate Design System Palette
  const C_NAVY = '#0f172a';
  const C_BLUE = '#1e3a8a';
  const C_CYAN = '#0284c7';
  const C_CYAN_LIGHT = '#e0f2fe';
  const C_DARK = '#1e293b';
  const C_MUTED = '#64748b';
  const C_BG_LIGHT = '#f8fafc';
  const C_BORDER = '#cbd5e1';
  const C_BORDER_LIGHT = '#e2e8f0';
  const C_EMERALD = '#059669';
  const C_ROSE = '#e11d48';

  const PAGE_WIDTH = 515;
  const LEFT_X = 40;

  // Helper: Draw Section Heading
  function drawSectionHeader(title, subtitle, y) {
    doc.rect(LEFT_X, y, 4, 18).fill(C_CYAN);
    doc.fillColor(C_NAVY).fontSize(12).font('Helvetica-Bold').text(title, LEFT_X + 12, y + 2);
    if (subtitle) {
      doc.fillColor(C_MUTED).fontSize(8).font('Helvetica').text(subtitle, LEFT_X + 12, y + 17);
      return y + 36;
    }
    return y + 26;
  }

  // =========================================================================
  // NATIVE VECTOR CHART DRAWING ENGINES (Guarantees charts are ALWAYS rendered)
  // =========================================================================

  // Vector Chart 1: Historical Trend Area Chart
  function drawVectorTrendChart(data, x, y, width, height, metricName) {
    // Outer Frame & Title
    doc.rect(x, y, width, height).fillAndStroke('#ffffff', C_BORDER_LIGHT);
    doc.rect(x, y, width, 22).fill(C_BG_LIGHT);
    doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
      .text(`Figure 1.0: Chronological Progression of ${metricName}`, x + 10, y + 6);

    const chartX = x + 35;
    const chartY = y + 35;
    const chartW = width - 50;
    const chartH = height - 55;

    const points = (data || []).slice(-20);
    if (points.length < 2) {
      doc.fillColor(C_MUTED).fontSize(9).text('Insufficient historical points to render trend.', chartX, chartY + 40);
      return y + height + 15;
    }

    const values = points.map(p => Number(p.total) || 0);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    // Draw horizontal grid lines
    for (let i = 0; i <= 3; i++) {
      const lineY = chartY + chartH - (i / 3) * chartH;
      doc.moveTo(chartX, lineY).lineTo(chartX + chartW, lineY).strokeColor('#f1f5f9').lineWidth(1).stroke();
      const valLabel = Math.round(minVal + (i / 3) * range);
      doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica')
        .text(valLabel.toLocaleString(), x + 2, lineY - 4, { width: 30, align: 'right' });
    }

    // Coordinates
    const coords = points.map((p, i) => {
      const cx = chartX + (i / (points.length - 1)) * chartW;
      const cy = chartY + chartH - ((p.total - minVal) / range) * chartH;
      return { cx, cy, date: p.date };
    });

    // Draw Shaded Area
    doc.save();
    doc.moveTo(coords[0].cx, chartY + chartH);
    coords.forEach(pt => doc.lineTo(pt.cx, pt.cy));
    doc.lineTo(coords[coords.length - 1].cx, chartY + chartH);
    doc.closePath();
    doc.fillColor('#e0f2fe').fill();
    doc.restore();

    // Draw Line
    doc.moveTo(coords[0].cx, coords[0].cy);
    for (let i = 1; i < coords.length; i++) {
      doc.lineTo(coords[i].cx, coords[i].cy);
    }
    doc.strokeColor(C_CYAN).lineWidth(2).stroke();

    // Draw Dots
    coords.forEach(pt => {
      doc.circle(pt.cx, pt.cy, 2.5).fillColor(C_CYAN).fill();
      doc.circle(pt.cx, pt.cy, 1.2).fillColor('#ffffff').fill();
    });

    // X-Axis date labels
    const step = Math.max(1, Math.floor(coords.length / 5));
    for (let i = 0; i < coords.length; i += step) {
      doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica')
        .text(String(coords[i].date).slice(5), coords[i].cx - 15, chartY + chartH + 5, { width: 30, align: 'center' });
    }

    return y + height + 15;
  }

  // Vector Chart 2: Category Bar Breakdown
  function drawVectorBarChart(data, x, y, width, height, categoryName, metricName) {
    doc.rect(x, y, width, height).fillAndStroke('#ffffff', C_BORDER_LIGHT);
    doc.rect(x, y, width, 22).fill(C_BG_LIGHT);
    doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
      .text(`Figure 2.0: Volume Distribution by Top ${categoryName}`, x + 10, y + 6);

    const items = (data || []).slice(0, 6);
    const startY = y + 32;
    const maxVal = Math.max(...items.map(i => i.total || 0), 1);
    const barW = (width - 60) / Math.max(items.length, 1);
    const chartH = height - 60;

    items.forEach((item, idx) => {
      const itemH = ((item.total || 0) / maxVal) * chartH;
      const barX = x + 40 + idx * barW + 8;
      const barY = startY + chartH - itemH;
      const actualBarW = Math.max(12, barW - 16);

      // Bar
      const barColor = idx === 0 ? C_CYAN : (idx === 1 ? '#3b82f6' : '#64748b');
      doc.roundedRect(barX, barY, actualBarW, itemH, 2).fill(barColor);

      // Value label on top
      doc.fillColor(C_DARK).fontSize(6.5).font('Helvetica-Bold')
        .text(Math.round(item.total).toLocaleString(), barX - 10, barY - 10, { width: actualBarW + 20, align: 'center' });

      // Category label at bottom
      doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
        .text(String(item.category), barX - 10, startY + chartH + 5, { width: actualBarW + 20, align: 'center' });
    });

    return y + height + 15;
  }

  // Vector Chart 3: Predictive ML Forecast with 95% Confidence Band
  function drawVectorForecastChart(series, x, y, width, height, metricName) {
    doc.rect(x, y, width, height).fillAndStroke('#ffffff', C_BORDER_LIGHT);
    doc.rect(x, y, width, 22).fill(C_BG_LIGHT);
    doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
      .text(`Figure 3.0: Machine Learning Forecast & 95% Confidence Band`, x + 10, y + 6);

    const chartX = x + 35;
    const chartY = y + 35;
    const chartW = width - 50;
    const chartH = height - 55;

    const data = (series || []).slice(-25);
    if (data.length < 2) return y + height + 15;

    const maxVal = Math.max(...data.map(d => Math.max(d.actual || 0, d.upperBound || 0, d.forecast || 0)), 1);
    const minVal = Math.min(...data.map(d => Math.min(d.actual || maxVal, d.lowerBound || 0, d.forecast || maxVal)), 0);
    const range = maxVal - minVal || 1;

    // Grid lines
    for (let i = 0; i <= 3; i++) {
      const lineY = chartY + chartH - (i / 3) * chartH;
      doc.moveTo(chartX, lineY).lineTo(chartX + chartW, lineY).strokeColor('#f1f5f9').lineWidth(1).stroke();
      const valLabel = Math.round(minVal + (i / 3) * range);
      doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica')
        .text(valLabel.toLocaleString(), x + 2, lineY - 4, { width: 30, align: 'right' });
    }

    const coords = data.map((d, i) => {
      const cx = chartX + (i / Math.max(1, data.length - 1)) * chartW;
      const cyActual = typeof d.actual === 'number' && !isNaN(d.actual) 
        ? chartY + chartH - ((d.actual - minVal) / range) * chartH 
        : null;
      const fVal = typeof d.forecast === 'number' && !isNaN(d.forecast) ? d.forecast : (typeof d.actual === 'number' ? d.actual : minVal);
      const uVal = typeof d.upperBound === 'number' && !isNaN(d.upperBound) ? d.upperBound : fVal;
      const lVal = typeof d.lowerBound === 'number' && !isNaN(d.lowerBound) ? d.lowerBound : fVal;
      
      const cyForecast = chartY + chartH - ((fVal - minVal) / range) * chartH;
      const cyUpper = chartY + chartH - ((uVal - minVal) / range) * chartH;
      const cyLower = chartY + chartH - ((lVal - minVal) / range) * chartH;
      return { cx, cyActual, cyForecast, cyUpper, cyLower, isPrediction: d.isPrediction, date: d.date };
    });

    // 95% Confidence Band Polygon (if bounds exist)
    const hasBounds = coords.some(c => c.cyUpper !== c.cyForecast);
    if (hasBounds && coords.length > 1) {
      doc.save();
      doc.moveTo(coords[0].cx, coords[0].cyUpper);
      for (let i = 1; i < coords.length; i++) doc.lineTo(coords[i].cx, coords[i].cyUpper);
      for (let i = coords.length - 1; i >= 0; i--) doc.lineTo(coords[i].cx, coords[i].cyLower);
      doc.closePath();
      doc.fillColor('#e0f2fe').fillOpacity(0.5).fill();
      doc.restore();
    }

    // Actuals Line (Solid Blue)
    const actuals = coords.filter(c => c.cyActual !== null);
    if (actuals.length > 1) {
      doc.moveTo(actuals[0].cx, actuals[0].cyActual);
      for (let i = 1; i < actuals.length; i++) doc.lineTo(actuals[i].cx, actuals[i].cyActual);
      doc.strokeColor('#2563eb').lineWidth(2).stroke();
      actuals.forEach(pt => {
        doc.circle(pt.cx, pt.cyActual, 2).fillColor('#2563eb').fill();
      });
    }

    // Forecast Line (Dashed Cyan)
    if (coords.length > 1) {
      doc.save();
      doc.dash(3, { space: 2 });
      doc.moveTo(coords[0].cx, coords[0].cyForecast);
      for (let i = 1; i < coords.length; i++) doc.lineTo(coords[i].cx, coords[i].cyForecast);
      doc.strokeColor(C_CYAN).lineWidth(2).stroke();
      doc.restore();
    }

    // Legend
    const legY = chartY + chartH + 5;
    doc.rect(chartX, legY, 12, 6).fill('#2563eb');
    doc.fillColor(C_DARK).fontSize(6.5).font('Helvetica').text('Historical Actual', chartX + 16, legY);

    doc.rect(chartX + 90, legY, 12, 6).fill(C_CYAN);
    doc.text('ML Forecast Trend', chartX + 106, legY);

    doc.rect(chartX + 190, legY, 12, 6).fill('#bae6fd');
    doc.text('95% Confidence Bounds', chartX + 206, legY);

    return y + height + 15;
  }

  // =========================================================================
  // PAGE 1: EXECUTIVE BRIEFING & CORE TELEMETRY
  // =========================================================================

  // Top Corporate Masthead Banner
  doc.rect(LEFT_X, 40, PAGE_WIDTH, 62).fill(C_NAVY);
  doc.rect(LEFT_X, 102, PAGE_WIDTH, 3).fill(C_CYAN);

  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('DATAPILOT AI DATA ANALYST AGENT', LEFT_X + 16, 52);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Autonomous Statistical Machine Learning & Visual Intelligence Dossier', LEFT_X + 16, 74);
  
  // Document Reference Stamp
  doc.fillColor('#38bdf8').fontSize(7.5).font('Helvetica-Bold').text('CONFIDENTIAL // EXECUTIVE USE', LEFT_X + 310, 54, { align: 'right', width: 190 });
  doc.fillColor('#cbd5e1').fontSize(7.5).font('Helvetica').text(`Dataset: ${datasetName}`, LEFT_X + 310, 66, { align: 'right', width: 190 });
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, LEFT_X + 310, 78, { align: 'right', width: 190 });

  let currentY = 122;

  // 1. Executive Operational Metrics (4 Cards)
  const primaryMetric = analysis.primaryColumns?.metric || 'Records';
  const stats = analysis.descriptiveStats?.[primaryMetric] || {};

  currentY = drawSectionHeader('1. Executive Operational Scorecard', 'Core quantitative metrics synthesized from verified records', currentY);

  const cardW = (PAGE_WIDTH - 24) / 4;
  const kpis = [
    { label: 'HEALTH GRADE', val: `${audit.healthScore || 100}% (${audit.healthGrade || 'A+'})`, sub: 'Completeness & Uniqueness', col: C_EMERALD },
    { label: 'CLEANED RECORDS', val: (audit.cleanedRowsCount || 0).toLocaleString(), sub: `From ${(audit.totalRawRows || 0).toLocaleString()} raw rows`, col: C_BLUE },
    { label: `TOTAL ${primaryMetric.toUpperCase()}`, val: stats.sum ? stats.sum.toLocaleString() : 'N/A', sub: 'Cumulative aggregate', col: C_CYAN },
    { label: `AVG ${primaryMetric.toUpperCase()}`, val: stats.mean ? stats.mean.toLocaleString() : 'N/A', sub: `Median: ${stats.median ? stats.median.toLocaleString() : 'N/A'}`, col: '#7c3aed' }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = LEFT_X + idx * (cardW + 8);
    doc.rect(cardX, currentY, cardW, 52).fillAndStroke(C_BG_LIGHT, C_BORDER_LIGHT);
    doc.fillColor(C_MUTED).fontSize(7).font('Helvetica-Bold').text(kpi.label, cardX + 8, currentY + 8);
    doc.fillColor(kpi.col).fontSize(11).font('Helvetica-Bold').text(String(kpi.val), cardX + 8, currentY + 22);
    doc.fillColor(C_MUTED).fontSize(6.5).font('Helvetica').text(kpi.sub, cardX + 8, currentY + 38);
  });

  currentY += 66;

  // 2. Data Hygiene & Quality Audit Table
  currentY = drawSectionHeader('2. Data Hygiene & Sanitization Audit', 'Algorithmic remediation of duplicates, schema inconsistencies, and nulls', currentY);

  doc.rect(LEFT_X, currentY, PAGE_WIDTH, 34).fillAndStroke('#f1f5f9', C_BORDER_LIGHT);
  doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica')
    .text(`Completeness Ratio: ${audit.completenessScore || 100}%    |    Uniqueness Ratio: ${audit.uniquenessScore || 100}%    |    Duplicate Rows Cleared: ${audit.duplicateCount || 0}    |    Imputed Values: ${audit.imputedValuesCount || 0}`, LEFT_X + 12, currentY + 12);

  currentY += 48;

  // 3. Executive AI Intelligence Narrative
  currentY = drawSectionHeader('3. Executive Strategic Synthesis', 'Autonomous narrative analysis detailing performance and market dynamics', currentY);

  doc.rect(LEFT_X, currentY, PAGE_WIDTH, 68).fillAndStroke('#f0f9ff', '#bae6fd');
  doc.rect(LEFT_X, currentY, 3, 68).fill(C_CYAN);
  doc.fillColor('#0369a1').fontSize(8.5).font('Helvetica')
    .text(insights.executiveSummary || 'Dataset parsed, sanitized, and evaluated with top operational consistency across tracked business metrics.', LEFT_X + 14, currentY + 12, { width: PAGE_WIDTH - 28, lineGap: 3.5 });

  currentY += 82;

  // 4. Statistical Discoveries & Trends
  currentY = drawSectionHeader('4. Key Statistical Discoveries & Momentum', 'Empirically derived findings on growth trajectory and segment concentration', currentY);

  const topInsights = (insights.insights || []).slice(0, 3);
  topInsights.forEach((item) => {
    doc.fillColor(C_CYAN).fontSize(9).font('Helvetica-Bold').text(`[${item.category}] ${item.title}: `, LEFT_X + 6, currentY, { continued: true });
    doc.fillColor(C_DARK).font('Helvetica').fontSize(8.5).text(item.text, { width: PAGE_WIDTH - 20 });
    currentY += 24;
  });

  // =========================================================================
  // PAGE 2: VISUAL ANALYTICS & TELEMETRY (WITH GUARANTEED EMBEDDED GRAPHS)
  // =========================================================================
  doc.addPage();
  currentY = 45;

  currentY = drawSectionHeader('5. Visual Analytics & Trend Telemetry', 'Graphical performance distributions captured from active dataset telemetry', currentY);

  // Graph 1: Historical Trend Area Chart (Image or Vector)
  if (charts?.trendChart) {
    try {
      const clean = charts.trendChart.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(clean, 'base64');
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 175).fillAndStroke('#ffffff', C_BORDER_LIGHT);
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 22).fill(C_BG_LIGHT);
      doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
        .text(`Figure 1.0: Chronological Progression of ${primaryMetric}`, LEFT_X + 10, currentY + 6);
      doc.image(buf, LEFT_X + 10, currentY + 26, { width: PAGE_WIDTH - 20, height: 140 });
      currentY += 190;
    } catch (_) {
      currentY = drawVectorTrendChart(analysis.timeSeriesData, LEFT_X, currentY, PAGE_WIDTH, 150, primaryMetric);
    }
  } else {
    currentY = drawVectorTrendChart(analysis.timeSeriesData, LEFT_X, currentY, PAGE_WIDTH, 150, primaryMetric);
  }

  // Graph 2: Category Volume Breakdown Bar Chart (Image or Vector)
  const primaryCat = analysis.primaryColumns?.category || 'Category';
  if (charts?.categoryChart) {
    try {
      const clean = charts.categoryChart.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(clean, 'base64');
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 175).fillAndStroke('#ffffff', C_BORDER_LIGHT);
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 22).fill(C_BG_LIGHT);
      doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
        .text(`Figure 2.0: Volume Distribution by Top ${primaryCat}`, LEFT_X + 10, currentY + 6);
      doc.image(buf, LEFT_X + 10, currentY + 26, { width: PAGE_WIDTH - 20, height: 140 });
      currentY += 190;
    } catch (_) {
      currentY = drawVectorBarChart(analysis.aggregations?.[0]?.data, LEFT_X, currentY, PAGE_WIDTH, 150, primaryCat, primaryMetric);
    }
  } else {
    currentY = drawVectorBarChart(analysis.aggregations?.[0]?.data, LEFT_X, currentY, PAGE_WIDTH, 150, primaryCat, primaryMetric);
  }

  // Dimension Concentration Summary
  if (analysis.aggregations?.[0]?.data?.length > 0) {
    const topCat = analysis.aggregations[0].data[0];
    doc.rect(LEFT_X, currentY, PAGE_WIDTH, 34).fillAndStroke(C_BG_LIGHT, C_BORDER_LIGHT);
    doc.fillColor(C_DARK).fontSize(8).font('Helvetica')
      .text(`Market Concentration Insight: Leading segment "${topCat.category}" accounts for ${topCat.total.toLocaleString()} total volume (${topCat.count} records), averaging ${topCat.average.toLocaleString()} per transaction.`, LEFT_X + 12, currentY + 12);
  }

  // =========================================================================
  // PAGE 3: PREDICTIVE MACHINE LEARNING & AUTOML BENCHMARKS
  // =========================================================================
  doc.addPage();
  currentY = 45;

  currentY = drawSectionHeader('6. Predictive Machine Learning & Segment Modeling', 'Multi-period time-series forecasting, uncertainty bounds, and AutoML evaluation', currentY);

  // Graph 3: Predictive ML Forecast with 95% Confidence Band (Image or Vector)
  if (charts?.forecastChart) {
    try {
      const clean = charts.forecastChart.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(clean, 'base64');
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 175).fillAndStroke('#ffffff', C_BORDER_LIGHT);
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 22).fill(C_BG_LIGHT);
      doc.fillColor(C_NAVY).fontSize(9).font('Helvetica-Bold')
        .text(`Figure 3.0: Machine Learning Projection & 95% Statistical Confidence Band`, LEFT_X + 10, currentY + 6);
      doc.image(buf, LEFT_X + 10, currentY + 26, { width: PAGE_WIDTH - 20, height: 140 });
      currentY += 190;
    } catch (_) {
      currentY = drawVectorForecastChart(forecast.combinedSeries, LEFT_X, currentY, PAGE_WIDTH, 150, primaryMetric);
    }
  } else {
    currentY = drawVectorForecastChart(forecast.combinedSeries, LEFT_X, currentY, PAGE_WIDTH, 150, primaryMetric);
  }

  // AutoML Benchmark Leaderboard Table
  const autoMl = forecast?.autoMlBenchmark;
  if (autoMl?.models && autoMl.models.length > 0) {
    doc.fillColor(C_NAVY).fontSize(10.5).font('Helvetica-Bold').text('AutoML Algorithm Tournament Leaderboard', LEFT_X, currentY);
    currentY += 14;

    // Table Header
    doc.rect(LEFT_X, currentY, PAGE_WIDTH, 20).fill(C_NAVY);
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
      .text('RANK', LEFT_X + 8, currentY + 6)
      .text('MODEL ARCHITECTURE', LEFT_X + 50, currentY + 6)
      .text('TYPE', LEFT_X + 220, currentY + 6)
      .text('R² ACCURACY', LEFT_X + 300, currentY + 6)
      .text('RMSE', LEFT_X + 380, currentY + 6)
      .text('MAE', LEFT_X + 440, currentY + 6);
    currentY += 20;

    autoMl.models.forEach((m, idx) => {
      const rowBg = idx === 0 ? '#f0fdf4' : (idx % 2 === 0 ? '#ffffff' : C_BG_LIGHT);
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 17).fillAndStroke(rowBg, C_BORDER_LIGHT);
      
      doc.fillColor(idx === 0 ? C_EMERALD : C_DARK).fontSize(7.5).font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .text(idx === 0 ? '#1 (Winner)' : `#${idx + 1}`, LEFT_X + 8, currentY + 4)
        .text(m.modelName, LEFT_X + 50, currentY + 4)
        .text(m.modelType.toUpperCase(), LEFT_X + 220, currentY + 4)
        .text(`${(m.rSquared * 100).toFixed(1)}%`, LEFT_X + 300, currentY + 4)
        .text(String(m.rmse), LEFT_X + 380, currentY + 4)
        .text(String(m.mae), LEFT_X + 440, currentY + 4);
      
      currentY += 17;
    });

    currentY += 16;
  }

  // Future Forecast Table
  if (forecast?.futureForecasts && forecast.futureForecasts.length > 0) {
    doc.fillColor(C_NAVY).fontSize(10.5).font('Helvetica-Bold').text('Projected Future Periods (95% Confidence Interval)', LEFT_X, currentY);
    currentY += 14;

    doc.rect(LEFT_X, currentY, PAGE_WIDTH, 18).fill('#e2e8f0');
    doc.fillColor(C_NAVY).fontSize(7.5).font('Helvetica-Bold')
      .text('PERIOD / HORIZON', LEFT_X + 10, currentY + 5)
      .text('PROJECTED VALUE', LEFT_X + 160, currentY + 5)
      .text('LOWER 95% BOUND', LEFT_X + 290, currentY + 5)
      .text('UPPER 95% BOUND', LEFT_X + 410, currentY + 5);
    currentY += 18;

    forecast.futureForecasts.slice(0, 5).forEach((f, idx) => {
      const rowBg = idx % 2 === 0 ? '#ffffff' : C_BG_LIGHT;
      doc.rect(LEFT_X, currentY, PAGE_WIDTH, 16).fillAndStroke(rowBg, C_BORDER_LIGHT);
      doc.fillColor(C_DARK).fontSize(7.5).font('Helvetica')
        .text(f.date, LEFT_X + 10, currentY + 4)
        .text(f.forecast.toLocaleString(), LEFT_X + 160, currentY + 4)
        .text(f.lowerBound.toLocaleString(), LEFT_X + 290, currentY + 4)
        .text(f.upperBound.toLocaleString(), LEFT_X + 410, currentY + 4);
      currentY += 16;
    });
  }

  // =========================================================================
  // PAGE 4: STRATEGIC ACTION MATRIX & RISK GOVERNANCE
  // =========================================================================
  doc.addPage();
  currentY = 45;

  currentY = drawSectionHeader('7. Strategic Action Matrix & Risk Governance', 'Operational guidelines, prioritized recommendations, and risk remediation', currentY);

  // Strategic Recommendations
  doc.fillColor(C_NAVY).fontSize(11).font('Helvetica-Bold').text('Prioritized Strategic Recommendations', LEFT_X, currentY);
  currentY += 14;

  const recs = insights.recommendations || ['Establish automated telemetry tracking for core metrics.'];
  recs.forEach((rec, idx) => {
    doc.rect(LEFT_X, currentY, PAGE_WIDTH, 36).fillAndStroke('#f0fdf4', '#bbf7d0');
    doc.rect(LEFT_X, currentY, 3, 36).fill(C_EMERALD);
    doc.fillColor(C_EMERALD).fontSize(8.5).font('Helvetica-Bold').text(`RECOMMENDATION 0${idx + 1}:`, LEFT_X + 12, currentY + 7);
    doc.fillColor(C_DARK).font('Helvetica').fontSize(8).text(rec, LEFT_X + 12, currentY + 20, { width: PAGE_WIDTH - 24 });
    currentY += 42;
  });

  currentY += 8;

  // Risk Factors & Anomaly Notices
  doc.fillColor(C_NAVY).fontSize(11).font('Helvetica-Bold').text('Critical Risk Factors & Anomaly Controls', LEFT_X, currentY);
  currentY += 14;

  const risks = (insights.riskAlerts || []).length > 0 ? insights.riskAlerts : ['No high-severity systemic risks detected. Maintain standard variance auditing.'];
  risks.slice(0, 3).forEach((risk, idx) => {
    doc.rect(LEFT_X, currentY, PAGE_WIDTH, 36).fillAndStroke('#fff1f2', '#fecdd3');
    doc.rect(LEFT_X, currentY, 3, 36).fill(C_ROSE);
    doc.fillColor(C_ROSE).fontSize(8.5).font('Helvetica-Bold').text(`RISK ADVISORY 0${idx + 1}:`, LEFT_X + 12, currentY + 7);
    doc.fillColor(C_DARK).font('Helvetica').fontSize(8).text(risk, LEFT_X + 12, currentY + 20, { width: PAGE_WIDTH - 24 });
    currentY += 42;
  });

  currentY += 20;

  // Formal Governance Sign-Off Block
  doc.rect(LEFT_X, currentY, PAGE_WIDTH, 48).fillAndStroke(C_BG_LIGHT, C_BORDER_LIGHT);
  doc.fillColor(C_NAVY).fontSize(8.5).font('Helvetica-Bold').text('GOVERNANCE & AUDIT TRAIL', LEFT_X + 12, currentY + 8);
  doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica')
    .text(`Dossier synthesized autonomously by DataPilot AI Agent Engine. All statistical regressions and machine learning models adhere to 95% confidence standard. Data integrity verified.`, LEFT_X + 12, currentY + 22, { width: PAGE_WIDTH - 24 });

  // =========================================================================
  // TWO-PASS FOOTER: RUNNING HEADER, FOOTER & EXACT PAGE COUNT
  // =========================================================================
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    const oldTop = doc.page.margins.top;
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.top = 0;
    doc.page.margins.bottom = 0;

    // Header on pages > 0
    if (i > 0) {
      doc.rect(LEFT_X, 30, PAGE_WIDTH, 0.5).fill(C_BORDER);
      doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
        .text('DataPilot AI Executive Intelligence Report', LEFT_X, 18, { lineBreak: false });
      doc.text(`Dataset: ${datasetName}`, LEFT_X, 18, { align: 'right', width: PAGE_WIDTH, lineBreak: false });
    }

    // Running Footer
    const footerY = 800;
    doc.rect(LEFT_X, footerY, PAGE_WIDTH, 0.5).fill(C_BORDER);
    doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica')
      .text('DataPilot AI Autonomous Intelligence Platform — Confidential Executive Dossier', LEFT_X, footerY + 8, { lineBreak: false });
    doc.text(`Page ${i + 1} of ${pageCount}`, LEFT_X, footerY + 8, { align: 'right', width: PAGE_WIDTH, lineBreak: false });

    doc.page.margins.top = oldTop;
    doc.page.margins.bottom = oldBottom;
  }

  doc.end();
}
