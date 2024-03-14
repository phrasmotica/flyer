export const useListFallback = () => {
    const getFallback = (options: { value: number, disabled: boolean }[], oldIndex: number, defaultValue: number) => {
        const enabledOptions = options.filter(o => !o.disabled)
        if (enabledOptions[oldIndex]) {
            // retain index if we can
            return enabledOptions[oldIndex].value
        }

        // else returns the last element of the list, or the default
        return enabledOptions.at(-1)?.value || defaultValue
    }

    return {
        getFallback,
    }
}
