import { describe, it, expect } from 'vitest';
import {
  extractPromptText,
  removeCodeBlocks,
  detectKeywordsWithType,
  hasKeyword,
  getPrimaryKeyword,
  type DetectedKeyword
} from '../hooks/keyword-detector/index.js';
import {
  formatTodoStatus,
  getNextPendingTodo,
  type Todo,
  type IncompleteTodosResult
} from '../hooks/todo-continuation/index.js';

describe('Keyword Detector', () => {
  describe('extractPromptText', () => {
    it('should extract text from text parts', () => {
      const parts = [
        { type: 'text', text: 'Hello world' },
        { type: 'text', text: 'How are you?' }
      ];
      expect(extractPromptText(parts)).toBe('Hello world How are you?');
    });

    it('should filter out non-text parts', () => {
      const parts = [
        { type: 'text', text: 'Hello' },
        { type: 'image', url: 'test.jpg' },
        { type: 'text', text: 'world' }
      ];
      expect(extractPromptText(parts)).toBe('Hello world');
    });

    it('should handle empty parts array', () => {
      expect(extractPromptText([])).toBe('');
    });

    it('should handle parts without text', () => {
      const parts = [
        { type: 'text' },
        { type: 'text', text: undefined }
      ];
      expect(extractPromptText(parts)).toBe('');
    });

    it('should join multiple text parts with space', () => {
      const parts = [
        { type: 'text', text: 'analyze' },
        { type: 'text', text: 'this' },
        { type: 'text', text: 'code' }
      ];
      expect(extractPromptText(parts)).toBe('analyze this code');
    });
  });

  describe('removeCodeBlocks', () => {
    it('should remove triple backtick fenced code blocks', () => {
      const text = 'Some text\n```javascript\nconst x = 1;\n```\nMore text';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('const x = 1');
      expect(result).toContain('Some text');
      expect(result).toContain('More text');
    });

    it('should remove tilde fenced code blocks', () => {
      const text = 'Before\n~~~python\nprint("hello")\n~~~\nAfter';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('print("hello")');
      expect(result).toContain('Before');
      expect(result).toContain('After');
    });

    it('should remove inline code with single backticks', () => {
      const text = 'Use `analyze` command here';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('`analyze`');
      expect(result).toContain('Use');
      expect(result).toContain('command here');
    });

    it('should handle multiple code blocks', () => {
      const text = '```js\ncode1\n```\ntext\n```ts\ncode2\n```';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('code1');
      expect(result).not.toContain('code2');
      expect(result).toContain('text');
    });

    it('should handle text without code blocks', () => {
      const text = 'Just plain text here';
      expect(removeCodeBlocks(text)).toBe(text);
    });

    it('should handle empty string', () => {
      expect(removeCodeBlocks('')).toBe('');
    });

    it('should handle nested inline code', () => {
      const text = 'Text with `inline` and `another` code';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('`');
      expect(result).toContain('Text with');
      expect(result).toContain('and');
      expect(result).toContain('code');
    });
  });

  describe('detectKeywordsWithType', () => {
    it('should detect ultrawork keyword', () => {
      const detected = detectKeywordsWithType('I need ultrawork mode');
      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe('ultrawork');
      expect(detected[0].keyword).toBe('ultrawork');
    });

    it('should detect ulw abbreviation', () => {
      const detected = detectKeywordsWithType('Use ulw for this task');
      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe('ultrawork');
      expect(detected[0].keyword).toBe('ulw');
    });

    it('should detect ultrathink keyword', () => {
      const detected = detectKeywordsWithType('I need to ultrathink this');
      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe('ultrathink');
      expect(detected[0].keyword).toBe('ultrathink');
    });

    it('should detect think keyword', () => {
      const detected = detectKeywordsWithType('Let me think about it');
      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe('ultrathink');
      expect(detected[0].keyword).toBe('think');
    });

    it('should detect search keywords', () => {
      const searchTerms = ['search', 'find', 'locate', 'lookup', 'explore'];
      for (const term of searchTerms) {
        const detected = detectKeywordsWithType(`Please ${term} this file`);
        expect(detected).toHaveLength(1);
        expect(detected[0].type).toBe('search');
        expect(detected[0].keyword).toBe(term);
      }
    });

    it('should detect search patterns', () => {
      const patterns = [
        'where is the config',
        'show me all files',
        'list all functions'
      ];
      for (const pattern of patterns) {
        const detected = detectKeywordsWithType(pattern);
        expect(detected.length).toBeGreaterThan(0);
        const hasSearchType = detected.some(d => d.type === 'search');
        expect(hasSearchType).toBe(true);
      }
    });

    it('should detect analyze keywords', () => {
      const analyzeTerms = ['analyze', 'investigate', 'examine', 'debug'];
      for (const term of analyzeTerms) {
        const detected = detectKeywordsWithType(`Please ${term} this code`);
        expect(detected).toHaveLength(1);
        expect(detected[0].type).toBe('analyze');
        expect(detected[0].keyword).toBe(term);
      }
    });

    it('should detect analyze patterns', () => {
      const patterns = [
        'why is this failing',
        'how does this work',
        'how to implement this'
      ];
      for (const pattern of patterns) {
        const detected = detectKeywordsWithType(pattern);
        expect(detected.length).toBeGreaterThan(0);
        const hasAnalyzeType = detected.some(d => d.type === 'analyze');
        expect(hasAnalyzeType).toBe(true);
      }
    });

    it('should be case insensitive', () => {
      const variants = ['ULTRAWORK', 'UltraWork', 'uLtRaWoRk'];
      for (const variant of variants) {
        const detected = detectKeywordsWithType(variant);
        expect(detected).toHaveLength(1);
        expect(detected[0].type).toBe('ultrawork');
      }
    });

    it('should respect word boundaries', () => {
      // Should not match partial words
      const text = 'multiwork is not ultrawork';
      const detected = detectKeywordsWithType(text);
      expect(detected).toHaveLength(1);
      expect(detected[0].keyword).toBe('ultrawork');
    });

    it('should include position information', () => {
      const detected = detectKeywordsWithType('Start search here');
      expect(detected[0].position).toBe(6); // Position of 'search'
    });

    it('should return empty array for no matches', () => {
      const detected = detectKeywordsWithType('Just plain text');
      expect(detected).toEqual([]);
    });

    it('should detect multiple different keyword types', () => {
      const text = 'search and analyze this code';
      const detected = detectKeywordsWithType(text);
      expect(detected.length).toBeGreaterThanOrEqual(2);
      const types = detected.map(d => d.type);
      expect(types).toContain('search');
      expect(types).toContain('analyze');
    });
  });

  describe('hasKeyword', () => {
    it('should return true when keyword exists', () => {
      expect(hasKeyword('use ultrawork mode')).toBe(true);
      expect(hasKeyword('search for files')).toBe(true);
      expect(hasKeyword('analyze this')).toBe(true);
    });

    it('should return false when no keyword exists', () => {
      expect(hasKeyword('just normal text')).toBe(false);
      expect(hasKeyword('hello world')).toBe(false);
    });

    it('should ignore keywords in code blocks', () => {
      const text = 'Normal text\n```\nsearch in code\n```\nMore text';
      expect(hasKeyword(text)).toBe(false);
    });

    it('should detect keywords outside code blocks', () => {
      const text = 'Please search\n```\nsome code\n```\nfor this';
      expect(hasKeyword(text)).toBe(true);
    });

    it('should handle empty string', () => {
      expect(hasKeyword('')).toBe(false);
    });
  });

  describe('getPrimaryKeyword', () => {
    it('should return highest priority keyword', () => {
      // ultrawork has highest priority
      const text = 'search and analyze with ultrawork';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      expect(primary!.type).toBe('ultrawork');
    });

    it('should return ultrathink when no ultrawork', () => {
      const text = 'search and think about this';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      expect(primary!.type).toBe('ultrathink');
    });

    it('should return search when only search keyword', () => {
      const text = 'find all files';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      expect(primary!.type).toBe('search');
    });

    it('should return analyze when only analyze keyword', () => {
      const text = 'investigate this issue';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      expect(primary!.type).toBe('analyze');
    });

    it('should return null when no keywords', () => {
      const primary = getPrimaryKeyword('just normal text');
      expect(primary).toBeNull();
    });

    it('should ignore code blocks', () => {
      const text = '```\nultrawork code\n```\nsearch this';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      expect(primary!.type).toBe('search');
    });

    it('should return first detected when same priority', () => {
      // Both search and analyze have same priority
      const text = 'search and analyze';
      const primary = getPrimaryKeyword(text);
      expect(primary).not.toBeNull();
      // Should return search as it comes first in priority list
      expect(primary!.type).toBe('search');
    });
  });
});

