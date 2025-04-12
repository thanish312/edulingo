import { GoogleGenAI } from "@google/genai";
import { parseCSVtoQuestions } from "./parseCSV"; // Make sure this exists

// Initialize the Gemini client with your API key from .env
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function fetchAIQuestions(subject, topic) {
  try {
    const prompt = `
Generate 5 multiple-choice quiz questions for the subject "${subject}" and topic "${topic}".
Return the output as CSV with these exact headers:
question,optionA,optionB,optionC,optionD,correct,topic
Each line should follow this structure:
"What is 2+2?","2","3","4","5","C","Arithmetic"
Don't include explanations or markdown. Only pure CSV text.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Safely extract the response text
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No valid response from Gemini API");
    }

    // Clean the markdown/code block if present
    const cleanedCSV = text
      .replace(/```csv\s*|\s*```/g, "") // Remove markdown ```csv blocks
      .replace(/\\n/g, "\n")            // Convert escaped newlines to actual newlines
      .trim();

    console.log("🧠 Cleaned CSV Output:\n", cleanedCSV);

    // Parse the CSV using PapaParse and return the formatted questions
    return parseCSVtoQuestions(cleanedCSV);
  } catch (error) {
    console.error("❌ Error fetching AI-generated questions:", error.message);
    throw error;
  }
}
