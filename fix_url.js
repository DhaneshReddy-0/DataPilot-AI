const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Replace API_BASE
code = code.replace(
  /const API_BASE = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5001';/g,
  "const API_BASE = 'https://datapilot-ai-untl.onrender.com';"
);

// Remove the try/catch fallback for upload so it fails properly if there's a real network error
const searchUpload = `      let res;
      try {
        res = await fetch(\`\${API_BASE}/api/upload\`, {
          method: 'POST',
          body: formData
        });
      } catch (_) {
        res = await fetch(\`/api/upload\`, {
          method: 'POST',
          body: formData
        });
      }`;
const replaceUpload = `      let res = await fetch(\`\${API_BASE}/api/upload\`, {
        method: 'POST',
        body: formData
      });`;

code = code.replace(searchUpload, replaceUpload);

fs.writeFileSync('frontend/src/App.jsx', code);
