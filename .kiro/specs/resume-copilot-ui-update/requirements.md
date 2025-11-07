# Requirements Document

## Introduction

This feature involves updating the Resume Copilot frontend UI to implement a comprehensive three-panel layout interface that provides a ChatGPT-like deep research experience for resume tailoring. The interface should support the complete workflow from resume upload through final export, with a focus on single-target job application optimization.

## Requirements

### Requirement 1

**User Story:** As a user, I want a three-column layout interface that provides easy navigation and workflow management, so that I can efficiently move through the resume optimization process.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display a three-column grid layout with fixed Activity Bar (56px), resizable Feature Panel (320-720px), and adaptive Resume Editor
2. WHEN the user clicks the menu button THEN the system SHALL toggle the Feature Panel visibility
3. WHEN the Feature Panel is visible THEN the system SHALL allow users to drag the right edge to resize the panel width
4. WHEN the panel is resized THEN the Resume Editor SHALL automatically adjust its width to fill remaining space
5. WHEN the user double-clicks the resize handle THEN the system SHALL reset panel width to 420px default

### Requirement 2

**User Story:** As a user, I want a persistent Activity Bar with clear navigation icons, so that I can quickly access different stages of the resume optimization workflow.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display an Activity Bar with 8 navigation items: Upload·OCR, Target Confirmation, JD Analysis, Draft Generation, Company Customization, Preparation, Interview, and Export
2. WHEN the user clicks an Activity Bar icon THEN the system SHALL activate the corresponding Feature Panel
3. WHEN a panel is active THEN the system SHALL highlight the corresponding Activity Bar icon with sky-blue styling
4. WHEN the user hovers over Activity Bar icons THEN the system SHALL display tooltips with feature labels
5. WHEN the user clicks an already active icon THEN the system SHALL close the Feature Panel

### Requirement 3

**User Story:** As a user, I want a comprehensive upload and OCR processing interface, so that I can easily upload my resume and track processing status.

#### Acceptance Criteria

1. WHEN the user opens the Upload panel THEN the system SHALL display file upload controls and processing status indicators
2. WHEN the user clicks "选择文件" THEN the system SHALL trigger file selection and begin OCR processing
3. WHEN OCR processing starts THEN the system SHALL display loading indicators for OCR and avatar extraction
4. WHEN OCR completes THEN the system SHALL show green checkmarks and "完成" status
5. WHEN avatar extraction completes THEN the system SHALL show "已嵌入" status and update the resume template

### Requirement 4

**User Story:** As a user, I want a single-target job confirmation interface, so that I can select and lock onto one specific job opportunity for optimization.

#### Acceptance Criteria

1. WHEN the user opens the Intent panel THEN the system SHALL display job opportunity cards with company, role, and location information
2. WHEN the user clicks "确认" on a job card THEN the system SHALL set that job as the target and disable other options
3. WHEN a target is confirmed THEN the system SHALL update the bottom status bar to show the selected target
4. WHEN a target is set THEN the system SHALL enable the JD Analysis panel functionality
5. WHEN the user wants to change targets THEN the system SHALL provide a reset mechanism that clears downstream data

### Requirement 5

**User Story:** As a user, I want an interactive JD analysis interface with editable dimensions, so that I can review and customize the key requirements extracted from job descriptions.

#### Acceptance Criteria

1. WHEN the user opens the JD panel THEN the system SHALL display 4-5 common dimensions as editable checkboxes
2. WHEN the user clicks a checkbox THEN the system SHALL toggle the dimension selection
3. WHEN the user edits dimension text THEN the system SHALL update the dimension label in real-time
4. WHEN the user clicks "锁定" THEN the system SHALL lock the dimensions and enable draft generation
5. WHEN dimensions are locked THEN the system SHALL change the button to "解锁" and disable editing

### Requirement 6

**User Story:** As a user, I want a rich resume editor with selection-based tools, so that I can make precise edits and improvements to my resume content.

#### Acceptance Criteria

