import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVariableDescriptions } from '../useVariableDescriptions';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';

// Mock the dependencies
vi.mock('../../reducerContexts/App', () => ({
  useAppState: vi.fn(),
  useAppDispatch: vi.fn()
}));

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

describe('useVariableDescriptions', () => {
  const mockDispatch = vi.fn();
  const mockVariableDefinitions = new Map([
    ['def1', { id: 'def1', name: 'test_variable', createdAt: Date.now(), updatedAt: Date.now() }],
    ['def2', { id: 'def2', name: 'another_variable', createdAt: Date.now(), updatedAt: Date.now() }]
  ]);
  const mockVariableDescriptions = new Map([
    ['def1', {
      id: 'desc1',
      variableDefinitionId: 'def1',
      content: 'This is a test description',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }]
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
    (useAppState as ReturnType<typeof vi.fn>).mockReturnValue({
      variableDefinitions: mockVariableDefinitions,
      variableDescriptions: mockVariableDescriptions
    });
  });

  it('provides getDescription function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    const description = result.current.getDescription('def1');
    expect(description).toBeDefined();
    expect(description?.content).toBe('This is a test description');
  });

  it('provides setDescription function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    act(() => {
      result.current.setDescription('def1', 'New description');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_VARIABLE_DESCRIPTION',
      payload: {
        definitionId: 'def1',
        description: {
          id: 'mock-uuid',
          variableDefinitionId: 'def1',
          content: 'New description',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number)
        }
      }
    });
  });

  it('provides updateDescription function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    act(() => {
      result.current.updateDescription('def1', 'Updated description');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_VARIABLE_DESCRIPTION',
      payload: {
        definitionId: 'def1',
        description: expect.objectContaining({
          content: 'Updated description',
          updatedAt: expect.any(Number)
        })
      }
    });
  });

  it('provides searchDescriptions function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    const results = result.current.searchDescriptions('test');
    expect(results).toHaveLength(1);
    expect(results[0].variableName).toBe('test_variable');
    expect(results[0].description.content).toBe('This is a test description');
  });

  it('returns empty array for empty search term', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    const results = result.current.searchDescriptions('');
    expect(results).toHaveLength(0);
  });

  it('provides getAllDescriptions function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    const allDescriptions = result.current.getAllDescriptions();
    expect(allDescriptions.size).toBe(1);
    expect(allDescriptions.get('def1')?.content).toBe('This is a test description');
  });

  it('provides getDescriptionsReferencingVariable function', () => {
    const mockDescriptionsWithRefs = new Map([
      ['def1', {
        id: 'desc1',
        variableDefinitionId: 'def1',
        content: 'This references [another_variable] in the description',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }]
    ]);

    (useAppState as ReturnType<typeof vi.fn>).mockReturnValue({
      variableDefinitions: mockVariableDefinitions,
      variableDescriptions: mockDescriptionsWithRefs
    });

    const { result } = renderHook(() => useVariableDescriptions());

    const results = result.current.getDescriptionsReferencingVariable('another_variable');
    expect(results).toHaveLength(1);
    expect(results[0].description.content).toContain('[another_variable]');
  });

  it('provides batchUpdateDescriptions function', () => {
    const { result } = renderHook(() => useVariableDescriptions());

    act(() => {
      result.current.batchUpdateDescriptions([
        { definitionId: 'def1', content: 'Batch update 1' },
        { definitionId: 'def2', content: 'Batch update 2' }
      ]);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'BATCH',
      payload: expect.arrayContaining([
        {
          type: 'SET_VARIABLE_DESCRIPTION',
          payload: expect.objectContaining({
            definitionId: 'def1'
          })
        },
        {
          type: 'SET_VARIABLE_DESCRIPTION',
          payload: expect.objectContaining({
            definitionId: 'def2'
          })
        }
      ])
    });
  });

  it('handles missing variable definition in setDescription', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    const { result } = renderHook(() => useVariableDescriptions());

    act(() => {
      result.current.setDescription('nonexistent', 'Test description');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Variable definition nonexistent not found');
    expect(mockDispatch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles missing description in updateDescription', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    const { result } = renderHook(() => useVariableDescriptions());

    act(() => {
      result.current.updateDescription('def2', 'Updated description');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Description for variable definition def2 not found');
    expect(mockDispatch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
