import { initializeApp, getApps, getApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

export async function GET() {
  try {
    // Use the existing Firebase config - the API key must be from FIREBASE_AI_API_KEY env var
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_AI_API_KEY || process.env.GOOGLE_API_KEY,
      authDomain: "ymym-70888.firebaseapp.com",
      projectId: "ymym-70888",
      storageBucket: "ymym-70888.firebasestorage.app",
      messagingSenderId: "74979615203",
      appId: "1:74979615203:web:b73de504815affb7ec00d6",
      measurementId: "G-4CTQM4LHRT",
    };

    // Initialize FirebaseApp (singleton pattern)
    const firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    // Initialize the Gemini Developer API backend service
    const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

    // Create a GenerativeModel instance with a model that supports your use case
    const model = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

    // Provide a prompt that contains text
    const prompt = "Write a story about a magic backpack.";

    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

    return Response.json({ result: text });
  } catch (error) {
    console.error("Error generating content:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
