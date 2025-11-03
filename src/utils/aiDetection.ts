// AI-powered phishing detection enhancement
// Integrates with OpenAI GPT-4 for context-aware analysis

export interface AIAnalysisResult {
  aiScore: number;
  confidence: number;
  threats: string[];
  reasoning: string;
  source: string;
}

const CONFIG = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  USE_AI: true,
  TIMEOUT: 10000,
};

export async function analyzeWithAI(input: string, type: 'url' | 'message'): Promise<AIAnalysisResult> {
  if (!CONFIG.USE_AI || !CONFIG.GEMINI_API_KEY) {
    return { aiScore: 0, confidence: 0, threats: [], reasoning: 'AI analysis disabled', source: 'Disabled' };
  }

  try {
    const prompt = type === 'url' 
      ? `Analyze this URL for phishing threats. Respond with JSON only:
{
  "isPhishing": boolean,
  "confidence": number (0-100),
  "threats": ["threat1", "threat2"],
  "reasoning": "brief explanation"
}

URL: ${input}

Focus on: brand impersonation, typosquatting, suspicious domains, credential harvesting indicators.`
      : `Analyze this message for phishing threats. Respond with JSON only:
{
  "isPhishing": boolean,
  "confidence": number (0-100),
  "threats": ["threat1", "threat2"],
  "reasoning": "brief explanation"
}

Message: ${input}

Focus on: urgent language, credential requests, social engineering, suspicious links.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      }),
      signal: AbortSignal.timeout(CONFIG.TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const aiResult = JSON.parse(jsonMatch[0]);
    
    return {
      aiScore: aiResult.isPhishing ? aiResult.confidence : Math.max(0, 100 - aiResult.confidence),
      confidence: aiResult.confidence,
      threats: aiResult.threats || [],
      reasoning: aiResult.reasoning || '',
      source: 'Google Gemini'
    };
  } catch (error) {
    console.warn('AI analysis failed:', error);
    return { aiScore: 0, confidence: 0, threats: [], reasoning: 'AI analysis failed', source: 'Error' };
  }
}

export async function enhancedAnalysis(input: string, type: 'url' | 'message', heuristicResult: any) {
  try {
    const aiResult = await analyzeWithAI(input, type);
    
    // Only enhance if AI actually worked (has confidence > 0)
    if (aiResult.confidence > 0 && aiResult.source !== 'Disabled' && aiResult.source !== 'Error') {
      // Combine heuristic and AI scores with weighted average
      const heuristicWeight = 0.4;
      const aiWeight = 0.6;
      const combinedScore = Math.round((heuristicResult.riskScore * heuristicWeight) + (aiResult.aiScore * aiWeight));
      
      // PRESERVE HIGH SCORES: Don't let AI lower obvious phishing scores
      const finalScore = Math.max(heuristicResult.riskScore, combinedScore);
      
      // Merge threats and details
      const enhancedDetails = [
        ...heuristicResult.details,
        ...aiResult.threats.map(threat => `🤖 AI: ${threat}`)
      ];
      
      return {
        ...heuristicResult,
        riskScore: Math.min(100, finalScore),
        details: enhancedDetails,
        aiAnalysis: aiResult,
        enhanced: true
      };
    } else {
      // AI unavailable/failed - return original heuristic result
      console.log('🔄 AI unavailable, using heuristics only');
      return {
        ...heuristicResult,
        aiAnalysis: { source: 'Unavailable', reasoning: 'AI analysis disabled or failed' },
        enhanced: false
      };
    }
  } catch (error) {
    console.warn('Enhanced analysis failed, using heuristics only:', error);
    return heuristicResult;
  }
}