const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Fix 1: loadSampleDataset
code = code.replace(
  /if \(\!res\.ok\) \{\n\s+const errText = await res\.text\(\);\n\s+throw new Error\(errText \|\| 'Failed to load sample dataset'\);\n\s+\}/g,
  `if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText || 'Failed to load sample dataset';
        try { const j = JSON.parse(errText); errMsg = j.error || errMsg; } catch(e){}
        throw new Error(errMsg);
      }`
);

// Fix 2: handleFileUpload
const search2 = `if (!res.ok) {
        let errMsg = 'Failed to process file';
        try {
          const errorData = await res.json();
          errMsg = errorData.error || errMsg;
        } catch (_) {
          errMsg = await res.text();
        }
        throw new Error(errMsg);
      }`;

const replace2 = `if (!res.ok) {
        let errMsg = 'Failed to process file';
        const errText = await res.text();
        try {
          const errorData = JSON.parse(errText);
          errMsg = errorData.error || errMsg;
        } catch (_) {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }`;

code = code.replace(search2, replace2);
fs.writeFileSync('frontend/src/App.jsx', code);