describe('Todo Continuation', () => {
  describe('formatTodoStatus', () => {
    it('should format when all tasks complete', () => {
      const result: IncompleteTodosResult = {
        count: 0,
        todos: [],
        total: 5
      };
      expect(formatTodoStatus(result)).toBe('All tasks complete (5 total)');
    });

    it('should format with incomplete tasks', () => {
      const result: IncompleteTodosResult = {
        count: 3,
        todos: [],
        total: 10
      };
      expect(formatTodoStatus(result)).toBe('7/10 completed, 3 remaining');
    });

    it('should handle zero total tasks', () => {
      const result: IncompleteTodosResult = {
        count: 0,
        todos: [],
        total: 0
      };
      expect(formatTodoStatus(result)).toBe('All tasks complete (0 total)');
    });

    it('should handle all tasks incomplete', () => {
      const result: IncompleteTodosResult = {
        count: 5,
        todos: [],
        total: 5
      };
      expect(formatTodoStatus(result)).toBe('0/5 completed, 5 remaining');
    });

    it('should handle single task remaining', () => {
      const result: IncompleteTodosResult = {
        count: 1,
        todos: [],
        total: 10
      };
      expect(formatTodoStatus(result)).toBe('9/10 completed, 1 remaining');
    });
  });

  describe('getNextPendingTodo', () => {
    it('should return in_progress todo first', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'in_progress' },
        { content: 'Task 3', status: 'pending' }
      ];
      const result: IncompleteTodosResult = {
        count: 3,
        todos,
        total: 3
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.content).toBe('Task 2');
      expect(next!.status).toBe('in_progress');
    });

    it('should return first pending when no in_progress', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'pending' },
        { content: 'Task 3', status: 'completed' }
      ];
      const result: IncompleteTodosResult = {
        count: 2,
        todos: todos.filter(t => t.status !== 'completed'),
        total: 3
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.content).toBe('Task 1');
      expect(next!.status).toBe('pending');
    });

    it('should return null when no todos', () => {
      const result: IncompleteTodosResult = {
        count: 0,
        todos: [],
        total: 0
      };
      const next = getNextPendingTodo(result);
      expect(next).toBeNull();
    });

    it('should return null when all completed', () => {
      const result: IncompleteTodosResult = {
        count: 0,
        todos: [],
        total: 3
      };
      const next = getNextPendingTodo(result);
      expect(next).toBeNull();
    });

    it('should handle todos with priority field', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending', priority: 'low' },
        { content: 'Task 2', status: 'in_progress', priority: 'high' }
      ];
      const result: IncompleteTodosResult = {
        count: 2,
        todos,
        total: 2
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.content).toBe('Task 2');
    });

    it('should handle todos with id field', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending', id: 'todo-1' },
        { content: 'Task 2', status: 'pending', id: 'todo-2' }
      ];
      const result: IncompleteTodosResult = {
        count: 2,
        todos,
        total: 2
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.id).toBe('todo-1');
    });

    it('should ignore cancelled todos', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'cancelled' },
        { content: 'Task 2', status: 'pending' }
      ];
      const result: IncompleteTodosResult = {
        count: 1,
        todos: [todos[1]],
        total: 2
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.content).toBe('Task 2');
    });

    it('should prefer in_progress over multiple pending', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'pending' },
        { content: 'Task 3', status: 'pending' },
        { content: 'Task 4', status: 'in_progress' }
      ];
      const result: IncompleteTodosResult = {
        count: 4,
        todos,
        total: 4
      };
      const next = getNextPendingTodo(result);
      expect(next).not.toBeNull();
      expect(next!.content).toBe('Task 4');
      expect(next!.status).toBe('in_progress');
    });
  });

  describe('Todo type validation', () => {
    it('should handle all valid status values', () => {
      const statuses: Array<Todo['status']> = ['pending', 'in_progress', 'completed', 'cancelled'];
      const todos: Todo[] = statuses.map((status, i) => ({
        content: `Task ${i + 1}`,
        status
      }));

      expect(todos).toHaveLength(4);
      todos.forEach(todo => {
        expect(todo.content).toBeTruthy();
        expect(statuses).toContain(todo.status);
      });
    });

    it('should handle optional fields', () => {
      const todo: Todo = {
        content: 'Test task',
        status: 'pending',
        priority: 'high',
        id: 'test-123'
      };

      expect(todo.content).toBe('Test task');
      expect(todo.status).toBe('pending');
      expect(todo.priority).toBe('high');
      expect(todo.id).toBe('test-123');
    });

    it('should handle minimal todo object', () => {
      const todo: Todo = {
        content: 'Minimal task',
        status: 'pending'
      };

      expect(todo.content).toBe('Minimal task');
      expect(todo.status).toBe('pending');
      expect(todo.priority).toBeUndefined();
      expect(todo.id).toBeUndefined();
    });
  });

  describe('IncompleteTodosResult validation', () => {
    it('should maintain consistency between count and todos length', () => {
      const todos: Todo[] = [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'in_progress' }
      ];
      const result: IncompleteTodosResult = {
        count: todos.length,
        todos,
        total: 5
      };

      expect(result.count).toBe(result.todos.length);
      expect(result.total).toBeGreaterThanOrEqual(result.count);
    });

    it('should handle edge case of more completed than total', () => {
      // This shouldn't happen in practice, but test the type structure
      const result: IncompleteTodosResult = {
        count: 0,
        todos: [],
        total: 3
      };

      expect(result.count).toBeLessThanOrEqual(result.total);
    });
  });
});

