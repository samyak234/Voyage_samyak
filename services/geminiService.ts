import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, UserPreferences, DayPlan, Activity, TravelCost, DestinationQuote } from '../types';

// --- Multi-Key Fallback System ---
const apiKeys = (import.meta.env.VITE_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
if (apiKeys.length === 0) {
    console.error("API_KEY environment variable not found or is empty. Please create a .env file and add your key(s).");
}
let currentKeyIndex = 0;
// Initialize with the first key, or a placeholder to allow the app to run and show an error.
let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] || 'NO_KEY_FOUND' });

/**
 * Rotates to the next available API key.
 * @returns {boolean} - True if a new key was successfully rotated to, false if all keys are exhausted.
 */
const rotateApiKey = (): boolean => {
  currentKeyIndex++;
  if (currentKeyIndex >= apiKeys.length) {
    console.error("All available API keys have exceeded their quota.");
    return false;
  }
  console.warn(`Quota limit reached. Switching to API key #${currentKeyIndex + 1}...`);
  ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
  return true;
};


// --- JSON-based AI Helper with Retry & Key Rotation ---
async function callAI<T>(prompt: string, schema: object): Promise<T> {
    const maxRetries = 3; // Retries for temporary errors like 503
    let attempt = 0;
    let delay = 5000;

    while (true) { // Loop until success or a permanent failure
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as T;
        } catch (error) {
            if (error instanceof Error) {
                // Case 1: Quota error - rotate key and retry immediately
                if (error.message.includes('quota')) {
                    if (rotateApiKey()) {
                        attempt = 0; // Reset retries for the new key
                        delay = 5000;
                        continue; // Retry immediately with the new key
                    } else {
                        throw new Error("All API keys have exceeded their daily quota. Please add a new key or try again tomorrow.");
                    }
                }

                // Case 2: Temporary server error (503) - retry with exponential backoff
                if (error.message.includes('503') && attempt < maxRetries) {
                    attempt++;
                    console.warn(`Model overloaded (503). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue; // Retry with the same key
                }
                
                // Case 3: Other, non-recoverable errors
                console.error("AI call failed:", error);
                if (error.message.includes('JSON')) {
                    throw new Error("The AI returned an unexpected format. Please try again.");
                }
                 if (error.message.includes('API key not valid')) {
                    throw new Error("An invalid API key was provided. Please check your .env file.");
                }
                throw new Error(`Failed to generate content: ${error.message}`);
            }
            // Fallback for unknown error types
            throw new Error("An unknown error occurred during AI generation.");
        }
    }
}


// --- Text-based Streaming AI Helper with Retry & Key Rotation ---
async function* callAIStream(prompt: string): AsyncGenerator<string> {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 5000;

    while (true) {
        try {
            const responseStream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            let buffer = '';
            for await (const chunk of responseStream) {
                buffer += chunk.text;
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1);
                    if (line) {
                        yield line.replace(/^[\*\-]\s*/, '');
                    }
                }
            }
            if (buffer.trim()) {
                yield buffer.trim().replace(/^[\*\-]\s*/, '');
            }
            return; // Successful stream completion
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('quota')) {
                    if (rotateApiKey()) {
                        attempt = 0;
                        delay = 5000;
                        continue;
                    } else {
                        throw new Error("All API keys have exceeded their daily quota.");
                    }
                }

                if (error.message.includes('503') && attempt < maxRetries) {
                    attempt++;
                    console.warn(`Streaming model overloaded (503). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }
                
                console.error("AI stream call failed:", error);
                if (error.message.includes('API key not valid')) {
                    throw new Error("An invalid API key was provided. Please check your .env file.");
                }
                throw new Error("An error occurred during AI stream generation.");
            }
            throw new Error("An unknown error occurred during AI stream generation.");
        }
    }
}


// --- Schemas for Specialized, Parallel Calls ---

const titleAndSummarySchema = {
    type: Type.OBJECT,
    properties: {
        tripTitle: { type: Type.STRING },
        tripSummary: { type: Type.STRING },
    },
    required: ['tripTitle', 'tripSummary'],
};

const travelCostSchema = {
    type: Type.OBJECT,
    properties: {
        mode: { type: Type.STRING, enum: ['flight', 'train', 'other'] },
        estimatedCost: { type: Type.STRING },
        costDisclaimer: { type: Type.STRING },
    },
    required: ["mode", "estimatedCost", "costDisclaimer"],
};

const destinationQuoteSchema = {
    type: Type.OBJECT,
    properties: {
        quote: { type: Type.STRING },
        author: { type: Type.STRING },
        translation: { type: Type.STRING },
    },
    required: ["quote", "author"],
};

const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.INTEGER },
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        activities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    time: { type: Type.STRING },
                    location: { type: Type.STRING },
                },
                required: ['name', 'description', 'time', 'location'],
            },
        },
    },
    required: ['day', 'title', 'activities'],
};

const coordinatesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
        },
        required: ['name', 'latitude', 'longitude'],
    },
};


// --- Specialized Generator Functions ---

