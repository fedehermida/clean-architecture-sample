import { describe, it, expect } from 'vitest';
import { Stock } from '@domain/value-objects/Stock';

describe('Stock Value Object', () => {
  describe('creation', () => {
    it('creates stock with valid quantity', () => {
      const result = Stock.create(100);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(100);
      }
    });

    it('creates stock with zero quantity', () => {
      const result = Stock.create(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(0);
        expect(result.value.isEmpty()).toBe(true);
      }
    });

    it('fails for negative quantity', () => {
      const result = Stock.create(-10);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('NEGATIVE');
      }
    });

    it('fails for non-integer quantity', () => {
      const result = Stock.create(10.5);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('NOT_INTEGER');
      }
    });

    it('fails for NaN', () => {
      const result = Stock.create(NaN);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID_TYPE');
      }
    });
  });

  describe('zero factory', () => {
    it('creates zero stock', () => {
      const stock = Stock.zero();

      expect(stock.value).toBe(0);
      expect(stock.isEmpty()).toBe(true);
      expect(stock.isInStock()).toBe(false);
    });
  });

  describe('canFulfill', () => {
    it('returns true when quantity is sufficient', () => {
      const result = Stock.create(100);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.canFulfill(50)).toBe(true);
        expect(result.value.canFulfill(100)).toBe(true);
      }
    });

    it('returns false when quantity is insufficient', () => {
      const result = Stock.create(50);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.canFulfill(100)).toBe(false);
      }
    });
  });

  describe('isInStock / isEmpty', () => {
    it('isInStock returns true for positive quantity', () => {
      const result = Stock.create(10);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isInStock()).toBe(true);
        expect(result.value.isEmpty()).toBe(false);
      }
    });

    it('isInStock returns false for zero quantity', () => {
      const result = Stock.create(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isInStock()).toBe(false);
        expect(result.value.isEmpty()).toBe(true);
      }
    });
  });

  describe('reduce', () => {
    it('reduces stock by given quantity', () => {
      const stockResult = Stock.create(100);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.reduce(30);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe(70);
        }
      }
    });

    it('allows reducing to zero', () => {
      const stockResult = Stock.create(50);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.reduce(50);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe(0);
          expect(result.value.isEmpty()).toBe(true);
        }
      }
    });

    it('fails when reducing more than available', () => {
      const stockResult = Stock.create(50);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.reduce(100);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID_OPERATION');
          expect(result.error.message).toContain('Insufficient stock');
        }
      }
    });

    it('fails when reducing by negative amount', () => {
      const stockResult = Stock.create(100);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.reduce(-10);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.message).toContain('negative');
        }
      }
    });
  });

  describe('increase', () => {
    it('increases stock by given quantity', () => {
      const stockResult = Stock.create(50);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.increase(30);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe(80);
        }
      }
    });

    it('fails when increasing by negative amount', () => {
      const stockResult = Stock.create(50);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const result = stockResult.value.increase(-10);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.fields[0]?.code).toBe('NEGATIVE');
        }
      }
    });
  });

  describe('immutability', () => {
    it('reduce returns new instance', () => {
      const stockResult = Stock.create(100);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const original = stockResult.value;
        const reduced = original.reduce(30);

        expect(reduced.ok).toBe(true);
        if (reduced.ok) {
          expect(original.value).toBe(100); // Original unchanged
          expect(reduced.value.value).toBe(70);
        }
      }
    });

    it('increase returns new instance', () => {
      const stockResult = Stock.create(50);

      expect(stockResult.ok).toBe(true);
      if (stockResult.ok) {
        const original = stockResult.value;
        const increased = original.increase(30);

        expect(increased.ok).toBe(true);
        if (increased.ok) {
          expect(original.value).toBe(50); // Original unchanged
          expect(increased.value.value).toBe(80);
        }
      }
    });
  });

  describe('equality', () => {
    it('considers same quantities equal', () => {
      const stock1 = Stock.create(100);
      const stock2 = Stock.create(100);

      expect(stock1.ok && stock2.ok).toBe(true);
      if (stock1.ok && stock2.ok) {
        expect(stock1.value.equals(stock2.value)).toBe(true);
      }
    });

    it('considers different quantities not equal', () => {
      const stock1 = Stock.create(100);
      const stock2 = Stock.create(50);

      expect(stock1.ok && stock2.ok).toBe(true);
      if (stock1.ok && stock2.ok) {
        expect(stock1.value.equals(stock2.value)).toBe(false);
      }
    });
  });

  describe('toString', () => {
    it('formats stock as string', () => {
      const result = Stock.create(42);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('42 units');
      }
    });
  });
});
