// Dark theme configuration based on the provided reference design

export interface DarkThemeColors {
  background: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  accent: {
    divider: string;
    highlight: string;
    border: string;
  };
}

export interface DarkThemeConfig {
  colors: DarkThemeColors;
  typography: {
    nameFont: FontConfig;
    sectionFont: FontConfig;
    contentFont: FontConfig;
    contactFont: FontConfig;
  };
  layout: {
    header: HeaderLayout;
    sections: SectionLayout;
    spacing: SpacingConfig;
  };
}

interface FontConfig {
  family: string;
  size: string;
  weight: number;
  lineHeight: number;
  letterSpacing?: string;
}

interface HeaderLayout {
  height: string;
  profileImageSize: string;
  namePosition: 'right' | 'below';
  contactLayout: 'horizontal' | 'vertical';
}

interface SectionLayout {
  spacing: string;
  dividerStyle: 'line' | 'space';
  titleStyle: 'bold' | 'normal';
  marginBottom: string;
}

interface SpacingConfig {
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

// Dark theme configuration based on the reference image
export const darkThemeConfig: DarkThemeConfig = {
  colors: {
    background: {
      primary: '#1a1a2e', // Dark purple/navy from the image
      secondary: '#16213e', // Darker blue
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)',
    },
    text: {
      primary: '#ffffff', // White text for main content
      secondary: '#e0e0e0', // Light gray for secondary text
      muted: '#b0b0b0', // Muted gray for less important text
      accent: '#4a9eff', // Blue accent for highlights
    },
    accent: {
      divider: '#ffffff', // White divider lines as shown in image
      highlight: '#4a9eff', // Blue accent color
      border: 'rgba(255, 255, 255, 0.2)', // Subtle white borders
    },
  },
  typography: {
    nameFont: {
      family: '"Helvetica Neue", Arial, sans-serif',
      size: '48px',
      weight: 300,
      lineHeight: 1.2,
      letterSpacing: '2px',
    },
    sectionFont: {
      family: '"Helvetica Neue", Arial, sans-serif',
      size: '18px',
      weight: 600,
      lineHeight: 1.4,
    },
    contentFont: {
      family: '"Helvetica Neue", Arial, sans-serif',
      size: '14px',
      weight: 400,
      lineHeight: 1.6,
    },
    contactFont: {
      family: '"Helvetica Neue", Arial, sans-serif',
      size: '12px',
      weight: 400,
      lineHeight: 1.5,
    },
  },
  layout: {
    header: {
      height: '200px',
      profileImageSize: '120px',
      namePosition: 'right',
      contactLayout: 'horizontal',
    },
    sections: {
      spacing: '32px',
      dividerStyle: 'line',
      titleStyle: 'bold',
      marginBottom: '24px',
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px',
      xlarge: '32px',
    },
  },
};

// CSS custom properties for the dark theme
export const darkThemeCSSVariables = {
  '--dark-bg-primary': darkThemeConfig.colors.background.primary,
  '--dark-bg-secondary': darkThemeConfig.colors.background.secondary,
  '--dark-bg-gradient': darkThemeConfig.colors.background.gradient,
  '--dark-text-primary': darkThemeConfig.colors.text.primary,
  '--dark-text-secondary': darkThemeConfig.colors.text.secondary,
  '--dark-text-muted': darkThemeConfig.colors.text.muted,
  '--dark-text-accent': darkThemeConfig.colors.text.accent,
  '--dark-accent-divider': darkThemeConfig.colors.accent.divider,
  '--dark-accent-highlight': darkThemeConfig.colors.accent.highlight,
  '--dark-accent-border': darkThemeConfig.colors.accent.border,
  '--dark-name-font-size': darkThemeConfig.typography.nameFont.size,
  '--dark-name-font-weight': darkThemeConfig.typography.nameFont.weight.toString(),
  '--dark-section-font-size': darkThemeConfig.typography.sectionFont.size,
  '--dark-section-font-weight': darkThemeConfig.typography.sectionFont.weight.toString(),
  '--dark-content-font-size': darkThemeConfig.typography.contentFont.size,
  '--dark-contact-font-size': darkThemeConfig.typography.contactFont.size,
  '--dark-header-height': darkThemeConfig.layout.header.height,
  '--dark-profile-size': darkThemeConfig.layout.header.profileImageSize,
  '--dark-section-spacing': darkThemeConfig.layout.sections.spacing,
  '--dark-spacing-small': darkThemeConfig.layout.spacing.small,
  '--dark-spacing-medium': darkThemeConfig.layout.spacing.medium,
  '--dark-spacing-large': darkThemeConfig.layout.spacing.large,
  '--dark-spacing-xlarge': darkThemeConfig.layout.spacing.xlarge,
};

