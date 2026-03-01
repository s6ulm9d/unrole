import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { ResumeParser } from './resume-parser';

const ResumeSchema = z.object({
  name: z.string(),
  email: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    bullets: z.array(z.string())
  })),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    year: z.string()
  }))
});

const ScoringSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string())
});

export class AIEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  private cleanAndParse(content: string | null) {
    if (!content) return null;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      console.error('Failed to parse AI response:', content);
      console.error('Error detail:', e.message);
      return null;
    }
  }

  async parseResume(text: string, useAI = true) {
    if (!text || text.trim().length < 10) {
      console.error('AI parseResume: Text content is too short');
      return null;
    }

    if (!useAI) {
      console.log('Skipping AI. Using rule-based parser as requested.');
      return ResumeParser.parse(text);
    }

    try {
      // Truncate to avoid context window issues with very large PDFs
      const safeText = text.slice(0, 15000);

      const response = await this.openai.chat.completions.create({
        // ... same as before
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced resume parser. Extract the following information from the provided resume text: name, email, skills, experience (including company, role, duration, and bullet points), and education. Structure precisely as JSON. If a field is missing, provide an empty array/null but do not hallucinate.'
          },
          { role: 'user', content: `RESUME TEXT:\n\n${safeText}` }
        ],
        response_format: zodResponseFormat(ResumeSchema, 'resume')
      }).catch(err => {
        // Fallback to non-AI parser if AI fails (quota, etc.)
        console.warn('AI Parsing failed, falling back to rule-based parser:', err.message);
        return null;
      });

      if (!response) {
        return ResumeParser.parse(text);
      }

      const content = response.choices[0].message.content;
      return this.cleanAndParse(content);
    } catch (error) {
      console.error('Error in AI parseResume, falling back:', error);
      return ResumeParser.parse(text);
    }
  }

  async scoreJob(resumeJson: any, jobDescription: string) {
    try {
      if (!this.openai.apiKey) {
        return {
          score: 50,
          reasoning: 'AI matching is disabled/unavailable.',
          matchingSkills: [],
          missingSkills: []
        };
      }
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Score the candidate match for the job description. Provide a score from 0-100.' },
          { role: 'user', content: `Resume: ${JSON.stringify(resumeJson)}\n\nJob Description: ${jobDescription}` }
        ],
        response_format: zodResponseFormat(ScoringSchema, 'scoring')
      });
      return this.cleanAndParse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in AI scoreJob:', error);
      return {
        score: 0,
        reasoning: 'Failed to score with AI: ' + error.message,
        matchingSkills: [],
        missingSkills: []
      };
    }
  }

  async tailorResume(resumeJson: any, jobDescription: string) {
    try {
      if (!this.openai.apiKey) return resumeJson;
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Rewrite the resume bullets to better match the job description while staying factually accurate. Do not add fake skills.' },
          { role: 'user', content: `Resume: ${JSON.stringify(resumeJson)}\n\nJob Description: ${jobDescription}` }
        ],
        response_format: zodResponseFormat(ResumeSchema, 'tailored_resume')
      });
      return this.cleanAndParse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in AI tailorResume:', error);
      return resumeJson;
    }
  }
}
