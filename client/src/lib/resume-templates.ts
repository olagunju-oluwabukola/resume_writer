// Professional Resume Templates
// Each template provides a unique layout and styling for different preferences

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "minimal" | "creative";
  preview: string;
  format: (data: ResumeData) => string;
}

export interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  certifications?: string[];
}

// Template 1: Modern Minimalist
export const modernMinimalistTemplate: ResumeTemplate = {
  id: "modern-minimalist",
  name: "Modern Minimalist",
  description: "Clean, contemporary design with bold typography and ample whitespace",
  category: "modern",
  preview: `
ALEX JOHNSON
Senior Frontend Developer

alex.johnson@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/alexjohnson

PROFESSIONAL SUMMARY
Senior Frontend Developer with 5+ years of experience building scalable web applications...

EXPERIENCE
Senior Frontend Developer | TechCorp Inc. | 2021 - Present
• Built and maintained responsive web applications using React and TypeScript
• Improved application performance by 40% through code optimization

Frontend Developer | WebSolutions Co. | 2019 - 2021
• Developed reusable React components and implemented state management solutions

SKILLS
React • TypeScript • JavaScript • HTML5 • CSS3 • Tailwind CSS • Git • REST APIs

EDUCATION
Bachelor of Science in Computer Science | State University | 2019
  `,
  format: (data: ResumeData) => `
${data.fullName.toUpperCase()}
${data.title}

${data.email} | ${data.phone} | ${data.location}${data.linkedin ? ` | ${data.linkedin}` : ""}${data.website ? ` | ${data.website}` : ""}

PROFESSIONAL SUMMARY
${data.summary}

EXPERIENCE
${data.experience
  .map(
    (exp) => `
${exp.position.toUpperCase()} | ${exp.company} | ${exp.duration}
${exp.description
  .split("\n")
  .map((line) => `• ${line.trim()}`)
  .join("\n")}
`
  )
  .join("\n")}

SKILLS
${data.skills.join(" • ")}

EDUCATION
${data.education
  .map((edu) => `${edu.degree} in ${edu.field} | ${edu.school} | ${edu.year}`)
  .join("\n")}
${data.certifications ? `\nCERTIFICATIONS\n${data.certifications.join("\n")}` : ""}
  `,
};

// Template 2: Classic Professional
export const classicProfessionalTemplate: ResumeTemplate = {
  id: "classic-professional",
  name: "Classic Professional",
  description: "Traditional format with clear sections and professional hierarchy",
  category: "classic",
  preview: `
ALEX JOHNSON
Senior Frontend Developer
alex.johnson@email.com | (555) 123-4567 | San Francisco, CA

PROFESSIONAL PROFILE
Experienced Senior Frontend Developer with proven track record of delivering high-quality web solutions...

CORE COMPETENCIES
• Full-Stack Web Development
• React & TypeScript Expertise
• Team Leadership
• Agile Methodology
• Performance Optimization

PROFESSIONAL EXPERIENCE

Senior Frontend Developer
TechCorp Inc., San Francisco, CA | January 2021 - Present
- Led frontend development for 5+ major projects
- Mentored junior developers and conducted code reviews
- Improved application performance by 40%

Frontend Developer
WebSolutions Co., San Francisco, CA | June 2019 - December 2020
- Developed responsive web applications using React
- Implemented state management using Redux

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, HTML5, CSS3
Frameworks: React, Next.js, Vue.js
Tools: Git, Webpack, Docker, AWS
Databases: PostgreSQL, MongoDB

EDUCATION
Bachelor of Science in Computer Science
State University | Graduated: May 2019

CERTIFICATIONS
AWS Certified Solutions Architect | 2022
React Advanced Patterns | 2021
  `,
  format: (data: ResumeData) => `
${data.fullName.toUpperCase()}
${data.title}
${data.email} | ${data.phone} | ${data.location}

PROFESSIONAL PROFILE
${data.summary}

CORE COMPETENCIES
${data.skills.slice(0, 5).map((skill) => `• ${skill}`).join("\n")}

PROFESSIONAL EXPERIENCE
${data.experience
  .map(
    (exp) => `
${exp.position.toUpperCase()}
${exp.company}, ${data.location} | ${exp.duration}
${exp.description
  .split("\n")
  .map((line) => `- ${line.trim()}`)
  .join("\n")}
`
  )
  .join("\n")}

TECHNICAL SKILLS
${data.skills.join(", ")}

EDUCATION
${data.education
  .map((edu) => `${edu.degree} in ${edu.field}\n${edu.school} | Graduated: ${edu.year}`)
  .join("\n\n")}
${data.certifications ? `\nCERTIFICATIONS\n${data.certifications.join("\n")}` : ""}
  `,
};