describe('Hook Output Structure', () => {
  describe('JSON output format', () => {
    it('should create valid hook output with continue flag', () => {
      const output = {
        continue: true,
        message: 'Test message'
      };

      expect(output).toHaveProperty('continue');
      expect(output).toHaveProperty('message');
      expect(typeof output.continue).toBe('boolean');
      expect(typeof output.message).toBe('string');
    });

    it('should create valid hook output without message', () => {
      const output = {
        continue: false
      };

      expect(output).toHaveProperty('continue');
      expect(output.continue).toBe(false);
    });

    it('should serialize to valid JSON', () => {
      const output = {
        continue: true,
        message: 'ULTRAWORK MODE ACTIVATED'
      };

      const json = JSON.stringify(output);
      const parsed = JSON.parse(json);

      expect(parsed.continue).toBe(true);
      expect(parsed.message).toBe('ULTRAWORK MODE ACTIVATED');
    });

    it('should handle multiline messages', () => {
      const output = {
        continue: true,
        message: 'Line 1\nLine 2\nLine 3'
      };

      const json = JSON.stringify(output);
      const parsed = JSON.parse(json);

      expect(parsed.message).toContain('\n');
      expect(parsed.message.split('\n')).toHaveLength(3);
    });

    it('should handle empty message', () => {
      const output = {
        continue: true,
        message: ''
      };

      expect(output.message).toBe('');
    });

    it('should handle special characters in message', () => {
      const output = {
        continue: true,
        message: 'Message with "quotes" and \'apostrophes\' and \\ backslashes'
      };

      const json = JSON.stringify(output);
      const parsed = JSON.parse(json);

      expect(parsed.message).toBe(output.message);
    });
  });

  describe('Hook message formatting', () => {
    it('should format continuation message', () => {
      const message = '[SYSTEM REMINDER - TODO CONTINUATION] Incomplete tasks remain. Continue working.';
      expect(message).toContain('[SYSTEM REMINDER');
      expect(message).toContain('TODO CONTINUATION');
      expect(message).toContain('Continue working');
    });

    it('should format keyword detection message', () => {
      const keyword: DetectedKeyword = {
        type: 'ultrawork',
        keyword: 'ultrawork',
        position: 0
      };
      const message = `ULTRAWORK MODE ACTIVATED - Detected keyword: ${keyword.keyword}`;
      expect(message).toContain('ULTRAWORK MODE');
      expect(message).toContain(keyword.keyword);
    });

    it('should format todo status message', () => {
      const result: IncompleteTodosResult = {
        count: 2,
        todos: [],
        total: 5
      };
      const status = formatTodoStatus(result);
      const message = `Todo Status: ${status}`;
      expect(message).toContain('3/5 completed');
      expect(message).toContain('2 remaining');
    });
  });
});

