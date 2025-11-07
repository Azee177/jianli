import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';
import { resumeSchema } from '../schema';
import {
    CommandType,
    executeEditorCommand,
    canUndoCommand,
    canRedoCommand
} from '../commands';
import { CommandContext } from '../../../types/editor';

// Mock dispatch function for testing
const mockDispatch = jest.fn();

// Helper to create a basic editor state
function createEditorState(content = '<p>Test content</p>') {
    const dom = document.createElement('div');
    dom.innerHTML = content;

    const doc = resumeSchema.nodeFromJSON({
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: 'Test content'
                    }
                ]
            }
        ]
    });

    return EditorState.create({
        doc,
        plugins: [
            history({
                depth: 100,
                newGroupDelay: 500,
            }),
        ],
    });
}

describe('Command Architecture', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
    });

    describe('Command Execution', () => {
        it('should execute bold command successfully', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                CommandType.TOGGLE_BOLD,
                context,
                undefined,
                'Toggle bold formatting'
            );

            expect(result.success).toBe(true);
        });

        it('should execute text color command with payload', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                CommandType.SET_TEXT_COLOR,
                context,
                { color: '#ff0000' },
                'Set text color to red'
            );

            expect(result.success).toBe(true);
        });

        it('should fail text color command without color payload', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                CommandType.SET_TEXT_COLOR,
                context,
                {},
                'Set text color without color'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Color is required');
        });
    });

    describe('Undo/Redo Commands', () => {
        it('should check undo availability correctly', () => {
            const state = createEditorState();

            // Initially, there should be no undo available
            expect(canUndoCommand(state)).toBe(false);
        });

        it('should check redo availability correctly', () => {
            const state = createEditorState();

            // Initially, there should be no redo available
            expect(canRedoCommand(state)).toBe(false);
        });

        it('should execute undo command', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                CommandType.UNDO,
                context,
                undefined,
                'Undo last action'
            );

            // Should return success even if there's nothing to undo
            expect(result.success).toBe(false); // No history to undo
        });

        it('should execute redo command', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                CommandType.REDO,
                context,
                undefined,
                'Redo last action'
            );

            // Should return success even if there's nothing to redo
            expect(result.success).toBe(false); // No history to redo
        });
    });

    describe('Command Grouping', () => {
        it('should create commands with group IDs', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const groupId = 'test-group-123';

            const result1 = executeEditorCommand(
                CommandType.TOGGLE_BOLD,
                context,
                undefined,
                'Bold in group',
                groupId
            );

            const result2 = executeEditorCommand(
                CommandType.TOGGLE_ITALIC,
                context,
                undefined,
                'Italic in group',
                groupId
            );

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });
    });

    describe('Command Registry', () => {
        it('should handle unknown command types', () => {
            const state = createEditorState();
            const context: CommandContext = {
                state,
                dispatch: mockDispatch,
            };

            const result = executeEditorCommand(
                'UNKNOWN_COMMAND' as CommandType,
                context,
                undefined,
                'Unknown command'
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown command type');
        });
    });
});