// Template 3: Minimal Clean
export const minimalCleanTemplate: ResumeTemplate = {
  id: "minimal-clean",
  name: "Minimal Clean",
  description: "Streamlined design focusing on essential information with elegant typography",
  category: "minimal",
  preview: `
ALEX JOHNSON | Senior Frontend Developer

Contact: alex.johnson@email.com | (555) 123-4567 | San Francisco, CA

ABOUT
Senior Frontend Developer with 5+ years of experience in building scalable web applications...

EXPERIENCE
TechCorp Inc. — Senior Frontend Developer (2021–Present)
Built responsive web applications, improved performance by 40%, mentored team members

WebSolutions Co. — Frontend Developer (2019–2021)
Developed React components, implemented state management solutions

SKILLS
React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Git, REST APIs, Next.js

EDUCATION
B.S. Computer Science — State University (2019)
  `,
  format: (data: ResumeData) => `
${data.fullName.toUpperCase()} | ${data.title}

Contact: ${data.email} | ${data.phone} | ${data.location}

ABOUT
${data.summary}

EXPERIENCE
${data.experience
  .map(
    (exp) => `
${exp.company} — ${exp.position} (${exp.duration})
${exp.description
  .split("\n")
  .map((line) => line.trim())
  .join(", ")}
`
  )
  .join("\n")}

SKILLS
${data.skills.join(", ")}

EDUCATION
${data.education
  .map((edu) => `${edu.degree} ${edu.field} — ${edu.school} (${edu.year})`)
  .join("\n")}
${data.certifications ? `\nCERTIFICATIONS\n${data.certifications.join(", ")}` : ""}
  `,
};

// Template 4: Creative Modern
export const creativeModernTemplate: ResumeTemplate = {
  id: "creative-modern",
  name: "Creative Modern",
  description: "Contemporary design with visual hierarchy and modern formatting",
  category: "creative",
  preview: `
╔══════════════════════════════════════════════════════════════╗
║                      ALEX JOHNSON                             ║
║              Senior Frontend Developer                        ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: alex.johnson@email.com | Phone: (555) 123-4567
Location: San Francisco, CA | LinkedIn: linkedin.com/in/alexjohnson

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Senior Frontend Developer with 5+ years of experience building scalable web applications...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPERIENCE HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
► Senior Frontend Developer | TechCorp Inc. (2021–Present)
  Built responsive web applications, improved performance by 40%

► Frontend Developer | WebSolutions Co. (2019–2021)
  Developed React components and state management solutions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React • TypeScript • JavaScript • HTML5 • CSS3 • Tailwind CSS • Git

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B.S. Computer Science | State University (2019)
  `,
  format: (data: ResumeData) => `
╔══════════════════════════════════════════════════════════════╗
║                      ${data.fullName.toUpperCase()}
║              ${data.title}
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${data.email} | Phone: ${data.phone}
Location: ${data.location}${data.linkedin ? ` | LinkedIn: ${data.linkedin}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPERIENCE HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.experience
  .map((exp) => `► ${exp.position} | ${exp.company} (${exp.duration})\n  ${exp.description.split("\n")[0]}`)
  .join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.skills.join(" • ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.education
  .map((edu) => `${edu.degree} ${edu.field} | ${edu.school} (${edu.year})`)
  .join("\n")}
${data.certifications ? `\nCERTIFICATIONS\n${data.certifications.join(", ")}` : ""}
  `,
};

// Template 5: ATS-Optimized (Applicant Tracking System)
export const atsOptimizedTemplate: ResumeTemplate = {
  id: "ats-optimized",
  name: "ATS-Optimized",
  description: "Designed to pass through Applicant Tracking Systems with simple formatting",
  category: "classic",
  preview: `
ALEX JOHNSON
Senior Frontend Developer

Email: alex.johnson@email.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/alexjohnson

PROFESSIONAL SUMMARY
Senior Frontend Developer with 5+ years of experience building scalable web applications...

PROFESSIONAL EXPERIENCE

Senior Frontend Developer
TechCorp Inc.
2021 - Present
- Built and maintained responsive web applications using React and TypeScript
- Improved application performance by 40% through code optimization
- Mentored junior developers and conducted code reviews

Frontend Developer
WebSolutions Co.
2019 - 2021
- Developed reusable React components
- Implemented state management solutions using Redux
- Collaborated with design and backend teams

SKILLS
React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Git, REST APIs, Next.js, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS

EDUCATION

Bachelor of Science in Computer Science
State University
2019

CERTIFICATIONS
AWS Certified Solutions Architect - 2022
React Advanced Patterns - 2021
  `,
  format: (data: ResumeData) => `
${data.fullName.toUpperCase()}
${data.title}

Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
${data.linkedin ? `LinkedIn: ${data.linkedin}` : ""}
${data.website ? `Website: ${data.website}` : ""}

PROFESSIONAL SUMMARY
${data.summary}

PROFESSIONAL EXPERIENCE
${data.experience
  .map(
    (exp) => `
${exp.position}
${exp.company}
${exp.duration}
${exp.description
  .split("\n")
  .map((line) => `- ${line.trim()}`)
  .join("\n")}
`
  )
  .join("\n")}

SKILLS
${data.skills.join(", ")}

EDUCATION
${data.education
  .map((edu) => `
${edu.degree} in ${edu.field}
${edu.school}
${edu.year}
`)
  .join("\n")}
${data.certifications ? `\nCERTIFICATIONS\n${data.certifications.join("\n")}` : ""}
  `,
};

// All templates
export const allTemplates: ResumeTemplate[] = [
  modernMinimalistTemplate,
  classicProfessionalTemplate,
  minimalCleanTemplate,
  creativeModernTemplate,
  atsOptimizedTemplate,
];

// Get template by ID
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

// Format resume with template
export function formatResumeWithTemplate(
  templateId: string,
  data: ResumeData
): string {
  const template = getTemplateById(templateId);
  if (!template) {
    return modernMinimalistTemplate.format(data);
  }
  return template.format(data);
}
