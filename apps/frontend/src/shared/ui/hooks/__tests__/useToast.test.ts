import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from '../useToast';

describe('useToast', () => {

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when showToast is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Test message',
      type: 'info',
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('should add success toast when success is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Success message',
      type: 'success',
    });
  });

  it('should add error toast when error is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Error message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Error message',
      type: 'error',
    });
  });

  it('should add info toast when info is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Info message',
      type: 'info',
    });
  });

  it('should default to info type if no type is provided', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Default message');
    });

    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should remove toast when closeToast is called', () => {
    const { result } = renderHook(() => useToast());

    // First add a toast
    act(() => {
      result.current.showToast('Test message');
    });
    expect(result.current.toasts).toHaveLength(1);

    // Then remove it
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.closeToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should generate unique IDs for multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
      result.current.showToast('Third');
    });

    expect(result.current.toasts).toHaveLength(3);
    const ids = result.current.toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(3); // All IDs should be unique
  });

  it('should only remove the specified toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First');
      const secondId = result.current.showToast('Second');
      result.current.showToast('Third');

      result.current.closeToast(secondId);
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts.find((t) => t.message === 'Second')).toBeUndefined();
  });
});
