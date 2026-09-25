# 📊 DataPilot AI — Autonomous AI Data Analyst Agent Platform

> **"User uploads data, and AI automatically cleans it, creates charts, finds insights, predicts future trends, and generates a report."** 🚀

DataPilot AI is a full-stack, enterprise-grade AI Data Analyst Agent built with **Node.js, Express, React, Vite, and Tailwind CSS**. It automates end-to-end data analysis from file ingestion to executive storytelling and PDF generation.

---

## 🌟 Key Capabilities & Requirements Addressed

1. **Multi-Format Ingestion**:
   - Supports **CSV**, **Excel** (`.xlsx`, `.xls`), **JSON**, and **XML**.
   - Auto-detects delimiters (comma, semicolon, tab, pipe) and normalizes nested hierarchies.
   - Built-in 1-click test datasets: *E-Commerce Sales*, *HR Attrition*, *Bank Fraud*, and *SaaS MRR*.

2. **Schema & Semantic Understanding**:
   - Automatically detects columns and types: Numeric, Categorical, Datetime, Boolean, and Text.
   - Counts valid vs. missing records, distinct cardinalities, and field distributions.

3. **Autonomous Data Cleaning & Health Audit**:
   - Identifies and purges duplicate rows.
   - Smart missing value imputation:
     - Numeric: Median (outlier-resistant), Mean, or Zero.
     - Categorical: Mode (most frequent) or Constant (`Unknown`).
   - Calculates a **Data Hygiene & Health Score** (0–100%) and Letter Grade (A+, A, B, C, F) based on completeness, uniqueness, and consistency.

4. **Deep Statistical Analysis**:
   - Descriptive statistics: Count, Sum, Mean, Median, Min, Max, StdDev, Q1, Q3, and IQR.
   - Anomaly & Outlier detection ($1.5 \times IQR$ threshold).
   - Pearson Correlation Matrix across all numeric dimensions.
   - Group-by aggregations and category contributions.

5. **Autonomous Chart Generation & Expanded Visual Archetypes**:
   - Automatically selects and configures best chart types based on schema:
     - **Time Series Area / Line Chart**: Historical progression over time with smooth gradient fills.
     - **Category Bar Chart**: Ranked dimension breakdown.
     - **Market Share Donut Chart**: Top segment contribution with percentage breakdown.
     - **Multi-Dimensional Radar / Spider Chart**: Normalized multi-metric attribute comparison across top categories.
     - **Bivariate Scatter Dispersion Plot**: Visualizes relationships between metrics.
     - **Pearson Correlation Heatmap Matrix**: Color-coded grid showing pairwise correlation strength (-1.0 to +1.0).
   - **Interactive Custom Chart Studio**: Select any X-Axis, Y-Axis, Aggregation (Sum, Avg, Count), and Chart Type (**Bar, Line, Area, Donut, Radar**) on the fly!

6. **AI Executive Insights & Narration**:
   - Synthesizes findings into natural language executive bullet points:
     - *Volume & Scale*, *Growth Trajectory*, *Segment Dominance*, and *Statistical Anomalies*.
   - Actionable Strategic Recommendations & Critical Risk Notices.
   - **Audio Voice Narration ("Listen to Briefing")**: Reads out the executive briefing aloud using browser text-to-speech.

7. **Advanced Machine Learning & Predictive Studio**:
   - **Multi-Model Predictive Forecasting**: Time-series projection using Linear Regression, Polynomial (Degree 2 Curvature), Exponential Smoothing, and Moving Averages with **95% Confidence Bounds**.
   - **AutoML Algorithm Tournament**: Evaluates 4 candidate models side-by-side, compares $R^2$ accuracy, RMSE, and MAE, and crowns the winning algorithm.
   - **K-Means Clustering & Persona Discovery**: Unsupervised segmentation clustering records into natural personas with 2D dispersion scatter mapping and average profile telemetry.
   - **Predictive Feature Importance**: Ranks which input features exert the strongest predictive leverage over the target metric.
   - **"What-If" Scenario Simulator**: Adjust metric multipliers (-50% to +50%) with interactive sliders to project real-time business impact.

