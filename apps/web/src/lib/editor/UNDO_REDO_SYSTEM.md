# Undo/Redo System Implementation

This document describes the implementation of the undo/redo system with command architecture for the Resume Copilot editor.

## Overview

The undo/redo system is built on top of ProseMirror's history plugin and provides:

1. **Command Architecture**: Structured command execution with proper grouping
2. **Enhanced History Plugin Integration**: Proper command grouping and metadata
3. **UI Controls**: Undo/redo buttons in the formatting toolbar with enhanced tooltips
4. **Keyboard Shortcuts**: Standard Ctrl+Z/Ctrl+Y shortcuts with proper handling

## Architecture

### Command System

#### EditorCommand Interface
```typescript
interface EditorCommand {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
  description?: string;
  groupId?: string; // For grouping related commands
}
```

#### Command Types
All editor operations are defined as command types in `CommandType` enum:
- Text formatting: `TOGGLE_BOLD`, `TOGGLE_ITALIC`, `TOGGLE_UNDERLINE`, etc.
- Block formatting: `SET_HEADING_1`, `SET_PARAGRAPH`, `SET_ALIGNMENT`, etc.
- Lists: `TOGGLE_BULLET_LIST`, `TOGGLE_ORDERED_LIST`, etc.
- History: `UNDO`, `REDO`
- Custom: `INSERT_TEXT`, `REPLACE_SELECTION`, etc.

#### Command Executors
Each command type has a corresponding executor function:
```typescript
interface EditorCommandExecutor {
  (context: CommandContext, payload?: any): CommandResult;
}
```

### History Plugin Integration

#### Enhanced Configuration
```typescript
history({
  depth: 100, // Keep 100 undo levels
  newGroupDelay: 500, // Group commands within 500ms
})
```

#### Command Grouping
Related commands can be grouped together using `groupId`:
```typescript
const groupId = createCommandGroup([command1, command2], 'Style preset application');
```

### UI Integration

#### FormattingToolbar Enhancement
- Undo/Redo buttons with proper disabled states
- Enhanced tooltips showing available undo/redo depth
- Integration with command architecture

#### Keyboard Shortcuts
- `Ctrl+Z`: Undo
- `Ctrl+Y` / `Ctrl+Shift+Z`: Redo
- Proper command grouping for keyboard-initiated actions

## Usage

### Basic Command Execution
```typescript
const result = executeEditorCommand(
  CommandType.TOGGLE_BOLD,
  context,
  undefined,
  'Toggle bold formatting'
);
```

### Command with Payload
```typescript
const result = executeEditorCommand(
  CommandType.SET_TEXT_COLOR,
  context,
  { color: '#ff0000' },
  'Set text color to red'
);
```

### Grouped Commands
```typescript
const groupId = `style_preset_${Date.now()}`;

executeEditorCommand(CommandType.SET_HEADING_1, context, undefined, 'Apply heading style', groupId);
executeEditorCommand(CommandType.SET_TEXT_COLOR, context, { color: '#000' }, 'Set color', groupId);
```

### Undo/Redo Operations
```typescript
// Check availability
const canUndo = historyInfo.canUndo;
const canRedo = historyInfo.canRedo;

// Execute
undoCommand();
redoCommand();
```

## Features

### 1. Command Architecture
- **Structured Commands**: All editing operations go through the command system
- **Command Registry**: Centralized registration of command executors
- **Error Handling**: Proper error handling and reporting
- **Command Metadata**: Description and grouping information

### 2. History Management
- **Deep History**: 100 levels of undo/redo
- **Command Grouping**: Related commands grouped together
- **Smart Grouping**: Time-based grouping (500ms delay)
- **History Information**: Detailed history state tracking

### 3. UI Integration
- **Visual Feedback**: Disabled states for unavailable operations
- **Enhanced Tooltips**: Show available undo/redo depth
- **Keyboard Support**: Standard keyboard shortcuts
- **Real-time Updates**: History state updates in real-time

### 4. Performance Optimizations
- **Efficient State Tracking**: Minimal re-renders
- **Command Batching**: Group related operations
- **Memory Management**: Proper cleanup and limits

## Implementation Details

### Files Structure
```
src/lib/editor/
├── commands.ts          # Command types, executors, and registry
├── history.ts           # History utilities and management
├── keymap.ts           # Keyboard shortcuts with command integration
└── useProseMirrorSync.ts # React hook with command architecture

src/components/editor/
├── FormattingToolbar.tsx # UI controls with undo/redo buttons
└── EditorWrapper.tsx     # Main editor component integration

src/types/
└── editor.ts            # TypeScript interfaces and types
```

### Key Components

#### 1. Command Registry
- Maps command types to executor functions
- Provides centralized command execution
- Handles error cases and unknown commands

#### 2. History Utilities
- Provides history information (depth, availability)
- Enhances ProseMirror's basic history plugin
- Supports command grouping and metadata

#### 3. React Integration
- `useProseMirrorSync` hook provides command execution
- Real-time history state updates
- Proper cleanup and memory management

#### 4. UI Controls
- Enhanced FormattingToolbar with undo/redo buttons
- Proper disabled states and tooltips
- Integration with keyboard shortcuts

## Testing

### Unit Tests
- Command execution testing
- History state management
- Error handling scenarios
- Command grouping functionality

### Integration Tests
- UI interaction testing
- Keyboard shortcut testing
- State synchronization testing
- Performance testing

## Future Enhancements

### Planned Features
1. **Command History Visualization**: Show detailed command history
2. **Selective Undo**: Undo specific commands from history
3. **Command Macros**: Record and replay command sequences
4. **Collaborative History**: Multi-user undo/redo support
5. **Advanced Grouping**: Smart semantic command grouping

### Performance Improvements
1. **Command Compression**: Compress similar consecutive commands
2. **Lazy History Loading**: Load history on demand
3. **Memory Optimization**: Better memory management for large histories
4. **Background Processing**: Move heavy operations to background

## Troubleshooting

### Common Issues

#### 1. Commands Not Executing
- Check command registration in `commandRegistry`
- Verify command executor implementation
- Ensure proper context and payload

#### 2. Undo/Redo Not Working
- Verify history plugin is properly configured
- Check command grouping settings
- Ensure proper transaction handling

#### 3. UI State Not Updating
- Check history state synchronization
- Verify React state updates
- Ensure proper event handling

### Debug Tools
- Command execution logging
- History state inspection
- Performance monitoring
- Error tracking

## Conclusion

The undo/redo system provides a robust foundation for editor operations with:
- Structured command architecture
- Proper history management
- Enhanced UI integration
- Comprehensive error handling
- Performance optimizations

This implementation follows best practices and provides a solid foundation for future enhancements and collaborative editing features.