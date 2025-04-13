// src/utils/parseCSV.js
import Papa from 'papaparse';

/**
 * Parses a CSV string into an array of question objects.
 * Assumes the CSV has headers: question,optionA,optionB,optionC,optionD,correct,topic
 * @param {string} csvString The raw CSV text data.
 * @returns {Array<object>} An array of question objects, or empty array if parsing fails.
 */
export function parseCSVtoQuestions(csvString) {
  if (!csvString || typeof csvString !== 'string') {
    console.error("parseCSVtoQuestions: Input CSV string is invalid.");
    return [];
  }

  try {
    // Trim whitespace from the input string just in case
    const trimmedCsv = csvString.trim();

    // Check if the string is empty after trimming
    if (trimmedCsv === '') {
        console.warn("parseCSVtoQuestions: Input CSV string is empty after trimming.");
        return [];
    }


    const results = Papa.parse(trimmedCsv, {
      header: true,        // Treat the first row as headers
      skipEmptyLines: true, // Skip empty lines
      transformHeader: header => header.trim(), // Trim whitespace from headers
      transform: value => value.trim(), // Trim whitespace from values
    });

    if (results.errors && results.errors.length > 0) {
      console.error("CSV Parsing Errors:", results.errors);
      // Optionally throw an error or return partial data based on severity
      // For now, return data even if there are minor errors
      // return []; // Or throw new Error('CSV Parsing failed');
    }

    // Filter out any potentially empty rows that might sneak through
    const validData = results.data.filter(row => row && Object.keys(row).length > 0 && row.question);

    // Basic validation of expected keys on the first valid row (optional but good practice)
    if (validData.length > 0) {
        const firstRowKeys = Object.keys(validData[0]);
        const expectedKeys = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correct', 'topic'];
        const missingKeys = expectedKeys.filter(key => !firstRowKeys.includes(key));
        if (missingKeys.length > 0) {
            console.warn(`CSV Parsing Warning: Missing expected keys in parsed data: ${missingKeys.join(', ')}. Check AI output headers.`);
        }
    }


    // console.log("Parsed CSV Data:", validData); // Debug log
    return validData; // PapaParse directly gives objects when header: true

  } catch (error) {
    console.error("Error during CSV parsing with PapaParse:", error);
    return []; // Return empty array on critical parsing error
  }
}