8. **Conversational "Ask your Data" (Natural Language Studio)**:
   - Chat directly with your data in plain English:
     - *"What are the top 5 products by sales?"*
     - *"Show me anomalies in sales"*
     - *"What is the average profit?"*
     - *"How many total records are there?"*
   - AI assistant returns computed metric badges, dynamic charts, and filtered data tables.

9. **Automated Executive PDF Report Generation**:
   - Generates and downloads a branded, high-resolution PDF report featuring:
     - Executive AI Narrative
     - Data Quality Scorecard
     - Key Performance Indicators (KPIs)
     - Analytical Discoveries & Trends
     - Predictive Forecast Table with 95% confidence intervals
     - Strategic Recommendations & Risk Notices

10. **Data Studio & Export**:
    - Paginated and searchable table of raw vs. cleaned data.
    - Export cleaned data to **CSV** or **JSON**.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server** (Port `5001`):
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5001
   ```

2. **Start the Frontend Dev Server** (Port `3000`):
   ```bash
   cd ../frontend
   npm run dev
   # App runs on http://localhost:3000
   ```

3. Open **`http://localhost:3000`** in your browser. The app will automatically initialize with sample e-commerce data!

---

## 📂 Project Structure

```
mini project/
├── backend/
│   ├── src/
│   │   ├── analyzer.js        # Statistical metrics, correlations, outliers, chart heuristics
│   │   ├── cleaner.js         # Deduplication, smart imputation, health scoring
│   │   ├── insights.js        # AI executive narrative & natural language query engine
│   │   ├── parser.js          # Multi-format parser (CSV, XLSX, XLS, JSON, XML)
│   │   ├── pdfGenerator.js    # PDF report builder using PDFKit
│   │   ├── predictor.js       # Time-series ML forecasting & what-if simulator
│   │   ├── sampleData.js      # Built-in industry datasets (Sales, HR, Banking, SaaS)
│   │   └── server.js          # Express REST API endpoints
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiInsightsTab.jsx     # AI executive briefing & audio narration
│   │   │   ├── AskAiTab.jsx          # Conversational Natural Language Q&A studio
│   │   │   ├── DataStudioTab.jsx     # Searchable data grid & custom cleaning rules
│   │   │   ├── ForecastingTab.jsx    # ML forecast curve & what-if simulator
│   │   │   ├── HealthScorecard.jsx   # Data health score (0-100%) & hygiene audit
│   │   │   ├── Navbar.jsx            # Top navigation & export triggers
│   │   │   ├── OverviewTab.jsx       # Executive summary & KPI telemetry
│   │   │   ├── SmartChartsTab.jsx    # Recharts visualizations & custom chart builder
│   │   │   └── UploadModal.jsx       # Drag & drop upload & sample picker
│   │   ├── App.jsx                   # Central state orchestration
│   │   ├── index.css                 # Tailwind & Glassmorphism styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── samples/                          # Sample files for drag-and-drop testing
│   ├── sales_data.csv
│   ├── bank_transactions.json
│   └── employee_records.xml
│
└── README.md
```

---

## 💡 What Makes DataPilot AI Unique?

| Feature | Standard Analyst Tools | **DataPilot AI Agent** |
| :--- | :--- | :--- |
| **Data Hygiene Scorecard** | Manual data checks | **Autonomous A–F score & 1-click imputation** |
| **"Ask your Data" NLQ** | Rigid SQL or complex UI | **Natural language query answering with dynamic charts** |
| **What-If Scenario Simulator** | Static historical charts | **Interactive sliders with real-time target metric delta** |
| **Executive Audio Narration** | Silent text summaries | **Built-in text-to-speech audio executive briefing** |
| **Confidence Bounds** | Single line forecast | **95% statistical upper and lower uncertainty bands** |
| **Multi-Format Ingestion** | CSV only | **CSV, Excel (.xlsx/.xls), JSON, XML out-of-the-box** |
| **Instant Report Export** | Raw screenshots | **Multi-page executive intelligence PDF document** |
