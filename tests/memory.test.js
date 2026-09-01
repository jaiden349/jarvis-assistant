const MemoryManager = require('../src/memory/manager');

describe('MemoryManager', () => {
  let memoryManager;

  beforeAll(async () => {
    memoryManager = new MemoryManager();
    await memoryManager.initialize();
  });

  afterAll(async () => {
    await memoryManager.close();
  });

  test('should save and retrieve memory', async () => {
    const memory = await memoryManager.saveMemory(
      'user_preference',
      { name: 'John', preference: 'concise answers' }
    );

    expect(memory).toBeDefined();
    expect(memory.id).toBeDefined();
    expect(memory.category).toBe('user_preference');
  });

  test('should get all memories', async () => {
    await memoryManager.saveMemory('important_fact', { fact: 'test' });
    const memories = await memoryManager.getAllMemories();

    expect(Array.isArray(memories)).toBe(true);
    expect(memories.length).toBeGreaterThan(0);
  });

  test('should search memories by category', async () => {
    const memories = await memoryManager.searchMemories('important_fact');
    expect(Array.isArray(memories)).toBe(true);
  });

  test('should add conversation turns', async () => {
    await memoryManager.addConversationTurn('user', 'Test message');
    const history = await memoryManager.getRecentConversation();

    expect(history.length).toBeGreaterThan(0);
  });

  test('should forget memory', async () => {
    const memory = await memoryManager.saveMemory('test', { data: 'forget me' });
    await memoryManager.forgetMemory(memory.id);

    const all = await memoryManager.getAllMemories();
    const found = all.find(m => m.id === memory.id);
    expect(found).toBeUndefined();
  });
});