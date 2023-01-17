import { last } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { Formatter, Stave } from 'vexflow';
import { notesGenerator, notesGeneratorRests, notesGeneratorStave1357, notesGeneratorStave26, notesGeneratorStave4 } from '../composables/note';
import { firstRowY, left, top } from "./addons";
import { createMeasure } from './measure';
import { pageNumber, renderer } from './vexflow';
import { currentKeySignature } from './keySign';

export const staves = shallowReactive([])
export const maxPage = ref(1)
const { x, y } = useMouse({ type: 'client' })

export const closestStaveIndex = computedEager(() => {
    if (!staves.length) return -1
    const offsetTop = top.value
    const offsetLeft = left.value

    for (let i = 0; i < staves.length; i++) {
        const stave = staves[i]
        const page = parseInt(((stave.row - 1) / 6)) + 1
        if (page !== pageNumber.value) continue
        if (y.value < offsetTop + stave.y - 30 || y.value > offsetTop + stave.y + stave.height + 30) {
            continue
        }

        if (x.value < offsetLeft + stave.x || x.value > offsetLeft + stave.x + stave.width) {
            continue
        }

        return i
    }

    return -1
})

export function createExampleSheet() {
    const context = renderer.value.getContext();

    const firstStave = new Stave(120, firstRowY, 400);
    let endBarType = 1

    currentKeySignature.value = "C"
    firstStave.addClef("treble").addTimeSignature("4/4").addKeySignature(currentKeySignature.value)
    createMeasure(firstStave, 250, 120, 40, context, notesGeneratorRests(), endBarType, 1, true, true, currentKeySignature.value, true)
    let x = firstStave.width + firstStave.x

    for (let i = 0; i < 3; ++i) {
        const nextStave = new Stave(x, 40, 400)
        if (i === 0) createMeasure(nextStave, 233, x, 40, context, notesGeneratorRests(), endBarType, 1, false, false, currentKeySignature.value, false)
        else if (i === 1) createMeasure(nextStave, 233, x, 40, context, notesGeneratorRests(), endBarType, 1, false, false, currentKeySignature.value, false)
        else if (i === 2) createMeasure(nextStave, 233, x, 40, context, notesGeneratorRests(), endBarType, 1, false, false, currentKeySignature.value, false)

        x = nextStave.width + nextStave.x
    }

    let y = firstRowY
    let i = 0
    for (let j = 0; j < 5; ++j) {
        const firstStaveInLine = new Stave(70, y, 400);
        firstStaveInLine.addClef("treble")
        createMeasure(firstStaveInLine, 250, 70, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, true)

        let x = firstStaveInLine.width + firstStaveInLine.x
        for (let z = 0; z < 3; ++z) {
            if (i === 11 && z === 2) endBarType = 3
            const nextStave = new Stave(x, y, 400)
            if (z === 0) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else if (z === 1) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            x = nextStave.width + nextStave.x
        }

        y += 200
        i += 1
    }

    y = firstRowY
    for (let j = 0; j < 6; ++j) {
        const firstStaveInLine = new Stave(70, y, 400);
        firstStaveInLine.addClef("treble")
        createMeasure(firstStaveInLine, 250, 70, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, true)

        let x = firstStaveInLine.width + firstStaveInLine.x
        for (let z = 0; z < 3; ++z) {
            if (i === 11 && z === 2) endBarType = 3
            const nextStave = new Stave(x, y, 400)
            if (z === 0) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else if (z === 1) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            x = nextStave.width + nextStave.x
        }

        y += 200
        i += 1
    }

    y = firstRowY
    for (let j = 0; j < 1; ++j) {
        const firstStaveInLine = new Stave(70, y, 400);
        firstStaveInLine.addClef("treble")
        createMeasure(firstStaveInLine, 250, 70, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, true)

        let x = firstStaveInLine.width + firstStaveInLine.x
        for (let z = 0; z < 3; ++z) {
            if (i === 11 && z === 2) endBarType = 3
            const nextStave = new Stave(x, y, 400)
            if (z === 0) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else if (z === 1) createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            else createMeasure(nextStave, 250, x, y, context, notesGeneratorRests(), endBarType, i + 2, false, false, currentKeySignature.value, false)
            x = nextStave.width + nextStave.x
        }

        y += 200
        i += 1
    }
}

