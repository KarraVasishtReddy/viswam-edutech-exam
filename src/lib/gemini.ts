import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function checkPlagiarism(answer: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following student answer for potential plagiarism or AI-generated patterns.
        Compare it against the context or question provided.
        
        Question/Context: ${context}
        Student Answer: ${answer}
        
        Return a JSON object with:
        - score: 0 to 100 (high means likely plagiarized)
        - reasoning: brief explanation
        - keywords: matched suspicious phrases
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Plagiarism check error:", error);
    return { score: 0, reasoning: "Check failed" };
  }
}
