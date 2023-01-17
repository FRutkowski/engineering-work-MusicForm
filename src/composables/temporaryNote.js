import { renderMeasure, updateMeasure } from "./measure";
import { closestStaveIndex, staves } from "./staves";
import { formatter, render, renderer } from "./vexflow";

export const tempNote = {
    voice: null,
    staveIndex: null
}

export const canRenderTempNote = ref(true)
export const renderTemporaryNote = async () => {
    const context = renderer.value.getContext()
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            const index = closestStaveIndex.value
            if (index === -1) return

            const stave = staves[closestStaveIndex.value]
            if (!stave) return

            context.clearRect(stave.x, stave.y - 50, stave.width, stave.height + 120)
            updateMeasure(stave.stave, index, stave.width, stave.x, stave.y, context, stave.notes, stave.endBarType)
            renderMeasure(formatter, stave, context)

            if (closestStaveIndex.value < staves.length - 1) {
                const nextStave = staves[closestStaveIndex.value + 1]
                if (nextStave.row === stave.row) {
                    context.clearRect(nextStave.x, nextStave.y - 50, nextStave.width, nextStave.height + 120)
                    updateMeasure(nextStave.stave, index + 1, nextStave.width, nextStave.x, nextStave.y, context, nextStave.notes, nextStave.endBarType)
                    renderMeasure(formatter, nextStave, context)
                }
            }

            context.setFillStyle("green")
            context.setStrokeStyle("green")
            formatter.createTickContexts([tempNote.voice])
            formatter.preFormat(stave.width, context, [tempNote.voice])
            formatter.postFormat()
            tempNote.voice.draw(context, stave.stave)
            context.setFillStyle('black')
            context.setStrokeStyle('black')

            return resolve()
        })
    })
}
