export function convertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor)
}

export function convertFromSubcurrency(amount: number, factor = 100) {
  return amount / factor
}
