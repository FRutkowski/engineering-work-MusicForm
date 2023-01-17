import { Formatter, Renderer } from "vexflow";
import { renderMeasure, updateMeasure } from "./measure";
import { staves } from "./staves";

export const renderer = ref()
export const formatter = new Formatter()
export const pageNumber = ref(1)

export const createRenderer = (rootElement) => {
    renderer.value = new Renderer(rootElement, Renderer.Backends.SVG)
    renderer.value.resize(1200, 1220);
}

export const render = async () => {
    const context = renderer.value.getContext()
    await new Promise(resolve => {
        requestAnimationFrame(() => {
            context.clear()
            context.setFillStyle("black")
            context.setStrokeStyle("black")
            for (let i = 0; i < staves.length; ++i) {
                const stave = staves[i]
                let page = 0;
                page = parseInt(((stave.row - 1) / 6)) + 1
                if (pageNumber.value !== page) continue
                updateMeasure(stave.stave, i, stave.width, stave.x, stave.y, context, stave.notes, stave.endBarType)
            }

            resolve()
        })
    })

    for (const stave of staves) {
        let page = 0;
        page = parseInt(((stave.row - 1) / 6)) + 1
        if (pageNumber.value !== page) continue
        renderMeasure(formatter, stave, context)
    }
}
