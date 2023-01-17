import { StaveNote, Voice } from "vexflow";
import { left } from "./addons";
import { playAddedNote, stavesToAudioParser } from './audio';
import { addModifiers, keysArray } from "./modifier";
import { pitchCoordinates, pitchValues } from "./pitch";
import { rhythmicValues } from "./rhythm";
import { closestStaveIndex, staves, updateStavesWidths } from "./staves";
import { tempNote } from './temporaryNote';

const { x, y } = useMouse({ type: 'client' })
export const currentNoteType = ref('8')

export const notesGeneratorRests = () => {
    return [
        new StaveNote({ keys: ["C/5"], duration: "hr" }),
        new StaveNote({ keys: ["C/5"], duration: "hr" }),
    ]
}

export const notesGeneratorStave1357 = () => {
    return [
        new StaveNote({ keys: ["a/4"], duration: "8" }),
        new StaveNote({ keys: ["a/4"], duration: "16" }),
        new StaveNote({ keys: ["e/5"], duration: "16" }),
        new StaveNote({ keys: ["d/5"], duration: "16" }),
        new StaveNote({ keys: ["c/5"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "8" }),
        new StaveNote({ keys: ["a/4"], duration: "8" }),
        new StaveNote({ keys: ["a/4"], duration: "16" }),
        new StaveNote({ keys: ["e/5"], duration: "16" }),
        new StaveNote({ keys: ["d/5"], duration: "16" }),
        new StaveNote({ keys: ["c/5"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "8" })
    ]
}

export const notesGeneratorStave26 = () => {
    return [
        new StaveNote({ keys: ["c/5"], duration: "16" }),
        new StaveNote({ keys: ["b/4"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "16" }),
        new StaveNote({ keys: ["c/5"], duration: "8" }),
        new StaveNote({ keys: ["b/4"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "8" }),
        new StaveNote({ keys: ["c/5"], duration: "16" }),
        new StaveNote({ keys: ["b/4"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "16" }),
        new StaveNote({ keys: ["d/5"], duration: "8" }),
        new StaveNote({ keys: ["b/4"], duration: "16" }),
        new StaveNote({ keys: ["g/4"], duration: "8" })
    ]
}

export const notesGeneratorStave4 = () => {
    return [
        new StaveNote({ keys: ["c/5"], duration: "h" }),
        new StaveNote({ keys: ["c/5"], duration: "q" }),
        new StaveNote({ keys: ["b/4"], duration: "q" })
    ]
}

export const notesGenerator = () => {
    return [
        new StaveNote({ keys: ["b/4"], duration: "hr" }),
        new StaveNote({ keys: ["b/4"], duration: "hr" })
    ]
}

export const closestNote = computed(() => {
    if (closestStaveIndex.value === -1) return null

    let closestNote = null
    let closestDistance = Infinity

    for (const currentNote of staves[closestStaveIndex.value].notes) {
        if (!currentNote.preFormatted) break
        const distance = Math.abs(currentNote.getAbsoluteX() - x.value + left.value)
        if (distance < closestDistance) {
            closestDistance = distance
            closestNote = currentNote
        }
    }

    return closestNote
})

function getClosestNoteKeys() {
    const newKeys = []
    for (const key of closestNote.value.keys) {
        for (let j = 0; j < pitchCoordinates.value.length; j++) {
            if (key === pitchValues.value[pitchCoordinates.value[j]]) {
                newKeys.push(key)
            }
        }
    }

    return newKeys
}

const isCurrentNoteTypeRest = computed(() => {
    const type = currentNoteType.value
    return type[type.length - 1] === 'r'
})

function getByValue(map, searchValue) {
    for (const [key, value] of map.entries()) {
        if (value === searchValue) return key
    }
}

const SMALLEST_NOTE_VALUE = 0.0078125
function createNotesInPlaceOfTheBrokenOne(numberOfNoteDivisions, latestIndex, stave, isOddNumberOfNotesToFill, rhythmicValueOfNoteToFill) {
    if (numberOfNoteDivisions === 0) return null
    const arrayOfNotes = []
    if (isOddNumberOfNotesToFill) {
        return [new StaveNote({
            keys: [tempNote.voice.getTickables()[0].keys[0]],
            duration: getByValue(rhythmicValues, rhythmicValueOfNoteToFill)
        })]
    }

    let smallestValue = rhythmicValues.get(stave.notes[latestIndex].getDuration())
    for (let i = 0; i < numberOfNoteDivisions; ++i) {
        smallestValue /= 2
    }

    const amountOfNotesWithTheSmallestValue = 2 ** numberOfNoteDivisions - 1
    for (let i = 0; i < amountOfNotesWithTheSmallestValue; ++i) {
        arrayOfNotes.push(smallestValue)
    }

    let sumOfNotesValues = smallestValue * amountOfNotesWithTheSmallestValue
    let idx = 0
    let startIndex = 0
    let noteTypeRhythmicValueToReplaceNotesWithSmallerValue = 1
    let currentNoteRhythmicValueToReplaceNotesWithCurrentValue = 0
    while (noteTypeRhythmicValueToReplaceNotesWithSmallerValue > SMALLEST_NOTE_VALUE) {
        if (noteTypeRhythmicValueToReplaceNotesWithSmallerValue <= sumOfNotesValues) {
            if (idx !== arrayOfNotes.length) currentNoteRhythmicValueToReplaceNotesWithCurrentValue += arrayOfNotes[idx++]
            if (currentNoteRhythmicValueToReplaceNotesWithCurrentValue === noteTypeRhythmicValueToReplaceNotesWithSmallerValue) {
                arrayOfNotes[startIndex] = currentNoteRhythmicValueToReplaceNotesWithCurrentValue
                arrayOfNotes.splice(startIndex + 1, idx - startIndex - 1) // tu może być bląd
                idx = ++startIndex
                sumOfNotesValues = 0
                for (let i = startIndex; i < arrayOfNotes.length; ++i) {
                    sumOfNotesValues += arrayOfNotes[i]
                }

                //TODO: trzeba tu gdzieś kiedyś dodać by jeśli nuta jest zbyt długa na takt
                //TODO: to aby część jej wartości przechodziła do następnego taktu

                if (startIndex === arrayOfNotes.length) {
                    noteTypeRhythmicValueToReplaceNotesWithSmallerValue /= 2
                    idx = 0
                    startIndex = 0
                }
            } else if (currentNoteRhythmicValueToReplaceNotesWithCurrentValue >= noteTypeRhythmicValueToReplaceNotesWithSmallerValue) {
                currentNoteRhythmicValueToReplaceNotesWithCurrentValue -= arrayOfNotes[idx - 2]
                // ++startIndex
            }

        } else {
            noteTypeRhythmicValueToReplaceNotesWithSmallerValue /= 2
        }
    }

    return arrayOfNotes.reverse().map((tmp) => new StaveNote({
        keys: [tempNote.voice.getTickables()[0].keys[0]],
        duration: getByValue(rhythmicValues, tmp)
    }))
}

function combineTheShorterNotesIntoLongerOnes(stave, indexOfClosestNote, addedNoteDurationValue) {
    let isOddNumberOfNotesToFill = false
    let currentNoteDurationValue = 0
    let i = indexOfClosestNote
    while (currentNoteDurationValue < addedNoteDurationValue) {
        currentNoteDurationValue += rhythmicValues.get(stave.notes[i++].getDuration())
    }

    let latestIndex = i - 1
    let numberOfNoteDivisions = 0
    let latestRhythmicValue = rhythmicValues.get(stave.notes[latestIndex].getDuration())
    while (currentNoteDurationValue > addedNoteDurationValue) {
        currentNoteDurationValue -= latestRhythmicValue
        if (latestRhythmicValue / 2 > SMALLEST_NOTE_VALUE) {
            ++numberOfNoteDivisions
            latestRhythmicValue = latestRhythmicValue / 2
        }

        currentNoteDurationValue += latestRhythmicValue
    }

    if (currentNoteDurationValue !== addedNoteDurationValue) isOddNumberOfNotesToFill = true
    while (currentNoteDurationValue !== addedNoteDurationValue) {
        if (latestRhythmicValue / 2 > SMALLEST_NOTE_VALUE) {
            latestRhythmicValue = latestRhythmicValue / 2
        }

        currentNoteDurationValue += latestRhythmicValue
    }

    const arrayOfNewNotes = createNotesInPlaceOfTheBrokenOne(numberOfNoteDivisions, latestIndex, stave, isOddNumberOfNotesToFill, latestRhythmicValue)
    stave.notes.splice(indexOfClosestNote, latestIndex - indexOfClosestNote)

    stave.notes[indexOfClosestNote] = new StaveNote({
        keys: isCurrentNoteTypeRest.value
            ? currentNoteType.value.split('r')[0] === 'w'
                ? ["d/5"]
                : ["b/4"]
            : [tempNote.voice.getTickables()[0].keys[0]],
        duration: currentNoteType.value
    })

    if (arrayOfNewNotes !== null) {
        stave.notes.splice(indexOfClosestNote + 1, 0, ...arrayOfNewNotes)
    }
}

function getExponentOfPowerWithRootTwo(closestNoteDurationValue, addedNoteDurationValue) {
    return Math.log2(closestNoteDurationValue / addedNoteDurationValue)
}

function breakTheNoteDownIntoSmallerOnes(stave, indexOfClosestNote, closestNoteDurationValue, addedNoteDurationValue) {
    const arrayOfNotes = []
    let currentRhythmicValue = addedNoteDurationValue
    for (let i = 0; i < getExponentOfPowerWithRootTwo(closestNoteDurationValue, addedNoteDurationValue); ++i) {
        arrayOfNotes.push(currentRhythmicValue)
        currentRhythmicValue *= 2
    }

    for (let i = 0; i < arrayOfNotes.length; ++i) {
        let tmp = arrayOfNotes[i]
        if (closestNote.value.isRest()) {
            arrayOfNotes[i] = new StaveNote({
                keys: ["b/4"],
                duration: getByValue(rhythmicValues, tmp) + "r"
            })
        } else {
            let newKeys = getClosestNoteKeys()
            arrayOfNotes[i] = new StaveNote({
                keys: newKeys,
                duration: getByValue(rhythmicValues, tmp)
            })
        }
    }

    stave.notes[indexOfClosestNote] = new StaveNote({
        keys: isCurrentNoteTypeRest.value
            ? currentNoteType.value.split('r')[0] === 'w'
                ? ["e/5"]
                : ["b/4"]
            : [tempNote.voice.getTickables()[0].keys[0]],
        duration: currentNoteType.value
    })

    for (let i = 0; i < arrayOfNotes.length; ++i) {
        stave.notes.splice(indexOfClosestNote + i + 1, 0, arrayOfNotes[i])
    }
}

function matchTheNoteWithTheOthersInTheBar(stave, indexOfClosestNote) {
    const closestNoteDurationValue = rhythmicValues.get(closestNote.value.getDuration())
    const addedNoteDurationValue = rhythmicValues.get(currentNoteType.value.split('r')[0])
    if (closestNoteDurationValue < addedNoteDurationValue) {
        combineTheShorterNotesIntoLongerOnes(stave, indexOfClosestNote, addedNoteDurationValue)
        return
    }

    if (closestNoteDurationValue > addedNoteDurationValue) {
        breakTheNoteDownIntoSmallerOnes(stave, indexOfClosestNote, closestNoteDurationValue, addedNoteDurationValue)
    }
}

export function addNote() {
    if (closestNote.value === null || tempNote.staveIndex === null || tempNote.voice === null) return

    const stave = staves[tempNote.staveIndex]
    let indexOfClosestNote = -1
    for (let i = 0; i < stave.notes.length; ++i) {
        if (!stave.notes[i].preFormatted) return
        if (stave.notes[i].getX() === closestNote.value.getX()) {
            indexOfClosestNote = i
            break
        }
    }

    if (closestNote.value.getDuration() === currentNoteType.value.split('r')[0]) {
        if (isCurrentNoteTypeRest.value) {
            stave.notes[indexOfClosestNote] = new StaveNote({ keys: ['b/4'], duration: currentNoteType.value })
        } else {
            let pitch = closestNote.value.keys
            if (closestNote.value.isRest()) pitch = []
            if (pitch.indexOf(tempNote.voice.getTickables()[0].keys[0]) === -1 || pitch.length === 0) {
                pitch.push(tempNote.voice.getTickables()[0].keys[0])
            }
            
            pitch.sort((a, b) => keysArray.indexOf(a) - keysArray.indexOf(b))
            stave.notes[indexOfClosestNote] = new StaveNote({ keys: pitch, duration: currentNoteType.value })
        }
    } else {
        matchTheNoteWithTheOthersInTheBar(stave, indexOfClosestNote)
    }

    stave.notes[indexOfClosestNote] = addModifiers(stave.notes[indexOfClosestNote], closestNote.value)

    const voice = new Voice({
        num_beats: stave.num_beats,
        beat_value: stave.beat_value
    })

    voice.setMode(3)
    voice.addTickables(stave.notes)

    staves[tempNote.staveIndex].notes = stave.notes
    staves[tempNote.staveIndex].voice = markRaw(voice)
    updateStavesWidths()

    playAddedNote(stave.notes[indexOfClosestNote], tempNote.staveIndex)
    stavesToAudioParser()
    console.log(staves)
}
