import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  filename: string;
  title?: string;
  author?: string;
  subject?: string;
}

/**
 * Export HTML element to PDF
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    // Add metadata
    pdf.setProperties({
      title: options.title || options.filename,
      author: options.author || "ResumeRX",
      subject: options.subject || "Resume",
    });

    // Add first page
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20; // Account for margins

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    // Download PDF
    pdf.save(options.filename);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("Failed to export PDF");
  }
}

/**
 * Export resume as PDF
 */
export async function exportResumeToPDF(
  resumeName: string,
  fullName: string
): Promise<void> {
  const element = document.getElementById("resume-preview");
  if (!element) {
    throw new Error("Resume preview element not found");
  }

  const filename = `${fullName.replace(/\s+/g, "_")}_Resume_${new Date().getFullYear()}.pdf`;

  await exportElementToPDF(element, {
    filename,
    title: `${fullName} - Resume`,
    author: fullName,
    subject: "Professional Resume",
  });
}

/**
 * Export cover letter as PDF
 */
export async function exportCoverLetterToPDF(
  letterTitle: string,
  fullName: string
): Promise<void> {
  const element = document.getElementById("cover-letter-preview");
  if (!element) {
    throw new Error("Cover letter preview element not found");
  }

  const filename = `${fullName.replace(/\s+/g, "_")}_CoverLetter_${new Date().getFullYear()}.pdf`;

  await exportElementToPDF(element, {
    filename,
    title: `${fullName} - Cover Letter`,
    author: fullName,
    subject: "Cover Letter",
  });
}

/**
 * Export resume as text file
 */
export function exportResumeAsText(
  resumeContent: string,
  fullName: string
): void {
  const filename = `${fullName.replace(/\s+/g, "_")}_Resume.txt`;
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(resumeContent)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    throw new Error("Failed to copy to clipboard");
  }
}

/**
 * Generate resume as HTML string (for printing)
 */
export function generateResumeHTML(
  fullName: string,
  title: string,
  contact: {
    phone: string;
    email: string;
    location: string;
    linkedin?: string;
  },
  summary: string,
  skills: string[],
  experience: Array<{
    position: string;
    company: string;
    location: string;
    period: string;
    achievements: string[];
  }>,
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          max-width: 8.5in;
          height: 11in;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #6B46C1;
          padding-bottom: 10px;
        }
        .name {
          font-size: 24px;
          font-weight: bold;
          color: #6B46C1;
        }
        .title {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .contact {
          font-size: 11px;
          text-align: center;
          margin-top: 5px;
          color: #666;
        }
        .section {
          margin-top: 15px;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #6B46C1;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .job {
          margin-bottom: 12px;
        }
        .job-title {
          font-weight: bold;
          font-size: 12px;
        }
        .job-company {
          font-size: 11px;
          color: #666;
        }
        .job-period {
          font-size: 10px;
          color: #999;
        }
        .achievements {
          font-size: 11px;
          margin-top: 5px;
          margin-left: 15px;
        }
        .achievement {
          margin-bottom: 3px;
        }
        .skills {
          font-size: 11px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill {
          background: #f0f0f0;
          padding: 3px 8px;
          border-radius: 3px;
        }
        .education-item {
          font-size: 11px;
          margin-bottom: 8px;
        }
        .degree {
          font-weight: bold;
        }
        .school {
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${fullName}</div>
        <div class="title">${title}</div>
        <div class="contact">
          ${contact.phone} • ${contact.email} • ${contact.location}${
    contact.linkedin ? ` • ${contact.linkedin}` : ""
  }
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div style="font-size: 11px;">${summary}</div>
      </div>

      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills">
          ${skills.map((skill) => `<div class="skill">${skill}</div>`).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        ${experience
          .map(
            (job) => `
          <div class="job">
            <div class="job-title">${job.position}</div>
            <div class="job-company">${job.company} • ${job.location}</div>
            <div class="job-period">${job.period}</div>
            <div class="achievements">
              ${job.achievements.map((a) => `<div class="achievement">• ${a}</div>`).join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        ${education
          .map(
            (edu) => `
          <div class="education-item">
            <div class="degree">${edu.degree}</div>
            <div class="school">${edu.school} • ${edu.year}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </body>
    </html>
  `;
}
