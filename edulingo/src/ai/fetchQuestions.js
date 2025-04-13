// src/services/fetchAIQuestions.js
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { parseCSVtoQuestions } from "./parseCSV"; // Ensure this path is correct

// Initialize the Gemini client ONCE
// IMPORTANT: VITE_ variables are embedded at build time and exposed client-side.
// For production, consider a backend proxy to protect your API key.
const API_KEY = "AIzaSyA2FCf0uM7zx7UG5V4PTfKE89t9p4mnlxs";

if (!API_KEY) {
  console.error("❌ Missing VITE_GEMINI_API_KEY in your .env file");
  // You might want to throw an error or handle this more gracefully
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Configuration for the generation - adjust safety settings as needed
const generationConfig = {
  temperature: 0.7, // Adjust creativity vs predictability
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // Max tokens for the response
};

// Safety settings - adjust based on your content needs
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function fetchAIQuestions(subject, topic, numberOfQuestions = 5) {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  if (!subject || !topic) {
    throw new Error("Subject and Topic are required.");
  }

  console.log(`🚀 Fetching AI questions for Subject: ${subject}, Topic: ${topic}`);

    // Inside the fetchAIQuestions function...
    try {
      // Prompt generation (ensure 'prompt' variable is defined correctly above this block)
      const prompt = `
  Generate exactly ${numberOfQuestions} multiple-choice quiz questions for the subject "${subject}" and topic "${topic}".
  Return the output STRICTLY as CSV text with these exact headers on the first line:
  question,optionA,optionB,optionC,optionD,correct,topic
  
  Each subsequent line must follow this exact format, enclosed in double quotes where necessary:
  "Question text?","Option A","Option B","Option C","Option D","Correct Option Letter (e.g., C)","${topic}"
  
  RULES:
  - Only return the header line and the ${numberOfQuestions} question lines.
  - Do NOT include any introduction, explanation, apologies, or markdown formatting like \`\`\`csv or \`\`\`.
  - Ensure the 'correct' column contains only the letter (A, B, C, or D) of the correct option.
  - Ensure the 'topic' column consistently contains "${topic}".
  - Double-check quotes: Use double quotes around fields containing commas or newlines.
  
  Example of ONE line:
  "What is the powerhouse of the cell?","Mitochondria","Nucleus","Ribosome","Chloroplast","A","Biology"
  `;
  
      // API Call
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig,
        safetySettings: safetySettings,
      });
  
      // --- Robust Response Handling ---
      if (!result) {
          console.error("❌ Gemini API Error: generateContent returned no result object.");
          throw new Error("Received no result object from the AI service.");
      }
  
      let rawText; // Variable to hold the extracted text
  
      // Prefer result.response if it exists and seems valid
      const response = result.response;
  
      if (response && typeof response.text === 'function') {
          // --- Primary Path: Use result.response.text() ---
          rawText = response.text();
  
          if (typeof rawText !== 'string' || rawText.trim() === '') {
            console.error("❌ Gemini API Response Error: Expected text content from response.text(), but received:", rawText, response);
            const candidate = response.candidates?.[0];
            if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
              console.error(`❌ Generation stopped unexpectedly. Reason: ${candidate.finishReason}`, candidate.safetyRatings);
              throw new Error(`AI generation failed. Reason: ${candidate.finishReason}. Check safety settings or prompt.`);
            }
            // If text is empty/invalid but no specific stop reason, throw generic error
            throw new Error("Received invalid or empty text response from the AI service via response.text().");
          }
          console.log("🧠 Raw AI Response Text (Standard Access):\n", rawText);
  
      } else {
          // --- Fallback Path: Try direct access if result.response is missing or invalid ---
           console.warn("⚠️ result.response missing or invalid, attempting direct access on result.", result);
  
           // Check if result.text is a function (or maybe directly a string in some edge cases?)
           if (typeof result.text === 'function') {
              rawText = result.text();
           } else if (typeof result.text === 'string') { // Less likely, but check
              rawText = result.text;
           }
  
           if (typeof rawText !== 'string' || rawText.trim() === '') {
               console.error("❌ Gemini API Response Error: Failed to extract text using result.response or direct result access.", result);
               // Check candidates directly on result for finish reason
               const candidate = result.candidates?.[0];
               if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
                  console.error(`❌ Generation stopped unexpectedly (fallback check). Reason: ${candidate.finishReason}`, candidate.safetyRatings);
                  throw new Error(`AI generation failed (fallback check). Reason: ${candidate.finishReason}.`);
               }
               throw new Error("Could not extract valid text from AI response using any method.");
           }
           console.log("🧠 Raw AI Response Text (Fallback Access):\n", rawText);
      }
  
      // --- Common code path after successfully extracting rawText ---
      const cleanedCSV = rawText
        .replace(/```csv\s*|\s*```/g, "") // Remove potential markdown fences
        .trim();
  
      if (cleanedCSV === '') {
          // This case might happen if the AI returns only whitespace or the cleaning removes everything
          console.error("❌ AI response was empty after cleaning. Raw text was:", rawText);
          throw new Error("AI response resulted in empty content after cleaning.");
      }
  
      console.log("🧹 Cleaned CSV for Parsing:\n", cleanedCSV);
  
      // Parse the cleaned CSV data (ensure parseCSVtoQuestions exists and works)
      const questions = parseCSVtoQuestions(cleanedCSV);
  
      // Basic validation after parsing
      if (!Array.isArray(questions) /* Removed || questions.length === 0 check here */) {
           console.error("❌ CSV Parsing Error: 'parseCSVtoQuestions' did not return a valid array. Input was:\n", cleanedCSV);
          throw new Error("Failed to parse the generated questions from the CSV data (result was not an array).");
      }
      // It's possible the AI returns 0 questions correctly, so check length separately if needed
      if (questions.length === 0) {
          console.warn("⚠️ AI generated 0 questions, or parsing resulted in an empty array.");
          // Decide if this is an error or acceptable behavior
          // throw new Error("AI generated 0 questions.");
      } else if (questions.length !== numberOfQuestions) {
           // Log a warning if the number of questions doesn't match the request
           console.warn(`⚠️ AI generated ${questions.length} questions, but ${numberOfQuestions} were requested.`);
      }
  
      console.log("✅ Successfully fetched and parsed questions:", questions);
      return questions; // Return the parsed array of question objects
  
    } catch (error) {
      // Log the error caught within this try block
      console.error("❌ Error caught within fetchAIQuestions try block:", error.message);
  
      // Add more specific logging based on error type if possible
      if (error.response) { // e.g., Axios-like errors
          console.error("Underlying API Error Response Data:", error.response.data);
      } else if (error.details) { // e.g., gRPC-like errors from the SDK
          console.error("Underlying API Error Details:", error.details);
      } else if (error.message.includes('fetch')) { // Generic network errors
         console.error("Network or Fetch Error Details:", error);
      } else if (error.name === 'TypeError') {
          console.error("TypeError details:", error.stack); // Stack trace can be helpful
      }
  
      // Re-throw a more user-friendly error or the original error
      // depending on how you want the calling code (e.g., the hook) to handle it.
      throw new Error(`Failed to generate quiz questions. Reason: ${error.message}`);
    }
}