describe('Integration: Keyword Detection with Code Blocks', () => {
  it('should detect keywords outside code and ignore inside', () => {
    const text = `
Please search for files

\`\`\`javascript
// This search should be ignored
function search() {
  return analyze();
}
\`\`\`

Now analyze the results
    `;

    const detected = detectKeywordsWithType(removeCodeBlocks(text));
    const types = detected.map(d => d.type);

    expect(types).toContain('search');
    expect(types).toContain('analyze');
    // Should only detect the ones outside code blocks
    expect(detected.filter(d => d.type === 'search')).toHaveLength(1);
    expect(detected.filter(d => d.type === 'analyze')).toHaveLength(1);
  });

  it('should handle inline code with keywords', () => {
    const text = 'Use the `search` command to find files';
    const cleanText = removeCodeBlocks(text);
    const detected = detectKeywordsWithType(cleanText);

    // The word 'find' should still be detected
    expect(detected.some(d => d.type === 'search')).toBe(true);
  });

  it('should prioritize ultrawork even with other keywords', () => {
    const text = 'search, analyze, and use ultrawork mode';
    const primary = getPrimaryKeyword(text);

    expect(primary).not.toBeNull();
    expect(primary!.type).toBe('ultrawork');
    expect(primary!.keyword).toBe('ultrawork');
  });
});

