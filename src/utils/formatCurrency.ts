/**
 * Formats a number into Indian Rupee format (e.g., ₹1,50,000 or ₹25,00,000)
 */
export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0'
  }

  const num = Math.round(Number(amount))
  const isNegative = num < 0
  const absVal = Math.abs(num).toString()

  // Indian numbering system formatting: last 3 digits, then groups of 2
  let result = ''
  if (absVal.length <= 3) {
    result = absVal
  } else {
    const lastThree = absVal.substring(absVal.length - 3)
    const otherNumbers = absVal.substring(0, absVal.length - 3)
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    result = `${formattedOther},${lastThree}`
  }

  return `${isNegative ? '-' : ''}₹${result}`
}

/**
 * Compact Indian currency formatting (e.g. ₹1.5 L, ₹2.4 Cr)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (abs >= 10000000) {
    const val = (abs / 10000000).toFixed(2).replace(/\.?0+$/, '')
    return `${sign}₹${val} Cr`
  }
  if (abs >= 100000) {
    const val = (abs / 100000).toFixed(2).replace(/\.?0+$/, '')
    return `${sign}₹${val} L`
  }
  if (abs >= 1000) {
    const val = (abs / 1000).toFixed(1).replace(/\.?0+$/, '')
    return `${sign}₹${val} K`
  }
  return formatINR(amount)
}
