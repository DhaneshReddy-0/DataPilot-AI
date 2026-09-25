import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Database, 
  Sparkles,
  FileCheck2
} from 'lucide-react';

export default function HealthScorecard({ audit, schema, onQuickClean }) {
  if (!audit) return null;

  const {
    healthScore = 100,
    healthGrade = 'A+',
    completenessScore = 100,
    uniquenessScore = 100,
    duplicateCount = 0,
    missingValuesFound = 0,
    imputedValuesCount = 0,
    cleanedRowsCount = 0,
    totalRawRows = 0,
    columnsCount = 0
  } = audit;

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (grade.startsWith('B')) return 'text-cyan-400 bg-cyan-50 border-cyan-200';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const schemaEntries = Object.entries(schema || {});
  const numCount = schemaEntries.filter(([_, s]) => s.type === 'numeric').length;
  const catCount = schemaEntries.filter(([_, s]) => s.type === 'categorical' || s.type === 'text').length;
  const dateCount = schemaEntries.filter(([_, s]) => s.type === 'datetime').length;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Grade & Score Badge */}
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border flex flex-col items-center justify-center font-extrabold shadow-inner ${getGradeColor(healthGrade)}`}>
            <span className="text-2xl sm:text-3xl">{healthGrade}</span>
            <span className="text-[10px] tracking-wider uppercase font-semibold">Grade</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Data Hygiene & Quality Scorecard</h3>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Auto-Sanitized
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Score: <span className="text-slate-900 font-semibold">{healthScore}%</span> based on data completeness, uniqueness, and format integrity.
            </p>

            {/* Micro Progress Bar */}
            <div className="w-48 sm:w-64 h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Audit Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          
          <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Completeness</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{completenessScore}%</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              {imputedValuesCount} values fixed
            </span>
          </div>

          <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Uniqueness</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{uniquenessScore}%</div>
            <span className="text-[10px] text-cyan-400 flex items-center gap-1 mt-0.5">
              {duplicateCount} duplicates purged
            </span>
          </div>

          <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Cleaned Rows</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{cleanedRowsCount.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 mt-0.5">
              of {totalRawRows.toLocaleString()} raw
            </span>
          </div>

          <div className="glass-panel-subtle rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Dimensions</span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{columnsCount} Cols</div>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {numCount} num · {catCount} cat {dateCount > 0 ? `· ${dateCount} date` : ''}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
