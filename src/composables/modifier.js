import { tempNote } from "./temporaryNote.js";

export function addModifiers(createdNote, closestNote) {
    const newNoteModifier = tempNote.voice.getTickables()[0].getModifiers()[0]
    const idx = getModifierIndex(createdNote, closestNote)
    
    let areOppositeModifiers = false
    if (newNoteModifier === undefined) return createdNote
    if (closestNote.getModifiers().length > 0) {
        for (const currentModifier of closestNote.getModifiers()) {
            const category = currentModifier.getCategory()
            if (currentModifier.getIndex() === idx && category === newNoteModifier.getCategory()) {
                if (category === "Accidental" && ((currentModifier.type === "#" && newNoteModifier.type === "b")
                    || (currentModifier.type === "b" && newNoteModifier.type === "#") || newNoteModifier.type === "n" || currentModifier.type === "n")) {
                    areOppositeModifiers = true
                    continue
                }
            }

            createdNote.addModifier(currentModifier, currentModifier.getIndex())
        }
    }

    if (createdNote.getModifiers().length > 0) {
        for (const currentModifier of createdNote.getModifiers()) {
            if (currentModifier.getIndex() === idx && currentModifier.getCategory() === newNoteModifier.getCategory()) {
                if (currentModifier.getCategory() === "Accidental" && currentModifier.type === newNoteModifier.type) {
                    return createdNote
                }
            }
        }
    }

    if (!areOppositeModifiers) createdNote.addModifier(tempNote.voice.getTickables()[0].getModifiers()[0], idx)
    return createdNote
}

export const keysArray = ['f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5', 'c/6', 'd/6', 'e/6']
const keysValues = keysArray.reduce((accumulator, key, index) => {
    accumulator[key] = index
    return accumulator
}, {})

function getModifierIndex(createdNote, closestNote) {
    if (createdNote.keys.length === 1) return 0
    const sortedKeys = []
    for (const key of createdNote.keys) {
        sortedKeys.push(keysValues[key])
    }

    sortedKeys.sort((a, b) => keysArray.indexOf(a) - keysArray.indexOf(b))
    return sortedKeys.indexOf(keysValues[tempNote.voice.getTickables()[0].keys[0]])
}
