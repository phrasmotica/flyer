const gbpFormat = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
})

export const useCurrency = () => {
    const gbp = gbpFormat.format

    return {
        // TODO: export a single function called "currency" that uses whatever
        // the selected currency and locale is
        gbp,
    }
}
