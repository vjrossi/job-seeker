import { JobApplication } from '../types/JobApplication';
import { formatStatus } from './jobCardUtils';

export const exportToHTML = (applications: JobApplication[]): string => {
  const sortedApps = [...applications].sort((a, b) => 
    new Date(b.statusHistory[0].timestamp).getTime() - 
    new Date(a.statusHistory[0].timestamp).getTime()
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Job Applications Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .application { border: 1px solid #ccc; margin: 10px 0; padding: 15px; }
          .status-history { margin-left: 20px; }
          .timestamp { color: #666; }
        </style>
      </head>
      <body>
        <h1>Job Applications Export</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        ${sortedApps.map(app => `
          <div class="application">
            <h2>${app.companyName} - ${app.jobTitle}</h2>
            <p><strong>Application Method:</strong> ${app.applicationMethod}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(app.rating)}${'☆'.repeat(5-app.rating)}</p>
            ${app.jobUrl ? `<p><strong>Job URL:</strong> <a href="${app.jobUrl}">${app.jobUrl}</a></p>` : ''}
            <p><strong>Job Description:</strong></p>
            <p>${app.jobDescription}</p>
            <h3>Status History:</h3>
            <div class="status-history">
              ${app.statusHistory.map(status => `
                <p>
                  <strong>${formatStatus(status.status, app.statusHistory)}</strong>
                  <span class="timestamp">(${new Date(status.timestamp).toLocaleString()})</span>
                  ${status.interviewDateTime ? `
                    <br>Interview: ${new Date(status.interviewDateTime).toLocaleString()}
                    <br>Location: ${status.interviewLocation}
                    <br>Type: ${status.interviewType}
                  ` : ''}
                </p>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </body>
    </html>
  `;

  return html;
};

export const exportToJSON = (applications: JobApplication[]): string => {
  return JSON.stringify(applications, null, 2);
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 