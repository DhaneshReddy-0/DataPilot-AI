import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  FileCode,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DataStudioTab({ dataset = [], audit, schema, onReClean, isReCleaning }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cleaning Settings State
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [imputeMissing, setImputeMissing] = useState(true);
  const [numericImputation, setNumericImputation] = useState('median');
  const [categoricalImputation, setCategoricalImputation] = useState('mode');

  const columns = Object.keys(schema || {});

  // Filtered Rows
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataset;
    const term = searchTerm.toLowerCase();
    return dataset.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(term)
      );
    });
  }, [dataset, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleApplyClean = () => {
    onReClean({
      removeDuplicates,
      imputeMissing,
      numericImputation,
      categoricalImputation
    });
  };

  const handleExportCSV = () => {
    if (!dataset.length) return;
    const headers = columns.join(',');
    const rows = dataset.map(row => 
      columns.map(c => {
        let val = row[c] === null || row[c] === undefined ? '' : String(row[c]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cleaned_Data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!dataset.length) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataset, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `Cleaned_Data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Cleaning Config Studio Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
              Automated Cleaning Rules & Imputation Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Configure how missing values and duplicates are resolved
            </p>
          </div>

          <button
            onClick={handleApplyClean}
            disabled={isReCleaning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-600/25 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isReCleaning ? 'animate-spin' : ''}`} />
            <span>{isReCleaning ? 'Re-cleaning...' : 'Re-apply Cleaning Rules'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="glass-panel-subtle p-3 rounded-xl border border-slate-200">
            <label className="font-semibold text-slate-600 block mb-1">Deduplication</label>
            <select
              value={removeDuplicates ? 'true' : 'false'}
              onChange={(e) => setRemoveDuplicates(e.target.value === 'true')}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="true">Remove Duplicate Records (Purge)</option>
              <option value="false">Keep Duplicate Records</option>
            </select>
          </div>

          <div className="glass-panel-subtle p-3 rounded-xl border border-slate-200">
            <label className="font-semibold text-slate-600 block mb-1">Missing Value Action</label>
            <select
              value={imputeMissing ? 'impute' : 'drop'}
              onChange={(e) => setImputeMissing(e.target.value === 'impute')}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="impute">Smart Impute Missing Values</option>
              <option value="drop">Drop Rows with Missing Values</option>
            </select>
          </div>

          <div className="glass-panel-subtle p-3 rounded-xl border border-slate-200">
            <label className="font-semibold text-slate-600 block mb-1">Numeric Imputation</label>
            <select
              value={numericImputation}
              onChange={(e) => setNumericImputation(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="median">Median (Outlier Resistant)</option>
              <option value="mean">Mean (Standard Average)</option>
              <option value="zero">Fill with Zero (0)</option>
            </select>
          </div>

          <div className="glass-panel-subtle p-3 rounded-xl border border-slate-200">
            <label className="font-semibold text-slate-600 block mb-1">Categorical Imputation</label>
            <select
              value={categoricalImputation}
              onChange={(e) => setCategoricalImputation(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="mode">Mode (Most Frequent Category)</option>
              <option value="constant">Constant Label ("Unknown")</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cleaned Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search across columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredData.length} records
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-700 text-slate-700 border border-slate-200 transition-all"
            >
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-700 text-slate-700 border border-slate-200 transition-all"
            >
              <FileCode className="h-3.5 w-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Paginated Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                {columns.map(col => (
                  <th key={col} className="p-3 whitespace-nowrap">
                    <div>{col}</div>
                    <span className="text-[9px] text-cyan-400/80 font-normal lowercase">({schema[col]?.type})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-center text-slate-500 font-sans text-[11px]">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  {columns.map(col => (
                    <td key={col} className="p-3 whitespace-nowrap text-slate-600">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-amber-500 font-sans italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-900 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
