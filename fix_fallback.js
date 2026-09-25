const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const search = `      try {
        res = await fetch(\`\${API_BASE}/api/samples/\${sampleName}\`, { method: 'POST' });
      } catch (_) {
        // Fallback to relative path if direct port fails
        res = await fetch(\`/api/samples/\${sampleName}\`, { method: 'POST' });
      }`;

const replace = `      res = await fetch(\`\${API_BASE}/api/samples/\${sampleName}\`, { method: 'POST' });`;

code = code.replace(search, replace);

const searchUpload = `      try {
        res = await fetch(\`\${API_BASE}/api/upload\`, {
          method: 'POST',
          body: formData,
        });
      } catch (_) {
        res = await fetch(\`/api/upload\`, {
          method: 'POST',
          body: formData,
        });
      }`;

const replaceUpload = `      res = await fetch(\`\${API_BASE}/api/upload\`, {
        method: 'POST',
        body: formData,
      });`;

code = code.replace(searchUpload, replaceUpload);

fs.writeFileSync('frontend/src/App.jsx', code);
