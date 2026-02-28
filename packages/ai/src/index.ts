import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

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

  async parseResume(text: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced resume parser. Extract the following information from the provided resume text: name, email, skills, experience (including company, role, duration, and bullet points), and education. Ensure the data is structured correctly and all fields are populated as accurately as possible.'
          },
          { role: 'user', content: `RESUME TEXT:\n\n${text}` }
        ],
        response_format: zodResponseFormat(ResumeSchema, 'resume')
      });
      return this.cleanAndParse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in parseResume:', error);
      return null;
    }
  }

  async scoreJob(resumeJson: any, jobDescription: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Score the candidate match for the job description. Provide a score from 0-100.' },
        { role: 'user', content: `Resume: ${JSON.stringify(resumeJson)}\n\nJob Description: ${jobDescription}` }
      ],
      response_format: zodResponseFormat(ScoringSchema, 'scoring')
    });
    return this.cleanAndParse(response.choices[0].message.content);
  }

  async tailorResume(resumeJson: any, jobDescription: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Rewrite the resume bullets to better match the job description while staying factually accurate. Do not add fake skills.' },
        { role: 'user', content: `Resume: ${JSON.stringify(resumeJson)}\n\nJob Description: ${jobDescription}` }
      ],
      response_format: zodResponseFormat(ResumeSchema, 'tailored_resume')
    });
    return this.cleanAndParse(response.choices[0].message.content);
  }
}
