'use client';

import { DarkThemeHeader } from './DarkThemeHeader';

interface ContactInfo {
  gender?: string;
  birthDate?: string;
  location?: string;
  phone?: string;
  email?: string;
  position?: string;
  experience?: string;
  expectedSalary?: string;
}

interface ResumeSection {
  title: string;
  content: string;
}

interface DarkThemeResumeProps {
  name: string;
  profileImage?: string;
  contactInfo: ContactInfo;
  sections: ResumeSection[];
  className?: string;
}

export function DarkThemeResume({
  name,
  profileImage,
  contactInfo,
  sections,
  className = '',
}: DarkThemeResumeProps) {
  return (
    <div className={`dark-theme-resume ${className}`}>
      {/* Header Section */}
      <DarkThemeHeader
        name={name}
        profileImage={profileImage}
        contactInfo={contactInfo}
      />

      {/* Content Sections */}
      <div className="dark-theme-content">
        {sections.map((section, index) => (
          <div key={index}>
            {/* Section */}
            <div className="dark-theme-section">
              <h3 className="dark-theme-section-title">{section.title}</h3>
              <div 
                className="dark-theme-section-content"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
            
            {/* Divider (except for last section) */}
            {index < sections.length - 1 && (
              <div className="dark-theme-divider" />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .dark-theme-resume {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
          color: #ffffff;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          min-height: 100vh;
          padding: 0;
          margin: 0;
        }

        .dark-theme-content {
          padding-bottom: 32px;
        }

        .dark-theme-section {
          margin-bottom: 32px;
          padding: 0 32px;
        }

        .dark-theme-section-title {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #ffffff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dark-theme-section-content {
          color: #e0e0e0;
          line-height: 1.6;
        }

        .dark-theme-section-content :global(h1),
        .dark-theme-section-content :global(h2),
        .dark-theme-section-content :global(h3),
        .dark-theme-section-content :global(h4) {
          color: #ffffff;
          font-weight: 600;
          margin: 16px 0 8px 0;
        }

        .dark-theme-section-content :global(p) {
          margin: 8px 0;
          color: #e0e0e0;
        }

        .dark-theme-section-content :global(ul),
        .dark-theme-section-content :global(ol) {
          margin: 8px 0;
          padding-left: 16px;
        }

        .dark-theme-section-content :global(li) {
          margin-bottom: 8px;
          color: #e0e0e0;
        }

        .dark-theme-section-content :global(strong) {
          color: #ffffff;
          font-weight: 600;
        }

        .dark-theme-section-content :global(em) {
          color: #4a9eff;
          font-style: italic;
        }

        .dark-theme-divider {
          height: 1px;
          background-color: #ffffff;
          margin: 32px 32px;
        }

        /* Experience and Education Styling */
        .dark-theme-section-content :global(.experience-item),
        .dark-theme-section-content :global(.education-item) {
          margin-bottom: 24px;
        }

        .dark-theme-section-content :global(.experience-header),
        .dark-theme-section-content :global(.education-header) {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .dark-theme-section-content :global(.company),
        .dark-theme-section-content :global(.school) {
          font-weight: 600;
          color: #ffffff;
          font-size: 16px;
        }

        .dark-theme-section-content :global(.position),
        .dark-theme-section-content :global(.degree) {
          color: #e0e0e0;
          margin-left: 8px;
        }

        .dark-theme-section-content :global(.date) {
          color: #b0b0b0;
          font-size: 12px;
        }

        /* Skills Styling */
        .dark-theme-section-content :global(.skills-list) {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .dark-theme-section-content :global(.skill-item) {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Links */
        .dark-theme-section-content :global(a) {
          color: #4a9eff;
          text-decoration: none;
        }

        .dark-theme-section-content :global(a:hover) {
          color: #ffffff;
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dark-theme-section {
            padding: 0 16px;
          }
          
          .dark-theme-divider {
            margin: 24px 16px;
          }
          
          .dark-theme-section-content :global(.experience-header),
          .dark-theme-section-content :global(.education-header) {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        /* Print Styles */
        @media print {
          .dark-theme-resume {
            background: #ffffff !important;
            color: #000000 !important;
          }
          
          .dark-theme-section-title {
            color: #000000 !important;
            border-color: #000000 !important;
          }
          
          .dark-theme-section-content,
          .dark-theme-section-content :global(p),
          .dark-theme-section-content :global(li) {
            color: #333333 !important;
          }
          
          .dark-theme-section-content :global(h1),
          .dark-theme-section-content :global(h2),
          .dark-theme-section-content :global(h3),
          .dark-theme-section-content :global(h4),
          .dark-theme-section-content :global(strong),
          .dark-theme-section-content :global(.company),
          .dark-theme-section-content :global(.school) {
            color: #000000 !important;
          }
          
          .dark-theme-section-content :global(.date) {
            color: #666666 !important;
          }
          
          .dark-theme-divider {
            background-color: #000000 !important;
          }
          
          .dark-theme-section-content :global(.skill-item) {
            background: #f0f0f0 !important;
            color: #000000 !important;
            border-color: #cccccc !important;
          }
          
          .dark-theme-section-content :global(a) {
            color: #0066cc !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .dark-theme-resume {
            background: #000000 !important;
          }
          
          .dark-theme-section-title {
            color: #ffffff !important;
            border-color: #ffffff !important;
          }
          
          .dark-theme-divider {
            background-color: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}