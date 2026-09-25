/**
 * Data Cleaning Engine: Deduplication, Imputation, Schema Inference, Health Scoring
 */

export function inferSchema(data) {
  if (!data || data.length === 0) return {};
  const columns = Object.keys(data[0] || {});
  const schema = {};

  for (const col of columns) {
    let numericCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    let totalNonEmpty = 0;
    const uniqueValues = new Set();

    for (const row of data) {
      const val = row[col];
      if (val === null || val === undefined || val === '') continue;
      totalNonEmpty++;
      uniqueValues.add(val);

      if (typeof val === 'number') {
        numericCount++;
      } else if (typeof val === 'boolean') {
        booleanCount++;
      } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/^(true|false|yes|no|1|0)$/i.test(trimmed)) {
          booleanCount++;
        }
        
        // Strip currency, commas, and percentage to detect numeric values like "$1,200,000" or "45%"
        const numCandidate = trimmed.replace(/[$,%]/g, '').trim();
        if (numCandidate !== '' && !isNaN(Number(numCandidate)) && !isNaN(parseFloat(numCandidate))) {
          numericCount++;
        } else {
          // Check if valid date
          const parsedDate = Date.parse(trimmed);
          if (!isNaN(parsedDate) && (trimmed.includes('-') || trimmed.includes('/') || trimmed.includes(':') || trimmed.length > 8)) {
            dateCount++;
          }
        }
      } else if (val instanceof Date) {
        dateCount++;
      }
    }

    let detectedType = 'text';
    const numRatio = totalNonEmpty > 0 ? numericCount / totalNonEmpty : 0;
    const dateRatio = totalNonEmpty > 0 ? dateCount / totalNonEmpty : 0;
    const boolRatio = totalNonEmpty > 0 ? booleanCount / totalNonEmpty : 0;

    if (numRatio > 0.6) {
      detectedType = 'numeric';
    } else if (dateRatio > 0.6) {
      detectedType = 'datetime';
    } else if (boolRatio > 0.8) {
      detectedType = 'boolean';
    } else if (uniqueValues.size <= Math.min(50, totalNonEmpty * 0.3) && uniqueValues.size > 1) {
      detectedType = 'categorical';
    }

    schema[col] = {
      type: detectedType,
      uniqueCount: uniqueValues.size,
      totalCount: data.length,
      nonEmptyCount: totalNonEmpty,
      nullCount: data.length - totalNonEmpty,
      nullPercentage: Number((((data.length - totalNonEmpty) / data.length) * 100).toFixed(1))
    };
  }

  return schema;
}

export function cleanData(rawData, options = {}) {
  const {
    removeDuplicates = true,
    imputeMissing = true, // 'smart', 'drop', or 'none'
    numericImputation = 'median', // 'mean', 'median', 'zero'
    categoricalImputation = 'mode' // 'mode', 'constant'
  } = options;

  const totalRawRows = rawData.length;
  const initialSchema = inferSchema(rawData);
  const columns = Object.keys(initialSchema);

  // 1. Identify and remove duplicate records
  const seenHashes = new Set();
  const duplicateIndices = [];
  const deduplicated = [];

  rawData.forEach((row, idx) => {
    const rowHash = JSON.stringify(row);
    if (seenHashes.has(rowHash)) {
      duplicateIndices.push(idx);
      if (!removeDuplicates) {
        deduplicated.push({ ...row });
      }
    } else {
      seenHashes.add(rowHash);
      deduplicated.push({ ...row });
    }
  });

  const duplicateCount = duplicateIndices.length;

  // 2. Compute column statistics for imputation
  const colStats = {};
  for (const col of columns) {
    const type = initialSchema[col].type;
    const values = deduplicated
      .map(r => r[col])
      .filter(v => v !== null && v !== undefined && v !== '');

    if (type === 'numeric') {
      const numbers = values
        .map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,%]/g, '')))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);

      if (numbers.length > 0) {
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        const mean = sum / numbers.length;
        const mid = Math.floor(numbers.length / 2);
        const median = numbers.length % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
        colStats[col] = { mean: Number(mean.toFixed(2)), median: Number(median.toFixed(2)), count: numbers.length };
      } else {
        colStats[col] = { mean: 0, median: 0, count: 0 };
      }
    } else {
      // Categorical / text mode
      const freq = {};
      values.forEach(v => {
        const str = String(v).trim();
        freq[str] = (freq[str] || 0) + 1;
      });
      let mode = 'Unknown';
      let maxFreq = 0;
      for (const [k, count] of Object.entries(freq)) {
        if (count > maxFreq) {
          maxFreq = count;
          mode = k;
        }
      }
      colStats[col] = { mode };
    }
  }

  // 3. Impute or Drop missing values
  let missingValuesFound = 0;
  let imputedValuesCount = 0;
  const cleanedRows = [];

  for (const row of deduplicated) {
    let hasNull = false;
    const newRow = {};

    for (const col of columns) {
      let val = row[col];
      const isNull = val === null || val === undefined || val === '' || String(val).toLowerCase() === 'null' || String(val).toLowerCase() === 'n/a';

      if (isNull) {
        hasNull = true;
        missingValuesFound++;

        if (imputeMissing) {
          imputedValuesCount++;
          const type = initialSchema[col].type;
          if (type === 'numeric') {
            val = numericImputation === 'mean' ? colStats[col].mean : (numericImputation === 'zero' ? 0 : colStats[col].median);
          } else if (type === 'datetime') {
            val = new Date().toISOString().split('T')[0];
          } else {
            val = categoricalImputation === 'mode' && colStats[col]?.mode ? colStats[col].mode : 'Unknown';
          }
        }
      } else {
        // Cast types accurately
        const type = initialSchema[col].type;
        if (type === 'numeric') {
          if (typeof val !== 'number') {
            const parsed = parseFloat(String(val).replace(/[$,%]/g, ''));
            val = !isNaN(parsed) ? parsed : 0;
          }
        } else if (type === 'datetime') {
          try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              val = d.toISOString().split('T')[0];
            }
          } catch (_) {}
        }
      }

      newRow[col] = val;
    }

    if (!imputeMissing && hasNull) {
      continue;
    }

    cleanedRows.push(newRow);
  }

  // 4. Calculate Data Health Score
  const completeness = totalRawRows > 0 ? Math.max(0, 100 - (missingValuesFound / (totalRawRows * columns.length)) * 100) : 100;
  const uniqueness = totalRawRows > 0 ? Math.max(0, 100 - (duplicateCount / totalRawRows) * 100) : 100;
  const healthScore = Math.round(completeness * 0.6 + uniqueness * 0.4);

  let healthGrade = 'A+';
  if (healthScore < 60) healthGrade = 'F';
  else if (healthScore < 70) healthGrade = 'D';
  else if (healthScore < 80) healthGrade = 'C';
  else if (healthScore < 90) healthGrade = 'B';
  else if (healthScore < 95) healthGrade = 'A';

  return {
    cleanedData: cleanedRows,
    schema: initialSchema,
    audit: {
      totalRawRows,
      cleanedRowsCount: cleanedRows.length,
      duplicateCount,
      missingValuesFound,
      imputedValuesCount,
      completenessScore: Number(completeness.toFixed(1)),
      uniquenessScore: Number(uniqueness.toFixed(1)),
      healthScore,
      healthGrade,
      columnsCount: columns.length
    }
  };
}
