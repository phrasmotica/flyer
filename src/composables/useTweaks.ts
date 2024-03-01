export const useTweaks = () => {
    const blurNumberInputs = (parentElementId: string) => {
        const parent = document.getElementById(parentElementId)
        if (parent) {
            const buttons = parent.getElementsByClassName("p-inputnumber-button")
            for (const b of buttons) {
                // hack to stop InputNumber elements from focusing after pressing their buttons.
                // Important for mobile UX
                b.addEventListener("mouseup", () => {
                    (<any>document.activeElement)?.blur()
                })
            }
        }
    }

    const blurActive = () => {
        (<any>document.activeElement)?.blur()
    }

    return {
        blurNumberInputs,
        blurActive,
    }
}
