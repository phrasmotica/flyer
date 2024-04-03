import html2canvas from "html2canvas"

export const useDownloadImage = () => {
    const downloadImage = (blob: string, fileName: string) => {
        const fakeLink = document.createElement("a")

        fakeLink.download = fileName
        fakeLink.href = blob

        document.body.appendChild(fakeLink)
        fakeLink.click()
        document.body.removeChild(fakeLink)

        fakeLink.remove()
    }

    const saveElement = (options: {
        element: HTMLElement,
        baseName: string,
        onClone?: (d: Document, e: HTMLElement) => void,
        success?: () => void,
    }) => {
        html2canvas(options.element, { onclone: options.onClone, })
        .then(canvas => canvas.toDataURL("image/png", 1.0))
        .then(blob => downloadImage(blob, options.baseName + "-" + Date.now()))
        .then(options.success)
    }

    return {
        saveElement,
    }
}
