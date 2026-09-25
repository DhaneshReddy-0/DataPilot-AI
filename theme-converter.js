const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(directoryPath);

const replacements = [
  { from: /bg-slate-950(?!\/)/g, to: 'bg-slate-50' },
  { from: /bg-slate-950\/80/g, to: 'bg-white/90' },
  { from: /bg-slate-950\/50/g, to: 'bg-slate-50' },
  { from: /bg-slate-900(?!\/)/g, to: 'bg-white' },
  { from: /bg-slate-900\/60/g, to: 'bg-slate-50' },
  { from: /bg-slate-800(?!\/)/g, to: 'bg-slate-100' },
  { from: /bg-slate-800\/40/g, to: 'bg-slate-100' },
  { from: /border-slate-800/g, to: 'border-slate-200' },
  { from: /border-slate-700/g, to: 'border-slate-200' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-200/g, to: 'text-slate-700' },
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /bg-rose-950\/40/g, to: 'bg-rose-50' },
  { from: /bg-rose-950\/30/g, to: 'bg-rose-50' },
  { from: /bg-emerald-950\/40/g, to: 'bg-emerald-50' },
  { from: /border-cyan-500\/20/g, to: 'border-cyan-200' },
  { from: /border-cyan-500\/30/g, to: 'border-cyan-200' },
  { from: /bg-cyan-500\/10/g, to: 'bg-cyan-50' },
  { from: /bg-cyan-500\/20/g, to: 'bg-cyan-100' },
  { from: /bg-blue-950\/40/g, to: 'bg-blue-50' },
  { from: /border-slate-900/g, to: 'border-slate-200' },
  { from: /text-slate-100/g, to: 'text-slate-800' },
  { from: /text-slate-500/g, to: 'text-slate-400' }, // This flips back? Wait, let's avoid flipping issues.
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Specific non-conflict replacements first
  content = content.replace(/bg-slate-950(?!\/)/g, 'bg-slate-50');
  content = content.replace(/bg-slate-950\/80/g, 'bg-white/90');
  content = content.replace(/bg-slate-950\/50/g, 'bg-slate-50');
  content = content.replace(/bg-slate-900(?!\/)/g, 'bg-white');
  content = content.replace(/bg-slate-900\/60/g, 'bg-slate-50');
  content = content.replace(/bg-slate-800(?!\/)/g, 'bg-slate-100');
  content = content.replace(/bg-slate-800\/40/g, 'bg-slate-100');
  content = content.replace(/border-slate-900/g, 'border-slate-200');
  content = content.replace(/border-slate-800/g, 'border-slate-200');
  content = content.replace(/border-slate-700/g, 'border-slate-200');
  
  // Text colors
  content = content.replace(/text-slate-400/g, 'TEXT_SLATE_TEMP_500');
  content = content.replace(/text-slate-300/g, 'TEXT_SLATE_TEMP_600');
  content = content.replace(/text-slate-200/g, 'TEXT_SLATE_TEMP_700');
  content = content.replace(/text-white/g, 'text-slate-900');
  
  // Restore text colors
  content = content.replace(/TEXT_SLATE_TEMP_500/g, 'text-slate-500');
  content = content.replace(/TEXT_SLATE_TEMP_600/g, 'text-slate-600');
  content = content.replace(/TEXT_SLATE_TEMP_700/g, 'text-slate-700');

  content = content.replace(/bg-rose-950\/40/g, 'bg-rose-50');
  content = content.replace(/bg-rose-950\/30/g, 'bg-rose-50');
  content = content.replace(/bg-emerald-950\/40/g, 'bg-emerald-50');
  content = content.replace(/border-cyan-500\/20/g, 'border-cyan-200');
  content = content.replace(/border-cyan-500\/30/g, 'border-cyan-200');
  content = content.replace(/bg-cyan-500\/10/g, 'bg-cyan-50');
  content = content.replace(/bg-cyan-500\/20/g, 'bg-cyan-100');
  content = content.replace(/bg-blue-950\/40/g, 'bg-blue-50');

  // Specific overrides for charts where we used dark colors
  content = content.replace(/stroke="#334155"/g, 'stroke="#e2e8f0"');
  content = content.replace(/fill="#1e293b"/g, 'fill="#f8fafc"');
  
  // Fix App.jsx Home page button which is now text-slate-900 (was text-white)
  // Let's manually keep buttons blue with white text if they were bg-blue-600
  if (file.includes('App.jsx')) {
     content = content.replace(/bg-blue-600 hover:bg-blue-500 shadow-md transition-all text-sm flex items-center gap-2" \/>\n                Upload Dataset/g, 'bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all text-sm flex items-center gap-2" \/>\n                Upload Dataset');
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Theme updated successfully.');
