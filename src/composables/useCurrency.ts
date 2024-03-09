const gbpFormat = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
})

// MEDIUM: use vue-i18n's number localisation for this instead
export const useCurrency = () => {
    const gbp = gbpFormat.format

    return {
        gbp,
    }
}