function computeStaveWidth(stave) {
    let staveWidth = 0
    let formatter = new Formatter()
    staveWidth = (Math.round(formatter.preCalculateMinTotalWidth([stave.voice]) * 100) / 100) + 60
    if (stave.hasKeySignature) staveWidth += 50
    stave.width = staveWidth
    return staveWidth
}

export function updateStavesWidths() {
    let row = 1
    let currentRowWidth = 0
    let lastStaveRowIndexes = []
    let maxWidth = 949
    for (let i = 0; i < staves.length; ++i) {
        if (staves[i].row === row + 1) {
            lastStaveRowIndexes.push(i - 1)
            ++row
        }

        if (i === staves.length - 1) lastStaveRowIndexes.push(i)
    }

    let y = 0
    let currentRowY = 40
    while (y < lastStaveRowIndexes.length) {
        if (y === 1) maxWidth = 1000
        currentRowWidth = 0
        let startIndex = (y - 1) < 0 ? 0 : lastStaveRowIndexes[y - 1] + 1
        for (let i = startIndex; i <= lastStaveRowIndexes[y]; ++i) {
            staves[i].width = computeStaveWidth(staves[i])
            currentRowWidth += staves[i].width
        }

        while (currentRowWidth > maxWidth) {
            currentRowWidth -= staves[lastStaveRowIndexes[y]].width
            staves[lastStaveRowIndexes[y]].row = y + 2
            staves[lastStaveRowIndexes[y]].stave.addClef("treble")
            staves[lastStaveRowIndexes[y]].stave.addKeySignature(currentKeySignature.value)
            if (currentKeySignature !== 'C') staves[lastStaveRowIndexes[y]].hasKeySignature = true
            staves[lastStaveRowIndexes[y]].hasClef = true;

            if (lastStaveRowIndexes[y] + 1 !== staves.length) {
                let firstLineStave = staves[lastStaveRowIndexes[y] + 1].stave
                staves[lastStaveRowIndexes[y] + 1].stave = new Stave(firstLineStave.x, firstLineStave.y, 10)
                staves[lastStaveRowIndexes[y] + 1].hasClef = false
                staves[lastStaveRowIndexes[y] + 1].hasKeySignature = false
            }

            if (y + 1 === lastStaveRowIndexes.length) lastStaveRowIndexes.push(lastStaveRowIndexes[y])
            lastStaveRowIndexes[y] -= 1
        }

        let remainingWidth = (Math.round(maxWidth * 100) / 100) - (Math.round(currentRowWidth * 100) / 100)
        if (remainingWidth > 0) {
            let amountOfStaves = lastStaveRowIndexes[y] - startIndex + 1
            let additionalWidthForEachStave = Math.round((remainingWidth / amountOfStaves) * 100) / 100
            for (let i = startIndex; i <= lastStaveRowIndexes[y]; ++i) {
                staves[i].width += additionalWidthForEachStave
                currentRowWidth += additionalWidthForEachStave
            }

            if (currentRowWidth < maxWidth) {
                staves[startIndex].width += maxWidth - currentRowWidth
            } else if (currentRowWidth > maxWidth) {
                staves[startIndex].width -= currentRowWidth - maxWidth
            }
        }

        for (let i = startIndex; i <= lastStaveRowIndexes[y]; ++i) {
            staves[i].stave.setWidth(staves[i].width)
            if (i === startIndex) {
                if (i !== 0) {
                    staves[i].stave.setX(70)
                    staves[i].x = 70
                    staves[i].stave.setY(currentRowY)
                    staves[i].y = currentRowY
                }

                continue
            }

            staves[i].stave.setX(staves[i - 1].x + staves[i - 1].width)
            staves[i].x = (staves[i - 1].x + staves[i - 1].width)
            staves[i].stave.setY(currentRowY)
            staves[i].y = currentRowY
        }

        currentRowY += 200
        if (currentRowY >= 1200) currentRowY = 40
        ++y
    }

    maxPage.value = parseInt(((lastStaveRowIndexes.length - 1) / 6)) + 1
}
