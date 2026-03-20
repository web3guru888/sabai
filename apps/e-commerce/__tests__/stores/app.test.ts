import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../src/stores/appStore';

describe('App Store', () => {
  beforeEach(() => {
    // Reset to default state
    useAppStore.setState({
      isAgeVerified: false,
      isPdpaConsented: false,
      language: 'th',
      currentPage: 'home',
      pageParam: null,
    });
  });

  it('has correct default state values', () => {
    const state = useAppStore.getState();

    expect(state.isAgeVerified).toBe(false);
    expect(state.isPdpaConsented).toBe(false);
    expect(state.language).toBe('th');
    expect(state.currentPage).toBe('home');
    expect(state.pageParam).toBeNull();
  });

  it('sets age verified', () => {
    useAppStore.getState().setAgeVerified(true);

    expect(useAppStore.getState().isAgeVerified).toBe(true);
  });

  it('unsets age verified', () => {
    useAppStore.getState().setAgeVerified(true);
    useAppStore.getState().setAgeVerified(false);

    expect(useAppStore.getState().isAgeVerified).toBe(false);
  });

  it('sets PDPA consented', () => {
    useAppStore.getState().setPdpaConsented(true);

    expect(useAppStore.getState().isPdpaConsented).toBe(true);
  });

  it('unsets PDPA consented', () => {
    useAppStore.getState().setPdpaConsented(true);
    useAppStore.getState().setPdpaConsented(false);

    expect(useAppStore.getState().isPdpaConsented).toBe(false);
  });

  it('sets language to en', () => {
    useAppStore.getState().setLanguage('en');

    expect(useAppStore.getState().language).toBe('en');
  });

  it('sets language back to th', () => {
    useAppStore.getState().setLanguage('en');
    useAppStore.getState().setLanguage('th');

    expect(useAppStore.getState().language).toBe('th');
  });

  it('navigates to a page', () => {
    useAppStore.getState().navigate('cart');

    expect(useAppStore.getState().currentPage).toBe('cart');
    expect(useAppStore.getState().pageParam).toBeNull();
  });

  it('navigates to a page with param', () => {
    useAppStore.getState().navigate('product', 'prod-123');

    expect(useAppStore.getState().currentPage).toBe('product');
    expect(useAppStore.getState().pageParam).toBe('prod-123');
  });

  it('navigating resets param to null when not provided', () => {
    useAppStore.getState().navigate('product', 'prod-123');
    useAppStore.getState().navigate('home');

    expect(useAppStore.getState().currentPage).toBe('home');
    expect(useAppStore.getState().pageParam).toBeNull();
  });

  it('supports all page IDs', () => {
    const pages = ['home', 'search', 'cart', 'profile', 'product', 'checkout', 'order-confirmation'] as const;

    for (const page of pages) {
      useAppStore.getState().navigate(page);
      expect(useAppStore.getState().currentPage).toBe(page);
    }
  });
});
