import { Stave } from "vexflow";
import { Beam, Voice } from "vexflow";
import { notesGeneratorRests } from "./note";
import { staves, updateStavesWidths } from "./staves";
import { pageNumber, render, renderer } from "./vexflow";
import { currentKeySignature } from "./keySign";
import { stavesToAudioParser } from "./audio";

export const amountOfMeasures = ref(52)

watchDebounced(amountOfMeasures, async (amount) => {
    if (staves.length === amount) return
    const context = renderer.value.getContext();
    if (staves.length > amount) {
        staves.length = amount
        staves[staves.length - 1].endBarType = 3
        updateStavesWidths()
        pageNumber.value = 1
        stavesToAudioParser()
        await render()
        return
    }

    const currentLength = staves.length
    for (let i = currentLength; i < amount; ++i) {
        if (i === 0) {
            const stave = new Stave(250, 120, 40)
            stave.addClef("treble").addTimeSignature("4/4").addKeySignature(currentKeySignature.value)
            createMeasure(stave, 250, 120, 40, context, notesGeneratorRests(), 1, 1, true, true, currentKeySignature.value, true)
        } else {
            const staveBefore = staves[i - 1]
            if (i === currentLength) staveBefore.endBarType = 1
            const stave = new Stave(staveBefore.x, staveBefore.y, staveBefore.width)
            const endBarType = i + 1 === amount ? 3 : 1
            createMeasure(stave, staveBefore.x, staveBefore.y, staveBefore.width, context, notesGeneratorRests(), endBarType, staveBefore.row, staveBefore.hasTimeSignature, staveBefore.hasKeySignature, currentKeySignature.value, staveBefore.hasClef)
        }
    }

    staves[staves.length - 1].endBarType = 3
    pageNumber.value = 1
    updateStavesWidths()
    stavesToAudioParser()
    await render()
}, { debounce: 2000 })

export function updateMeasure(stave, index, width, x, y, context, notes, endBarType) {
    if (index !== 0 && staves[index].row === staves[index - 1].row + 1) stave.setMeasure(index + 1)
    stave.setEndBarType(endBarType)
    stave.setWidth(width)
    stave.setContext(context).draw();
}

export function renderMeasure(formatter, stave, context) {
    const width = (stave.hasTimeSignature && !stave.hasKeySignature) || (!stave.hasTimeSignature && stave.hasKeySignature)
        ? stave.width - 140
        : stave.hasTimeSignature && stave.hasKeySignature
            ? stave.width - 160
            : stave.width - 40

    formatter.joinVoices([stave.voice]).format([stave.voice], width)

    const beams = Beam.generateBeams(stave.notes);
    stave.stave.setRendered(false)
    stave.voice.draw(context, stave.stave)

    for (const beam of beams) {
        beam.setContext(context).draw()
    }
}

export function createMeasure(stave, width, x, y, context, notes, endBarType, row, hasTimeSignature, hasKeySignature, key, hasClef) {
    if (staves.length - 2 >= 0 && staves[staves.length - 1].row === staves[staves.length - 2].row + 1) {
        // stave.setMeasure(staves.length)
    }

    let page = 0;
    page = parseInt(((row - 1) / 6)) + 1
    stave.setEndBarType(endBarType)
    stave.setWidth(width)
    const voice = new Voice({ num_beats: 4, beat_value: 4 })
    voice.addTickables(notes)
    staves.push({
        stave: markRaw(stave),
        width,
        height: stave.getHeight(),
        x,
        y,
        notes: markRaw(notes),
        row,
        beginBarType: null,
        endBarType,
        num_beats: 4,
        beat_value: 4,
        voice: markRaw(voice),
        hasTimeSignature,
        hasKeySignature,
        key,
        page,
        hasClef
    })
}