// --- STAGE 1 (Sub-second): Generate ONLY the trip header ---
export async function generateTripHeader(preferences: UserPreferences): Promise<{ tripTitle: string, tripSummary: string }> {
    const { destination, duration, interests, budget } = preferences;
    const prompt = `
        Generate a captivating trip title and a short, compelling summary for a ${duration}-day trip to ${destination}.
        User Preferences for context:
        - Interests: ${interests.join(', ')}
        - Budget: ${budget}
    `;
    return callAI<{ tripTitle: string, tripSummary: string }>(prompt, titleAndSummarySchema);
}

// --- Background Task: Generate Travel Cost ---
async function generateTravelCost(preferences: UserPreferences): Promise<TravelCost> {
    const { origin, destination } = preferences;
    const prompt = `
        Suggest a primary travel mode (flight or train) from ${origin} to ${destination} and provide a ROUGH cost estimate (e.g., "$500 - $800 USD"). Add a disclaimer that this is just an estimate.
    `;
    return callAI<TravelCost>(prompt, travelCostSchema);
}

// --- Background Task: Generate Destination Quote ---
async function generateDestinationQuote(preferences: UserPreferences): Promise<DestinationQuote> {
    const { destination } = preferences;
    const prompt = `
        Find an inspirational, location-specific quote about ${destination}. Provide the quote, its author, and a simple English translation if it's in another language.
    `;
    return callAI<DestinationQuote>(prompt, destinationQuoteSchema);
}

// --- STAGE 2 (Concurrent Stream): Generate the Packing List ---
export async function* generatePackingListStream(preferences: UserPreferences): AsyncGenerator<string> {
    const { destination, duration, interests } = preferences;
    const prompt = `
        Create a packing list for a ${duration}-day trip to ${destination} for someone interested in ${interests.join(', ')}.
        Provide the output as a simple bulleted list of items, including quantities where appropriate (e.g., "* Comfortable Shoes (2 pairs)").
        Limit the list to the 10 most essential items.
        Do NOT include any other text, titles, or justifications. Just the bulleted list.
    `;
    yield* callAIStream(prompt);
}


// --- STAGE 2 (Concurrent): Generate secondary shell data (cost, quote) ---
export async function generateShellSecondaryData(preferences: UserPreferences): Promise<{travelCost: TravelCost, destinationQuote: DestinationQuote}> {
    const [travelCost, destinationQuote] = await Promise.all([
        generateTravelCost(preferences),
        generateDestinationQuote(preferences),
    ]);
    return { travelCost, destinationQuote };
}


// Helper function to generate the plan for a single day.
async function generateSingleDayPlan(dayNumber: number, preferences: UserPreferences): Promise<DayPlan> {
    const { destination, duration, interests, budget } = preferences;
    const prompt = `
        Generate a detailed plan for Day ${dayNumber} of a ${duration}-day trip to ${destination}.
        - The plan should be logical and follow a theme.
        - The response must be a single JSON object that conforms to the schema.
        - It must include 'day' (${dayNumber}), 'title', an optional 'summary', and a list of 'activities'.
        - For each activity in the list, provide:
            1. 'name': The name of the activity.
            2. 'description': A detailed 2-3 sentence description.
            3. 'time': A suggested time (e.g., "10:00 AM" or "Evening").
            4. 'location': The physical location or address.
        
        User Preferences for context:
        - Interests: ${interests.join(', ')}
        - Budget: ${budget}
    `;
    return callAI<DayPlan>(prompt, dayPlanSchema);
}


// --- STAGE 2 (Sequential): Generate the detailed Daily Plans with progressive updates ---
export async function generateDailyPlans(
    preferences: UserPreferences,
    onDayPlanReceived: (plan: DayPlan) => void
): Promise<DayPlan[]> {
    const { duration } = preferences;
    const dayNumbers = Array.from({ length: duration }, (_, i) => i + 1);
    const allPlans: DayPlan[] = [];

    // Use a for...of loop to process each day sequentially to be kinder to free-tier API limits.
    for (const dayNumber of dayNumbers) {
        const plan = await generateSingleDayPlan(dayNumber, preferences);
        onDayPlanReceived(plan); // Fire callback as each day plan is ready
        allPlans.push(plan);
    }

    return allPlans;
}


// --- STAGE 3 (On-Demand): Fetch coordinates for a day's activities ---
export async function fetchCoordinatesForDay(activities: Activity[], destination: string): Promise<Activity[]> {
    const activityNames = activities.map(a => ({ name: a.name, location: a.location }));
    
    const prompt = `
        For the following list of activities in/around ${destination}, provide their precise latitude and longitude.
        Match the name exactly in your response.
        Activities: ${JSON.stringify(activityNames)}
    `;

    const activitiesWithCoords = await callAI<{name: string, latitude: number, longitude: number}[]>(prompt, coordinatesSchema);

    // Merge coordinates back into original activities
    return activities.map(originalActivity => {
        const coords = activitiesWithCoords.find(c => c.name === originalActivity.name);
        return {
            ...originalActivity,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
        };
    });
}