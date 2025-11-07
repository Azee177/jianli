'use client';

interface DarkThemeSectionProps {
  title: string;
  children: React.ReactNode;
  showDivider?: boolean;
  className?: string;
}

export function DarkThemeSection({
  title,
  children,
  showDivider = true,
  className = '',
}: DarkThemeSectionProps) {
  return (
    <>
      <div className={`dark-theme-section ${className}`}>
        <h3 className="dark-theme-section-title">{title}</h3>
        <div className="dark-theme-section-content">
          {children}
        </div>
      </div>
      
      {showDivider && <div className="dark-theme-divider" />}

      <style jsx>{`
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

        .dark-theme-divider {
          height: 1px;
          background-color: #ffffff;
          margin: 32px 32px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dark-theme-section {
            padding: 0 16px;
          }
          
          .dark-theme-divider {
            margin: 24px 16px;
          }
        }

        /* Print Styles */
        @media print {
          .dark-theme-section-title {
            color: #000000 !important;
            border-color: #000000 !important;
          }
          
          .dark-theme-section-content {
            color: #333333 !important;
          }
          
          .dark-theme-divider {
            background-color: #000000 !important;
          }
        }
      `}</style>
    </>
  );
}

// Experience Item Component
interface ExperienceItemProps {
  company: string;
  position: string;
  date: string;
  description: string;
  className?: string;
}

export function DarkThemeExperienceItem({
  company,
  position,
  date,
  description,
  className = '',
}: ExperienceItemProps) {
  return (
    <div className={`dark-theme-experience-item ${className}`}>
      <div className="dark-theme-experience-header">
        <div>
          <span className="dark-theme-company">{company}</span>
          <span className="dark-theme-position">{position}</span>
        </div>
        <span className="dark-theme-date">{date}</span>
      </div>
      <div 
        className="dark-theme-description"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <style jsx>{`
        .dark-theme-experience-item {
          margin-bottom: 24px;
        }

        .dark-theme-experience-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .dark-theme-company {
          font-weight: 600;
          color: #ffffff;
          font-size: 16px;
        }

        .dark-theme-position {
          color: #e0e0e0;
          margin-left: 8px;
          font-size: 14px;
        }

        .dark-theme-date {
          color: #b0b0b0;
          font-size: 12px;
        }

        .dark-theme-description {
          color: #e0e0e0;
          margin-top: 8px;
        }

        .dark-theme-description :global(ul) {
          margin: 8px 0;
          padding-left: 16px;
        }

        .dark-theme-description :global(li) {
          margin-bottom: 8px;
          position: relative;
        }

        .dark-theme-description :global(li::marker) {
          color: #4a9eff;
        }

        .dark-theme-description :global(strong) {
          color: #ffffff;
          font-weight: 600;
        }

        .dark-theme-description :global(em) {
          color: #4a9eff;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dark-theme-experience-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        /* Print Styles */
        @media print {
          .dark-theme-company {
            color: #000000 !important;
          }
          
          .dark-theme-position {
            color: #333333 !important;
          }
          
          .dark-theme-date {
            color: #666666 !important;
          }
          
          .dark-theme-description {
            color: #333333 !important;
          }
          
          .dark-theme-description :global(strong) {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Education Item Component
interface EducationItemProps {
  school: string;
  degree: string;
  date: string;
  details?: string;
  className?: string;
}

export function DarkThemeEducationItem({
  school,
  degree,
  date,
  details,
  className = '',
}: EducationItemProps) {
  return (
    <div className={`dark-theme-education-item ${className}`}>
      <div className="dark-theme-education-header">
        <div>
          <span className="dark-theme-school">{school}</span>
          <span className="dark-theme-degree">{degree}</span>
        </div>
        <span className="dark-theme-education-date">{date}</span>
      </div>
      {details && (
        <div className="dark-theme-education-details">{details}</div>
      )}

      <style jsx>{`
        .dark-theme-education-item {
          margin-bottom: 16px;
        }

        .dark-theme-education-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .dark-theme-school {
          font-weight: 600;
          color: #ffffff;
          font-size: 16px;
        }

        .dark-theme-degree {
          color: #e0e0e0;
          margin-left: 8px;
        }

        .dark-theme-education-date {
          color: #b0b0b0;
          font-size: 12px;
        }

        .dark-theme-education-details {
          color: #e0e0e0;
          margin-top: 4px;
          font-size: 13px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dark-theme-education-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        /* Print Styles */
        @media print {
          .dark-theme-school {
            color: #000000 !important;
          }
          
          .dark-theme-degree,
          .dark-theme-education-details {
            color: #333333 !important;
          }
          
          .dark-theme-education-date {
            color: #666666 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Skills List Component
interface SkillsListProps {
  skills: string[];
  className?: string;
}

export function DarkThemeSkillsList({
  skills,
  className = '',
}: SkillsListProps) {
  return (
    <ul className={`dark-theme-skills-list ${className}`}>
      {skills.map((skill, index) => (
        <li key={index} className="dark-theme-skill-item">
          {skill}
        </li>
      ))}

      <style jsx>{`
        .dark-theme-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .dark-theme-skill-item {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Print Styles */
        @media print {
          .dark-theme-skill-item {
            background: #f0f0f0 !important;
            color: #000000 !important;
            border-color: #cccccc !important;
          }
        }
      `}</style>
    </ul>
  );
}