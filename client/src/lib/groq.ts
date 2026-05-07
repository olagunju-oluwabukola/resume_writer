
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function getKey(): string {
  // 1. Vite env (build-time)
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey !== "") return envKey;
  // 2. User-configured at runtime via Settings page
  const storedKey = localStorage.getItem("resumerx_groq_key");
  if (storedKey && storedKey !== "") return storedKey;
  return "";
}

async function groqChat(systemPrompt: string, userPrompt: string, maxTokens = 1500): Promise<string> {
  const key = getKey();
  if (!key) {
    throw new Error("No Groq API key found. Add VITE_GROQ_API_KEY to your .env file or set it in Settings.");
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", errorData);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your Groq API key.");
      }
      throw new Error(`API error ${response.status}: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    return content;
  } catch (error) {
    console.error("Groq chat error:", error);
    throw error;
  }
}



export interface AIRecommendations {
  keep: string[];
  modify: string[];
  remove: string[];
  matchScore: number;
  summary: string;
}

export interface SkillsGap {
  present: string[];
  missing: string[];
  suggestions: string[];
}

export interface InterviewPrep {
  likelyQuestions: string[];
  suggestedAnswers: Record<string, string>;
  redFlags: string[];
}

export interface ResumeScore {
  overall: number;
  clarity: number;
  impact: number;
  atsCompatibility: number;
  feedback: string[];
}

// Resume Analysis

export async function analyzeResumeWithGroq(
  resumeContent: string,
  jobDescription: string
): Promise<AIRecommendations> {
  const system = `You are an expert resume reviewer and career coach. Analyse resumes against job descriptions with precision. Always respond with valid JSON only — no markdown, no prose outside the JSON object.`;

  const user = `Analyse this resume against the job description and return a JSON object with exactly these keys:
- "keep": array of specific resume elements that are strong matches (be specific, quote actual skills/experience)
- "modify": array of specific elements to reword, quantify, or reframe for this role
- "remove": array of elements that are irrelevant or outdated for this specific role
- "matchScore": integer 0–100 representing overall match
- "summary": 1–2 sentence plain-English assessment

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the JSON object. No other text.`;

  const raw = await groqChat(system, user, 1200);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      keep: Array.isArray(parsed.keep) ? parsed.keep : [],
      modify: Array.isArray(parsed.modify) ? parsed.modify : [],
      remove: Array.isArray(parsed.remove) ? parsed.remove : [],
      matchScore: typeof parsed.matchScore === "number" ? Math.min(100, Math.max(0, parsed.matchScore)) : 0,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };
  } catch (error) {
    console.error("Failed to parse analysis response:", error);
    throw new Error("Invalid response format from AI");
  }
}

// Cover Letter Generation

export async function generateCoverLetter(
  resumeContent: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  const system = `You are an expert career writer who crafts compelling, personalised cover letters. Write in a confident, professional tone. Never use generic filler phrases. Be specific and tailored.`;

  const user = `Write a professional cover letter for the following role.

COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeContent}

Requirements:
- Address it "Dear Hiring Manager,"
- 3–4 focused paragraphs
- Open with a strong hook referencing the specific role
- Highlight 2–3 concrete achievements from the resume that directly match the job
- Show genuine interest in ${companyName} specifically
- Close with a confident call to action
- Sign off with "Best regards," and leave space for the candidate's name
- Plain text only, no markdown, no bullet points in the letter itself`;

  return groqChat(system, user, 1500);
}

// Resume Tailoring

export async function tailorResume(
  resumeContent: string,
  jobDescription: string
): Promise<string> {
  const system = `You are an expert resume writer. Rewrite resumes to maximise ATS match scores and recruiter impact. Preserve all factual information — never invent experience. Improve wording, emphasis, and structure.`;

  const user = `Rewrite this resume tailored specifically for the job description below.

Rules:
- Do NOT invent experience, companies, or qualifications
- Reorder and reword bullet points to match the job's language
- Quantify achievements where the original implies them
- Remove sections/bullets irrelevant to this role
- Keep the same basic structure (summary, skills, experience, education)
- Output plain text formatted as a clean resume — no markdown headers, use ALL CAPS section titles

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeContent}

Output the full tailored resume only. No commentary.`;

  return groqChat(system, user, 2000);
}

// Skills Gap Analysis

export async function analyzeSkillsGap(
  resumeContent: string,
  jobDescription: string
): Promise<SkillsGap> {
  const system = `You are a technical recruiter. Identify skills gaps between candidates and roles. Respond with valid JSON only.`;

  const user = `Compare the resume to the job description and return a JSON object with:
- "present": skills/technologies from the JD that appear in the resume
- "missing": skills/technologies from the JD NOT in the resume
- "suggestions": specific learning resources or actions to close the top 3 gaps

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the JSON object.`;

  const raw = await groqChat(system, user, 800);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      present: Array.isArray(parsed.present) ? parsed.present : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error("Failed to parse skills gap response:", error);
    throw new Error("Invalid response format from AI");
  }
}

// Interview Prep

export async function generateInterviewPrep(
  resumeContent: string,
  jobDescription: string
): Promise<InterviewPrep> {
  const system = `You are an experienced interview coach. Generate targeted interview prep based on a candidate's resume and a specific job. Respond with valid JSON only.`;

  const user = `Generate interview preparation for this candidate and role.

Return a JSON object with:
- "likelyQuestions": array of 5–7 likely interview questions for this specific role
- "suggestedAnswers": object mapping each question to a concise suggested answer using the STAR method where applicable, drawing from the resume
- "redFlags": array of 2–3 potential concerns an interviewer might have, with brief mitigation advice

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the JSON object.`;

  const raw = await groqChat(system, user, 2000);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      likelyQuestions: Array.isArray(parsed.likelyQuestions) ? parsed.likelyQuestions : [],
      suggestedAnswers: typeof parsed.suggestedAnswers === "object" ? parsed.suggestedAnswers : {},
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    };
  } catch (error) {
    console.error("Failed to parse interview prep response:", error);
    throw new Error("Invalid response format from AI");
  }
}

// Resume Score

export async function scoreResume(resumeContent: string): Promise<ResumeScore> {
  const system = `You are a professional resume evaluator. Score resumes objectively and give actionable feedback. Respond with valid JSON only.`;

  const user = `Score this resume and return a JSON object with:
- "overall": integer 0–100 overall score
- "clarity": integer 0–100 for clarity and readability
- "impact": integer 0–100 for impact of achievements and language
- "atsCompatibility": integer 0–100 for ATS (applicant tracking system) friendliness
- "feedback": array of 4–6 specific, actionable improvement suggestions

RESUME:
${resumeContent}

Respond with ONLY the JSON object.`;

  const raw = await groqChat(system, user, 800);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      overall: parsed.overall ?? 0,
      clarity: parsed.clarity ?? 0,
      impact: parsed.impact ?? 0,
      atsCompatibility: parsed.atsCompatibility ?? 0,
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    };
  } catch (error) {
    console.error("Failed to parse score response:", error);
    throw new Error("Invalid response format from AI");
  }
}