import 'dotenv/config';
import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
  throw new Error('GROQ_API_KEY is not set in .env');
}

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const insightFallback = {
  insights: [],
  anomalies: [],
  recommendations: [],
  chartSuggestion: {
    type: 'bar',
    xAxis: '',
    yAxis: '',
    reason: ''
  }
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const normalizeChartSuggestion = (chartSuggestion = {}) => ({
  type: ['bar', 'line', 'pie', 'scatter'].includes(chartSuggestion.type)
    ? chartSuggestion.type
    : 'bar',
  xAxis: chartSuggestion.xAxis || '',
  yAxis: chartSuggestion.yAxis || '',
  reason: chartSuggestion.reason || ''
});

const normalizeInsights = (parsed) => ({
  insights: Array.isArray(parsed.insights) ? parsed.insights : [],
  anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : [],
  recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  chartSuggestion: normalizeChartSuggestion(parsed.chartSuggestion)
});

const getGroqErrorMessage = (error) => {
  if (error?.status === 401) {
    return 'Groq API authentication failed. Check GROQ_API_KEY in .env.';
  }

  if (error?.status === 429) {
    return 'Groq rate limit or quota exceeded. Retry later or check your Groq account limits.';
  }

  if (error?.status === 400) {
    return 'Groq rejected the request. Check GROQ_MODEL and the request payload.';
  }

  return error?.message || 'Groq request failed.';
};

const logGroqError = (operation, error) => {
  console.error(`[Groq] ${operation} failed: ${getGroqErrorMessage(error)}`);
};

const parseJsonObject = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

export const generateInsights = async (dataSummary) => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert data analyst. Always respond with valid JSON only. No markdown, no backticks, no explanation outside the JSON.'
        },
        {
          role: 'user',
          content: `Analyze this dataset summary and return a JSON object with exactly these keys:
{
  "insights": ["3-5 key findings"],
  "anomalies": ["unusual patterns"],
  "recommendations": ["actionable suggestions"],
  "chartSuggestion": {
    "type": "bar|line|pie|scatter",
    "xAxis": "column name",
    "yAxis": "column name",
    "reason": "why this chart helps"
  }
}
Dataset Summary:
${dataSummary}`
        }
      ]
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    const parsed = parseJsonObject(text);

    return parsed ? normalizeInsights(parsed) : insightFallback;
  } catch (error) {
    logGroqError('generateInsights', error);
    return {
      ...insightFallback,
      recommendations: [getGroqErrorMessage(error)]
    };
  }
};

export const askQuestion = async (dataSummary, question) => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 800,
      messages: [
        {
          role: 'system',
          content:
            'You are a data analyst assistant. Answer questions about datasets clearly and concisely.'
        },
        {
          role: 'user',
          content: `Dataset Summary:\n${dataSummary}\n\nQuestion: ${question}`
        }
      ]
    });

    return completion.choices[0]?.message?.content?.trim() || 'No response returned from Groq.';
  } catch (error) {
    logGroqError('askQuestion', error);
    return getGroqErrorMessage(error);
  }
};
