import { getSqlabInfo } from '../models/getSqlabInfo.js';

global.fetch = jest.fn();

describe('getSqlabInfo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockClear();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should return parsed JSON value when record exists', async () => {
    // Mock a successful response with JSON data
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rows: [{ value: '{"key": "value"}' }] // JSON string from DB
      })
    });

    const result = await getSqlabInfo('test_key');
    expect(result).toEqual({ key: 'value' });
    expect(fetch).toHaveBeenCalledWith('/execute-query', expect.any(Object));
  });

  it('should return a string when the value is a simple string', async () => {
    // Mock response with a simple string
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rows: [{ value: '"simple string"' }] // String as JSON
      })
    });

    const result = await getSqlabInfo('string_key');
    expect(result).toBe('simple string');
  });

  it('should return a number when the value is a number', async () => {
    // Mock response with a number
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rows: [{ value: '42' }] // Number as string
      })
    });

    const result = await getSqlabInfo('number_key');
    expect(result).toBe(42);
  });

  it('should return null when record does not exist', async () => {
    // Mock empty response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rows: []
      })
    });

    const result = await getSqlabInfo('non_existent_key');
    expect(result).toBeNull();
  });

  it('should throw error when database request fails', async () => {
    // Mock failed response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(getSqlabInfo('failing_key')).rejects.toThrow('Database request failed with status 500');
  });

  it('should throw error when JSON is invalid', async () => {
    // Mock response with invalid JSON
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rows: [{ value: '{invalid: json}' }]
      })
    });

    await expect(getSqlabInfo('bad_json_key')).rejects.toThrow();
  });

  it('should use parameterized queries to prevent SQL injection', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rows: [] })
    });

    await getSqlabInfo("test'; DROP TABLE sqlab_info;--");
    
    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(requestBody.query).toContain('WHERE name = ?');
    expect(requestBody.parameters).toEqual(["test'; DROP TABLE sqlab_info;--"]);
  });
});