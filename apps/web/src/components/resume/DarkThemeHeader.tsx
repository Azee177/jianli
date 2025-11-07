'use client';

import { useState } from 'react';

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

interface DarkThemeHeaderProps {
  name: string;
  profileImage?: string;
  contactInfo: ContactInfo;
  className?: string;
}

export function DarkThemeHeader({
  name,
  profileImage,
  contactInfo,
  className = '',
}: DarkThemeHeaderProps) {
  const [imageError, setImageError] = useState(false);

  // Format contact info into display items
  const contactItems = [
    contactInfo.gender && `${contactInfo.gender}`,
    contactInfo.birthDate && `生日: ${contactInfo.birthDate}`,
    contactInfo.location && `${contactInfo.location}`,
    contactInfo.phone && `📞 ${contactInfo.phone}`,
    contactInfo.email && `📧 ${contactInfo.email}`,
    contactInfo.position && `职位: ${contactInfo.position}`,
    contactInfo.experience && `${contactInfo.experience}`,
    contactInfo.expectedSalary && `期望薪资: ${contactInfo.expectedSalary}`,
  ].filter(Boolean);

  return (
    <div className={`dark-theme-header ${className}`}>
      {/* Profile Image */}
      <div className="profile-image-container">
        {profileImage && !imageError ? (
          <img
            src={profileImage}
            alt={`${name}的头像`}
            className="dark-theme-profile-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="dark-theme-profile-placeholder">
            <div className="placeholder-icon">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Name and Contact Section */}
      <div className="dark-theme-name-section">
        {/* HELLO Branding */}
        <h1 className="dark-theme-hello">HELLO</h1>
        
        {/* Name */}
        <h2 className="dark-theme-name">{name}</h2>
        
        {/* Contact Information */}
        <div className="dark-theme-contact-info">
          {contactItems.map((item, index) => (
            <span key={index} className="dark-theme-contact-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dark-theme-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          padding: 32px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
        }

        .profile-image-container {
          flex-shrink: 0;
        }

        .dark-theme-profile-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .dark-theme-profile-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
        }

        .placeholder-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dark-theme-name-section {
          flex: 1;
        }

        .dark-theme-hello {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 48px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #ffffff;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .dark-theme-name {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 32px;
          font-weight: 300;
          color: #ffffff;
          margin: 0 0 16px 0;
        }

        .dark-theme-contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 12px;
          color: #e0e0e0;
        }

        .dark-theme-contact-item {
          display: flex;
          align-items: center;
          position: relative;
        }

        .dark-theme-contact-item:not(:first-child)::before {
          content: "●";
          color: #4a9eff;
          font-size: 8px;
          margin-right: 16px;
          margin-left: -8px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dark-theme-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
            padding: 24px 16px;
          }
          
          .dark-theme-hello {
            font-size: 36px;
          }
          
          .dark-theme-name {
            font-size: 24px;
          }
          
          .dark-theme-contact-info {
            justify-content: center;
          }
        }

        /* Print Styles */
        @media print {
          .dark-theme-header {
            background: #ffffff !important;
          }
          
          .dark-theme-hello,
          .dark-theme-name {
            color: #000000 !important;
          }
          
          .dark-theme-contact-info {
            color: #333333 !important;
          }
          
          .dark-theme-profile-image,
          .dark-theme-profile-placeholder {
            border-color: #cccccc !important;
          }
          
          .dark-theme-profile-placeholder {
            background: #f0f0f0 !important;
            color: #666666 !important;
          }
        }
      `}</style>
    </div>
  );
}