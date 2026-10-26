/**
 * Centralized boundary and monetary validation utilities for Eventora AI.
 */

export const MONETARY_LIMITS = {
  MIN_BUDGET: 1000,
  MAX_BUDGET: 1000000000, // ₹100 Crore
  MAX_EXPENSE: 500000000, // ₹50 Crore
  MIN_GUESTS: 1,
  MAX_GUESTS: 50000,
}

/**
 * Parses and clamps a monetary value into a safe positive integer.
 * Prevents negative amounts, NaN, and runaway overflow numbers.
 */
export function clampAmount(
  value: unknown,
  min = 0,
  max = MONETARY_LIMITS.MAX_EXPENSE
): number {
  if (value === undefined || value === null) return min
  const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  if (isNaN(parsed) || !isFinite(parsed)) return min
  const rounded = Math.round(parsed)
  return Math.min(Math.max(rounded, min), max)
}

/**
 * Validates whether an input represents a valid positive number.
 */
export function isValidPositiveNumber(value: unknown): boolean {
  if (value === undefined || value === null) return false
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num > 0
}

/**
 * Clamps guest count into a realistic integer range.
 */
export function clampGuestCount(value: unknown): number {
  return clampAmount(value, MONETARY_LIMITS.MIN_GUESTS, MONETARY_LIMITS.MAX_GUESTS)
}
