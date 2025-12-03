import { describe, it, expect } from 'vitest';
import { Money } from '@domain/value-objects/Money';

describe('Money Value Object', () => {
  describe('creation', () => {
    it('creates money with valid amount', () => {
      const result = Money.create(100);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(100);
        expect(result.value.currency).toBe('USD');
      }
    });

    it('creates money with specified currency', () => {
      const result = Money.create(50, 'EUR');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(50);
        expect(result.value.currency).toBe('EUR');
      }
    });

    it('normalizes currency to uppercase', () => {
      const result = Money.create(25, 'eur');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.currency).toBe('EUR');
      }
    });

    it('rounds to two decimal places', () => {
      const result = Money.create(10.999);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(11);
      }
    });

    it('fails for negative amount', () => {
      const result = Money.create(-10);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('NEGATIVE');
      }
    });

    it('fails for NaN', () => {
      const result = Money.create(NaN);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID_TYPE');
      }
    });

    it('fails for invalid currency code', () => {
      const result = Money.create(100, 'XYZ');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields[0]?.code).toBe('INVALID');
      }
    });
  });

  describe('zero factory', () => {
    it('creates zero money with default currency', () => {
      const money = Money.zero();

      expect(money.value).toBe(0);
      expect(money.currency).toBe('USD');
      expect(money.isZero()).toBe(true);
    });

    it('creates zero money with specified currency', () => {
      const money = Money.zero('EUR');

      expect(money.value).toBe(0);
      expect(money.currency).toBe('EUR');
    });
  });

  describe('arithmetic operations', () => {
    describe('add', () => {
      it('adds two money values with same currency', () => {
        const money1 = Money.create(100);
        const money2 = Money.create(50);

        expect(money1.ok && money2.ok).toBe(true);
        if (money1.ok && money2.ok) {
          const result = money1.value.add(money2.value);
          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(150);
          }
        }
      });

      it('fails to add different currencies', () => {
        const money1 = Money.create(100, 'USD');
        const money2 = Money.create(50, 'EUR');

        expect(money1.ok && money2.ok).toBe(true);
        if (money1.ok && money2.ok) {
          const result = money1.value.add(money2.value);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.fields[0]?.code).toBe('MISMATCH');
          }
        }
      });
    });

    describe('subtract', () => {
      it('subtracts two money values', () => {
        const money1 = Money.create(100);
        const money2 = Money.create(30);

        expect(money1.ok && money2.ok).toBe(true);
        if (money1.ok && money2.ok) {
          const result = money1.value.subtract(money2.value);
          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(70);
          }
        }
      });

      it('fails when result would be negative', () => {
        const money1 = Money.create(30);
        const money2 = Money.create(100);

        expect(money1.ok && money2.ok).toBe(true);
        if (money1.ok && money2.ok) {
          const result = money1.value.subtract(money2.value);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.fields[0]?.code).toBe('NEGATIVE_RESULT');
          }
        }
      });

      it('fails for different currencies', () => {
        const money1 = Money.create(100, 'USD');
        const money2 = Money.create(50, 'EUR');

        expect(money1.ok && money2.ok).toBe(true);
        if (money1.ok && money2.ok) {
          const result = money1.value.subtract(money2.value);
          expect(result.ok).toBe(false);
        }
      });
    });

    describe('multiply', () => {
      it('multiplies money by a factor', () => {
        const money = Money.create(50);

        expect(money.ok).toBe(true);
        if (money.ok) {
          const result = money.value.multiply(3);
          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.value.value).toBe(150);
          }
        }
      });

      it('fails for negative factor', () => {
        const money = Money.create(50);

        expect(money.ok).toBe(true);
        if (money.ok) {
          const result = money.value.multiply(-2);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.fields[0]?.code).toBe('NEGATIVE');
          }
        }
      });
    });
  });

  describe('comparison', () => {
    it('compares greater than', () => {
      const money1 = Money.create(100);
      const money2 = Money.create(50);

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(money1.value.isGreaterThan(money2.value)).toBe(true);
        expect(money2.value.isGreaterThan(money1.value)).toBe(false);
      }
    });

    it('compares less than', () => {
      const money1 = Money.create(50);
      const money2 = Money.create(100);

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(money1.value.isLessThan(money2.value)).toBe(true);
        expect(money2.value.isLessThan(money1.value)).toBe(false);
      }
    });

    it('throws when comparing different currencies', () => {
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(100, 'EUR');

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(() => money1.value.isGreaterThan(money2.value)).toThrow('Cannot compare different currencies');
        expect(() => money1.value.isLessThan(money2.value)).toThrow('Cannot compare different currencies');
      }
    });
  });

  describe('equality', () => {
    it('considers same amount and currency equal', () => {
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(100, 'USD');

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(money1.value.equals(money2.value)).toBe(true);
      }
    });

    it('considers different amounts not equal', () => {
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(50, 'USD');

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(money1.value.equals(money2.value)).toBe(false);
      }
    });

    it('considers different currencies not equal', () => {
      const money1 = Money.create(100, 'USD');
      const money2 = Money.create(100, 'EUR');

      expect(money1.ok && money2.ok).toBe(true);
      if (money1.ok && money2.ok) {
        expect(money1.value.equals(money2.value)).toBe(false);
      }
    });
  });

  describe('formatting', () => {
    it('formats with toString', () => {
      const result = Money.create(99.99, 'USD');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('USD 99.99');
      }
    });

    it('formats with locale formatter', () => {
      const result = Money.create(1234.56, 'USD');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const formatted = result.value.format('en-US');
        expect(formatted).toContain('1,234.56');
      }
    });
  });
});