// Helper function to apply dark theme CSS variables
export function applyDarkTheme(element: HTMLElement) {
  Object.entries(darkThemeCSSVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// Helper function to generate dark theme CSS classes
export function generateDarkThemeCSS(): string {
  return `
    .dark-theme-resume {
      background: ${darkThemeConfig.colors.background.gradient};
      color: ${darkThemeConfig.colors.text.primary};
      font-family: ${darkThemeConfig.typography.contentFont.family};
      font-size: ${darkThemeConfig.typography.contentFont.size};
      line-height: ${darkThemeConfig.typography.contentFont.lineHeight};
      min-height: 100vh;
      padding: 0;
      margin: 0;
    }

    .dark-theme-header {
      display: flex;
      align-items: center;
      gap: ${darkThemeConfig.layout.spacing.large};
      margin-bottom: ${darkThemeConfig.layout.sections.marginBottom};
      padding: ${darkThemeConfig.layout.spacing.xlarge};
    }

    .dark-theme-profile-image {
      width: ${darkThemeConfig.layout.header.profileImageSize};
      height: ${darkThemeConfig.layout.header.profileImageSize};
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${darkThemeConfig.colors.accent.border};
    }

    .dark-theme-name-section {
      flex: 1;
    }

    .dark-theme-hello {
      font-family: ${darkThemeConfig.typography.nameFont.family};
      font-size: ${darkThemeConfig.typography.nameFont.size};
      font-weight: ${darkThemeConfig.typography.nameFont.weight};
      letter-spacing: ${darkThemeConfig.typography.nameFont.letterSpacing};
      color: ${darkThemeConfig.colors.text.primary};
      margin: 0 0 ${darkThemeConfig.layout.spacing.small} 0;
    }

    .dark-theme-name {
      font-family: ${darkThemeConfig.typography.sectionFont.family};
      font-size: 32px;
      font-weight: 300;
      color: ${darkThemeConfig.colors.text.primary};
      margin: 0 0 ${darkThemeConfig.layout.spacing.medium} 0;
    }

    .dark-theme-contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: ${darkThemeConfig.layout.spacing.medium};
      font-family: ${darkThemeConfig.typography.contactFont.family};
      font-size: ${darkThemeConfig.typography.contactFont.size};
      color: ${darkThemeConfig.colors.text.secondary};
    }

    .dark-theme-contact-item {
      display: flex;
      align-items: center;
      gap: ${darkThemeConfig.layout.spacing.small};
    }

    .dark-theme-section {
      margin-bottom: ${darkThemeConfig.layout.sections.spacing};
      padding: 0 ${darkThemeConfig.layout.spacing.xlarge};
    }

    .dark-theme-section-title {
      font-family: ${darkThemeConfig.typography.sectionFont.family};
      font-size: ${darkThemeConfig.typography.sectionFont.size};
      font-weight: ${darkThemeConfig.typography.sectionFont.weight};
      color: ${darkThemeConfig.colors.text.primary};
      margin: 0 0 ${darkThemeConfig.layout.spacing.medium} 0;
      padding-bottom: ${darkThemeConfig.layout.spacing.small};
      border-bottom: 1px solid ${darkThemeConfig.colors.accent.divider};
    }

    .dark-theme-section-content {
      color: ${darkThemeConfig.colors.text.secondary};
      line-height: ${darkThemeConfig.typography.contentFont.lineHeight};
    }

    .dark-theme-divider {
      height: 1px;
      background-color: ${darkThemeConfig.colors.accent.divider};
      margin: ${darkThemeConfig.layout.sections.spacing} ${darkThemeConfig.layout.spacing.xlarge};
    }

    .dark-theme-experience-item {
      margin-bottom: ${darkThemeConfig.layout.spacing.large};
    }

    .dark-theme-experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: ${darkThemeConfig.layout.spacing.small};
    }

    .dark-theme-company {
      font-weight: 600;
      color: ${darkThemeConfig.colors.text.primary};
    }

    .dark-theme-position {
      color: ${darkThemeConfig.colors.text.secondary};
      margin-left: ${darkThemeConfig.layout.spacing.small};
    }

    .dark-theme-date {
      color: ${darkThemeConfig.colors.text.muted};
      font-size: 12px;
    }

    .dark-theme-description {
      color: ${darkThemeConfig.colors.text.secondary};
      margin-top: ${darkThemeConfig.layout.spacing.small};
    }

    .dark-theme-description ul {
      margin: ${darkThemeConfig.layout.spacing.small} 0;
      padding-left: ${darkThemeConfig.layout.spacing.medium};
    }

    .dark-theme-description li {
      margin-bottom: ${darkThemeConfig.layout.spacing.small};
    }
  `;
}