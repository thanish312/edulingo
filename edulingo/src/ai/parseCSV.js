// Filename: parseCSV.js (or wherever parseCSVtoQuestions is defined)
import Papa from 'papaparse';

export function parseCSVtoQuestions(csvData) {
  // Trim input data just in case there's leading/trailing whitespace
  const trimmedCsvData = csvData.trim();

  if (!trimmedCsvData) {
      console.warn("Received empty CSV data for parsing.");
      return []; // Return empty array if input is empty
  }

  const parsedData = Papa.parse(trimmedCsvData, {
    header: true,        // Use the first row as keys for the data objects
    skipEmptyLines: true, // Ignore empty lines
    transformHeader: header => header.trim(), // Trim whitespace from headers
    transform: value => value.trim() // Trim whitespace from values
  });

  // Check for parsing errors reported by Papaparse
  if (parsedData.errors && parsedData.errors.length > 0) {
      console.error("Papaparse errors:", parsedData.errors);
      // Decide how to handle errors: throw, return empty, or return partial data?
      // For now, let's log and continue with potentially partial data.
  }

  if (!parsedData.data || parsedData.data.length === 0) {
      console.warn("CSV data parsed but resulted in no data rows.");
      return [];
  }

  // --- MODIFICATION START ---
  return parsedData.data.map(row => {
    // Basic check if row is an object (Papaparse should guarantee this with header:true)
    if (!row || typeof row !== 'object') {
        console.warn("Skipping invalid row from Papaparse:", row);
        return null;
    }

    // Create the nested options object
    const options = {
      A: row.optionA,
      B: row.optionB,
      C: row.optionC,
      D: row.optionD,
    };

    // Filter out any options that might be null, undefined or empty strings
    const filteredOptions = Object.fromEntries(
        Object.entries(options).filter(([key, value]) => value != null && value !== '')
    );

    // Construct the final question object in the desired format
    return {
      question: row.question,
      topic: row.topic,
      correct: row.correct, // Assuming this is 'A', 'B', 'C', or 'D'
      options: filteredOptions // Use the created and filtered nested options object
    };
  }).filter(q => q !== null); // Remove any null entries from skipping invalid rows
  // --- MODIFICATION END ---
}