1. WHEN the user selects text in the resume editor THEN the system SHALL display a floating toolbar with editing options
2. WHEN the user clicks "改写" THEN the system SHALL apply polish improvements to the selected text
3. WHEN the user clicks "STAR" THEN the system SHALL restructure the content using STAR methodology
4. WHEN the user clicks "量化" THEN the system SHALL add quantitative metrics to the selected content
5. WHEN the user clicks "→ 1/4" THEN the system SHALL move the content to the company customization section
6. WHEN the user clicks outside the selection THEN the system SHALL hide the floating toolbar

### Requirement 7

**User Story:** As a user, I want integrated chat assistance throughout the workflow, so that I can get contextual help and guidance at any stage.

#### Acceptance Criteria

1. WHEN any Feature Panel is open THEN the system SHALL display a chat interface at the bottom
2. WHEN the user types a message THEN the system SHALL provide contextual assistance based on the current workflow stage
3. WHEN the user sends a message THEN the system SHALL display the conversation history
4. WHEN the system provides suggestions THEN the system SHALL display them in styled suggestion cards
5. WHEN the user clicks send THEN the system SHALL process the message and provide relevant guidance

### Requirement 8

**User Story:** As a user, I want comprehensive export and submission tracking, so that I can download my optimized resume and track application progress.

#### Acceptance Criteria

1. WHEN the user opens the Export panel THEN the system SHALL display PDF and Word export options
2. WHEN the user clicks export buttons THEN the system SHALL generate and download the resume in the selected format
3. WHEN the resume is ready THEN the system SHALL provide official website submission links
4. WHEN the user submits applications THEN the system SHALL track submission status and provide update reminders
5. WHEN exports are complete THEN the system SHALL update the bottom action bar with download options

### Requirement 9

**User Story:** As a user, I want a responsive and accessible interface, so that I can use the application effectively across different devices and accessibility needs.

#### Acceptance Criteria

1. WHEN the application loads on different screen sizes THEN the system SHALL adapt the layout appropriately
2. WHEN the user navigates with keyboard THEN the system SHALL provide proper focus management and keyboard shortcuts
3. WHEN the user uses screen readers THEN the system SHALL provide appropriate ARIA labels and semantic markup
4. WHEN the user prefers reduced motion THEN the system SHALL respect motion preferences
5. WHEN the interface elements are interactive THEN the system SHALL provide clear visual feedback and hover states

### Requirement 10

**User Story:** As a user, I want real-time status tracking and progress indicators, so that I can understand where I am in the workflow and what steps remain.

#### Acceptance Criteria

1. WHEN the user progresses through workflow stages THEN the system SHALL update the bottom status bar with current progress
2. WHEN background processes are running THEN the system SHALL display appropriate loading states and progress indicators
3. WHEN workflow steps are completed THEN the system SHALL show completion checkmarks and enable next steps
4. WHEN the user needs to complete prerequisites THEN the system SHALL disable dependent features and show clear messaging
5. WHEN errors occur THEN the system SHALL display helpful error messages and recovery options

### Requirement 11

**User Story:** As a user, I want a Word-like rich text editing experience in the resume editor, so that I can create professional documents with advanced formatting and reliable state management.

#### Acceptance Criteria

1. WHEN the user types or formats text THEN the system SHALL maintain consistent state synchronization between DOM and React state
2. WHEN the user applies formatting THEN the system SHALL use a structured style system instead of inline styles for maintainability
3. WHEN the user performs editing actions THEN the system SHALL provide undo/redo functionality with complete edit history
4. WHEN the user works with long content THEN the system SHALL support automatic pagination and page break handling
5. WHEN the user inserts content programmatically THEN the system SHALL ensure proper state synchronization without data loss
6. WHEN the user needs advanced formatting THEN the system SHALL provide a comprehensive formatting toolbar with paragraph styles, lists, tables, and typography controls
7. WHEN the user edits text THEN the system SHALL provide spell checking, auto-correct, and grammar assistance
8. WHEN the user works with document structure THEN the system SHALL support headers, footers, and document-level formatting
9. WHEN the user saves or navigates THEN the system SHALL persist all formatting and content without loss
10. WHEN the user needs to collaborate THEN the system SHALL support comments, suggestions, and track changes functionality