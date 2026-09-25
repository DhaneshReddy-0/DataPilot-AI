import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Users,
  CreditCard,
  TrendingUp
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onFileUpload, onLoadSample, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['csv', 'xlsx', 'xls'];
    if (!validExts.includes(ext)) {
      setErrorMsg(`Unsupported file format (.${ext}). Please upload CSV or Excel (.xlsx/.xls).`);
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    onFileUpload(selectedFile);
  };

  const sampleDatasets = [
    {
      id: 'sales',
      name: 'E-Commerce Sales & Profit',
      desc: 'Order dates, categories, revenue, discounts, profits',
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-blue-600'
    },
    {
      id: 'employees',
      name: 'HR Employee Attrition',
      desc: 'Salaries, departments, ratings, overtime, churn risk',
      icon: Users,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400'
    },
    {
      id: 'banking',
      name: 'Bank Transactions & Fraud',
      desc: 'Transaction types, amounts, balances, fraud flags',
      icon: CreditCard,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      id: 'saas',
      name: 'SaaS Subscription Metrics',
      desc: 'Monthly MRR, subscriber growth, churn rate, LTV/CAC',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-blue-600">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Dataset for AI Analysis</h2>
            <p className="text-xs text-slate-500">Supports CSV and Excel (.xlsx/.xls)</p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive 
              ? 'border-cyan-400 bg-cyan-50 scale-[1.01]' 
              : 'border-slate-200 hover:border-slate-500 bg-slate-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <UploadCloud className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>

            {selectedFile ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drag & drop your data file here, or <span className="text-blue-600 hover:underline">browse files</span>
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-blue-400" /> CSV</span>
                  <span className="flex items-center gap-1"><FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Excel</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-50 border border-rose-500/20 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {selectedFile && (
          <button
            onClick={handleUploadSubmit}
            disabled={isLoading}
            className="w-full mt-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing & Sanitizing Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run Autonomous AI Analysis</span>
              </>
            )}
          </button>
        )}

        {/* Instant Demo Datasets */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Or Instant Load Demo Dataset:
            </span>
            <span className="text-[10px] text-blue-600">1-Click Test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sampleDatasets.map((sample) => {
              const Icon = sample.icon;
              return (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample.id)}
                  disabled={isLoading}
                  className={`flex items-start gap-3 p-3 rounded-xl border bg-gradient-to-br ${sample.color} hover:scale-[1.02] active:scale-[0.98] transition-all text-left group disabled:opacity-50`}
                >
                  <div className="p-2 rounded-lg bg-slate-50 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-cyan-300 transition-colors">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{sample.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
