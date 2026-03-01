export interface ResumeData {
    name: string;
    email: string;
    skills: string[];
    experience: {
        company: string;
        role: string;
        duration: string;
        bullets: string[];
    }[];
    education: {
        school: string;
        degree: string;
        year: string;
    }[];
}

export class ResumeParser {
    static parse(text: string): ResumeData {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const email = this.extractEmail(text);
        const name = this.extractName(lines, email);
        const sections = this.splitSections(lines);

        return {
            name,
            email,
            skills: this.extractSkills(sections['SKILLS'] || sections['TECHNICAL SKILLS'] || sections['COMPETENCIES'] || []),
            experience: this.extractExperience(sections['EXPERIENCE'] || sections['WORK EXPERIENCE'] || sections['EMPLOYMENT HISTORY'] || []),
            education: this.extractEducation(sections['EDUCATION'] || sections['ACADEMIC BACKGROUND'] || []),
        };
    }

    private static extractEmail(text: string): string {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const match = text.match(emailRegex);
        return match ? match[0] : '';
    }

    private static extractName(lines: string[], email: string): string {
        // Usually the first line that doesn't contain the email or a phone number
        for (const line of lines.slice(0, 5)) {
            if (line.toLowerCase().includes(email.toLowerCase()) || line.match(/\d{5,}/)) {
                continue;
            }
            if (line.length > 2 && line.length < 50) {
                return line;
            }
        }
        return 'Unknown Name';
    }

    private static splitSections(lines: string[]): Record<string, string[]> {
        const sections: Record<string, string[]> = {};
        let currentSection = 'HEADER';
        sections[currentSection] = [];

        const sectionHeaders = [
            'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT HISTORY',
            'EDUCATION', 'ACADEMIC BACKGROUND',
            'SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES',
            'PROJECTS', 'SUMMARY', 'PROFILE', 'CERTIFICATIONS'
        ];

        for (const line of lines) {
            const upperLine = line.toUpperCase().replace(/[^A-Z ]/g, '').trim();
            if (sectionHeaders.includes(upperLine)) {
                currentSection = upperLine;
                sections[currentSection] = [];
            } else {
                sections[currentSection].push(line);
            }
        }

        return sections;
    }

    private static extractSkills(lines: string[]): string[] {
        const skillList: string[] = [];
        const punctuationRegex = /[,;|•]/;

        for (const line of lines) {
            const parts = line.split(punctuationRegex).map(p => p.trim()).filter(p => p.length > 1);
            skillList.push(...parts);
        }

        // De-duplicate and filter
        return [...new Set(skillList)].filter(s => s.length < 40);
    }

    private static extractExperience(lines: string[]): ResumeData['experience'] {
        const experience: ResumeData['experience'] = [];
        let current: any = null;

        for (const line of lines) {
            // Basic heuristic: A line with a company or date
            const dateRegex = /(19|20)\d{2}\s*(-|to|–)\s*((19|20)\d{2}|Present|Current|Now)/i;
            const isDate = dateRegex.test(line);

            // If it looks like a new entry (caps or contains a date)
            if (isDate || (line.length < 60 && line === line.toUpperCase() && line.length > 3)) {
                if (current) experience.push(current);

                current = {
                    company: line.split(/[-|–•]/)[0].trim(),
                    role: line.includes('|') || line.includes('-') ? line.split(/[|–-]/)[1]?.trim() || '' : 'Professional Role',
                    duration: line.match(dateRegex)?.[0] || '',
                    bullets: []
                };
            } else if (current) {
                if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    current.bullets.push(line.replace(/^[•\-*]\s*/, '').trim());
                } else if (current.bullets.length === 0) {
                    // Maybe it's the role if it wasn't on the same line
                    if (!current.role || current.role === 'Professional Role') {
                        current.role = line;
                    } else {
                        current.bullets.push(line);
                    }
                } else {
                    current.bullets.push(line);
                }
            }
        }
        if (current) experience.push(current);

        return experience;
    }

    private static extractEducation(lines: string[]): ResumeData['education'] {
        const education: ResumeData['education'] = [];
        let current: any = null;

        for (const line of lines) {
            const yearRegex = /(19|20)\d{2}/;
            const isYear = yearRegex.test(line);

            if (isYear || line.toLowerCase().includes('university') || line.toLowerCase().includes('college') || line.toLowerCase().includes('institute')) {
                if (current) education.push(current);
                current = {
                    school: line.split(/[,|]/)[0].trim(),
                    degree: line.includes('Bachelor') || line.toLowerCase().includes('master') || line.toLowerCase().includes('bsc') || line.toLowerCase().includes('msc') || line.toLowerCase().includes('b.tech') ? line : '',
                    year: line.match(yearRegex)?.[0] || ''
                };
            } else if (current && !current.degree) {
                current.degree = line;
            }
        }
        if (current) education.push(current);

        return education;
    }
}
