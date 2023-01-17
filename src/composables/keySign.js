import { stavesToAudioParser } from "./audio"
import { staves } from "./staves"
import { render } from "./vexflow"

export const keySignatures = new Map()
keySignatures.set("CmE", "Eb")
keySignatures.set("CmB", "Bb")
keySignatures.set("CmA", "Ab")
keySignatures.set("DF", "F#")
keySignatures.set("DC", "C#")
keySignatures.set("EF", "F#")
keySignatures.set("EE", "E#")
keySignatures.set("ED", "D#")
keySignatures.set("EC", "C#")
keySignatures.set("FB", "Bb")
keySignatures.set("GF", "F#")
keySignatures.set("AG", "G#")
keySignatures.set("AF", "F#")
keySignatures.set("AC", "C#")
keySignatures.set("BG", "G#")
keySignatures.set("BF", "F#")
keySignatures.set("BD", "D#")
keySignatures.set("BC", "C#")
keySignatures.set("BA", "A#")
keySignatures.set("F#G", "G#")
keySignatures.set("F#F", "F#")
keySignatures.set("F#E", "E#")
keySignatures.set("F#D", "D#")
keySignatures.set("F#C", "C#")
keySignatures.set("F#A", "A#")
keySignatures.set("C#G", "G#")
keySignatures.set("C#F", "F#")
keySignatures.set("C#E", "E#")
keySignatures.set("C#D", "D#")
keySignatures.set("C#C", "C#")
keySignatures.set("C#B", "B#")
keySignatures.set("C#A", "A#")
keySignatures.set("CbE", "Eb")
keySignatures.set("CbD", "Db")
keySignatures.set("CbC", "Cb")
keySignatures.set("CbB", "Bb")
keySignatures.set("CbA", "Ab")
keySignatures.set("CbG", "Gb")
keySignatures.set("CbF", "Fb")
keySignatures.set("GbE", "Eb")
keySignatures.set("GbD", "Db")
keySignatures.set("GbC", "Cb")
keySignatures.set("GbB", "Bb")
keySignatures.set("GbA", "Ab")
keySignatures.set("GbG", "Gb")
keySignatures.set("DbE", "Eb")
keySignatures.set("DbD", "Db")
keySignatures.set("DbB", "Bb")
keySignatures.set("DbA", "Ab")
keySignatures.set("DbG", "Gb")
keySignatures.set("AbE", "Eb")
keySignatures.set("AbD", "Db")
keySignatures.set("AbB", "Bb")
keySignatures.set("AbA", "Ab")
keySignatures.set("EbE", "Eb")
keySignatures.set("EbB", "Bb")
keySignatures.set("EbA", "Ab")
keySignatures.set("EbA", "Ab")
keySignatures.set("BbE", "Eb")
keySignatures.set("BbB", "Bb")

export const duplicatedKeys = new Map()
duplicatedKeys.set("Em", "G")
duplicatedKeys.set("Bm", "D")
duplicatedKeys.set("F#m", "A")
duplicatedKeys.set("C#m", "E")
duplicatedKeys.set("G#m", "B")
duplicatedKeys.set("D#m", "F#")
duplicatedKeys.set("A#m", "C#")
duplicatedKeys.set("Abm", "Cb")
duplicatedKeys.set("Ebm", "Gb")
duplicatedKeys.set("Bbm", "Db")
duplicatedKeys.set("Fm", "Ab")
duplicatedKeys.set("Cm", "Eb")
duplicatedKeys.set("Gm", "Bb")
duplicatedKeys.set("Dm", "F")

export const basicKeys = []
basicKeys.push('C')
basicKeys.push('D')
basicKeys.push('E')
basicKeys.push('F')
basicKeys.push('G')
basicKeys.push('A')
basicKeys.push('B')

export const currentSharpsInStave = new Map()
export const currentBemolsInStave = new Map()
export const currentNaturalsInStave = new Map()

export function createAccidentalStatusForStave(staveIndex) {
    currentSharpsInStave.clear()
    currentBemolsInStave.clear()
    currentNaturalsInStave.clear()
}

export function removeCurrentShrapInStave(indexOfStave, key) {
    if (currentSharpsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
        currentSharpsInStave.delete(indexOfStave + key.charAt(0).toUpperCase())
    }
}

export function removeCurrentBemolInStave(indexOfStave, key) {
    if (currentBemolsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
        currentBemolsInStave.delete(indexOfStave + key.charAt(0).toUpperCase())
    }
}

export function removeCurrentNaturalInStave(indexOfStave, key) {
    if (currentNaturalsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
        currentNaturalsInStave.delete(indexOfStave + key.charAt(0).toUpperCase())
    }
}

export const currentKeySignature = useStorage("C")
export async function changeKeySignature() {
    for (const stave of staves) {
        if (stave.hasClef) {
            stave.stave.setKeySignature(currentKeySignature.value)
            stave.hasKeySignature = true
        }

        stave.key = currentKeySignature.value
    }

    stavesToAudioParser()
    await render()
}