describe('Edge Cases', () => {
  describe('Empty and null inputs', () => {
    it('should handle empty prompt parts', () => {
      expect(extractPromptText([])).toBe('');
    });

    it('should handle empty text in removeCodeBlocks', () => {
      expect(removeCodeBlocks('')).toBe('');
    });

    it('should handle empty text in detectKeywordsWithType', () => {
      expect(detectKeywordsWithType('')).toEqual([]);
    });

    it('should handle empty text in hasKeyword', () => {
      expect(hasKeyword('')).toBe(false);
    });

    it('should handle empty text in getPrimaryKeyword', () => {
      expect(getPrimaryKeyword('')).toBeNull();
    });
  });

  describe('Whitespace handling', () => {
    it('should detect keywords with extra whitespace', () => {
      const text = '   search    for   files   ';
      expect(hasKeyword(text)).toBe(true);
    });

    it('should handle newlines and tabs', () => {
      const text = 'search\n\tfor\r\nfiles';
      const detected = detectKeywordsWithType(text);
      expect(detected.some(d => d.type === 'search')).toBe(true);
    });
  });

  describe('Unicode and special characters', () => {
    it('should handle unicode characters', () => {
      const text = 'search for files with émojis 🔍';
      expect(hasKeyword(text)).toBe(true);
    });

    it('should handle mixed scripts', () => {
      const text = 'Please search 搜索 искать';
      const detected = detectKeywordsWithType(text);
      expect(detected.some(d => d.keyword === 'search')).toBe(true);
    });
  });

  describe('Very long inputs', () => {
    it('should handle long text efficiently', () => {
      const longText = 'plain text '.repeat(1000) + ' search here';
      expect(hasKeyword(longText)).toBe(true);
    });

    it('should handle many code blocks', () => {
      const manyBlocks = '```code```\n'.repeat(100) + 'search here';
      const cleaned = removeCodeBlocks(manyBlocks);
      expect(hasKeyword(cleaned)).toBe(true);
    });
  });
});
