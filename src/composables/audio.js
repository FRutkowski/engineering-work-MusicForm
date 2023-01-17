import { useStorage } from "@vueuse/core";
import * as Tone from "tone";
import ContrabassWav from 'tonejs-instrument-contrabass-wav';
import FluteWav from 'tonejs-instrument-flute-wav';
import PianoWav from 'tonejs-instrument-piano-wav';
import SaxophoneWav from 'tonejs-instrument-saxophone-wav';
import TrumpetWav from 'tonejs-instrument-trumpet-wav';
import XylophoneWav from 'tonejs-instrument-xylophone-wav';
import { shallowReactive } from "vue";
import { createAccidentalStatusForStave, currentBemolsInStave, currentKeySignature, currentNaturalsInStave, currentSharpsInStave, duplicatedKeys, keySignatures, removeCurrentBemolInStave, removeCurrentNaturalInStave, removeCurrentShrapInStave } from "./keySign";
import { staves } from "./staves";
import { keysArray } from "./modifier";
import { canRenderTempNote } from "./temporaryNote";
import { pageNumber, render } from "./vexflow";

export const isLoaded = ref(false)
export let sampler = null
let isContrabass = false;

export async function prepareTone() {
	initPianoSampler()
	stavesToAudioParser()
	await Tone.loaded()
	isLoaded.value = true
}

export async function initPianoSampler() {
	sampler = new PianoWav({
	}).toDestination()
	if (isContrabass) {
		isContrabass = false;
		stavesToAudioParser()
	}
}

export function initSaxophoneSampler() {
	sampler = new SaxophoneWav().toDestination()
	if (isContrabass) {
		isContrabass = false;
		stavesToAudioParser()
	}
}

export function initTrumpetSampler() {
	sampler = new TrumpetWav().toDestination()
	if (isContrabass) {
		isContrabass = false;
		stavesToAudioParser()
	}
}

export function initXylophoneSampler() {
	sampler = new XylophoneWav().toDestination()
	if (isContrabass) {
		isContrabass = false;
		stavesToAudioParser()
	}
}

export function initContrabassSampler() {
	sampler = new ContrabassWav().toDestination()
	if (!isContrabass) {
		isContrabass = true;
		stavesToAudioParser()
	}
}

export function initFluteSampler() {
	sampler = new FluteWav().toDestination()
	if (isContrabass) {
		isContrabass = false;
		stavesToAudioParser()
	}
}

export const notesToPlay = shallowReactive([])
export function stavesToAudioParser() {
	notesToPlay.length = 0
	currentKeySignature.value = staves[0].key
	console.log(notesToPlay)
	console.log(staves)

	for (let i = 0; i < staves.length; ++i) {
		currentKeySignature.value = staves[i].key
		createAccidentalStatusForStave(i)
		for (const currentNote of staves[i].notes) {
			staveNoteToAudioNote(i, currentNote)
		}
	}
}

function staveNoteToAudioNote(indexOfStave, currentNote) {
	const currentNoteDuration = getNoteDuration(currentNote)
	const currentNoteKeys = getNoteKeys(currentNote, indexOfStave)

	notesToPlay.push({
		keys: currentNoteKeys,
		duration: currentNoteDuration,
		staveIndex: indexOfStave,
		vexflowNote: currentNote
	})
	console.log(notesToPlay)
}

function addKeyDependingOnTheKeySignature(key, modifier, indexOfStave) {
	if (modifier === "") {
		if (currentSharpsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
			removeCurrentBemolInStave(indexOfStave, key)
			return key.charAt(0).toUpperCase() + "#" + parseInt(key.charAt(2))
		}

		if (currentBemolsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
			removeCurrentShrapInStave(indexOfStave, key)
			return key.charAt(0).toUpperCase() + "b" + parseInt(key.charAt(2))
		}

		if (currentNaturalsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
			removeCurrentShrapInStave(indexOfStave, key)
			removeCurrentBemolInStave(indexOfStave, key)
			return key.charAt(0).toUpperCase() + parseInt(key.charAt(2))
		}
	}

	if (modifier === 'b') {
		currentBemolsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
		removeCurrentShrapInStave(indexOfStave, key)
		removeCurrentNaturalInStave(indexOfStave, key)
		return key.charAt(0) + modifier + key.charAt(2)
	}

	if (modifier === '#') {
		currentSharpsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
		removeCurrentBemolInStave(indexOfStave, key)
		removeCurrentNaturalInStave(indexOfStave, key)
		return key.charAt(0) + modifier + key.charAt(2)
	}

	if (modifier === 'n') {
		currentNaturalsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
		removeCurrentShrapInStave(indexOfStave, key)
		removeCurrentBemolInStave(indexOfStave, key)
		return key.charAt(0) + key.charAt(2)
	}

	return keySignatures.get(currentKeySignature.value + key.charAt(0).toUpperCase()) + parseInt(key.charAt(2))
}

function getNoteKeys(thisNote, indexOfStave) {
	const currentKeys = []
	if (thisNote.isRest() === undefined) {
		let i = 0
		// thisNote.keys
		thisNote.keys.sort((a, b) => keysArray.indexOf(a) - keysArray.indexOf(b))
		for (let key of thisNote.keys) {
			let modifier = ""
			for (const currentModifier of thisNote.getModifiers()) {
				if (currentModifier.getCategory() === "Accidental" && currentModifier.getIndex() === i) modifier = currentModifier.type
			}

			if (currentKeySignature.value.charAt(currentKeySignature.value.length - 1) === 'm') currentKeySignature.value = duplicatedKeys.get(currentKeySignature.value)
			if (keySignatures.has(currentKeySignature.value + key.charAt(0).toUpperCase())) {
				currentKeys.push(addKeyDependingOnTheKeySignature(key, modifier, indexOfStave))
				continue;
			}

			if (modifier === "") {
				if (currentSharpsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
					currentKeys.push(key.charAt(0).toUpperCase() + "#" + parseInt(key.charAt(2)))
					removeCurrentBemolInStave(indexOfStave, key)
					continue;
				}

				if (currentBemolsInStave.has(indexOfStave + key.charAt(0).toUpperCase())) {
					currentKeys.push(key.charAt(0).toUpperCase() + "b" + parseInt(key.charAt(2)))
					removeCurrentShrapInStave(indexOfStave, key)
					continue;
				}
			}

			if (modifier === '#') {
				currentSharpsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
				removeCurrentBemolInStave(indexOfStave, key)
				removeCurrentNaturalInStave(indexOfStave, key)
			}

			if (modifier === 'b') {
				currentBemolsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
				removeCurrentShrapInStave(indexOfStave, key)
				removeCurrentNaturalInStave(indexOfStave, key)
			}

			if (modifier === 'n') {
				currentNaturalsInStave.set(indexOfStave + key.charAt(0).toUpperCase(), true)
				removeCurrentBemolInStave(indexOfStave, key)
				removeCurrentShrapInStave(indexOfStave, key)
				currentKeys.push(key.charAt(0).toUpperCase() + parseInt(key.charAt(2)))
				continue
			}

			if (isContrabass) {
				currentKeys.push(key.charAt(0).toUpperCase() + modifier + (parseInt(key.charAt(2)) - 2))
			} else currentKeys.push(key.charAt(0).toUpperCase() + modifier + parseInt(key.charAt(2)))

			++i
		}
	}

	return currentKeys
}

function getNoteDuration(thisNote) {
	let duration
	switch (thisNote.getDuration()) {
		case "w":
			duration = "1n"
			break
		case "h":
			duration = "2n"
			break
		case "q":
			duration = "4n"
			break
		case "8":
			duration = "8n"
			break
		case "16":
			duration = "16n"
			break
		case "32":
			duration = "32n"
			break
	}

	return duration
}

export const bpm = useStorage("bpm", 120)

let wait = 0
export const currentlyPlayedNoteIndex = ref(0)
export const currentlyPlayedNote = computed(() => notesToPlay[currentlyPlayedNoteIndex.value])
export const lastPlayedNote = computed(() => notesToPlay[currentlyPlayedNoteIndex.value - 1])
const { resume, pause } = useIntervalFn(() => {
	const currentNote = currentlyPlayedNote.value
	if (!currentNote) {
		return pause()
	}

	if (wait > 0) {
		return --wait
	}

	currentlyPlayedNoteIndex.value += 1
	wait = 32 / parseInt(currentNote.duration) - 1

	if (currentNote.vexflowNote.isRest() === undefined) {
		sampler.triggerAttackRelease(currentNote.keys, (32 / parseInt(currentNote.duration)) * (60000 / bpm.value / 4 / 2) / 1000, Tone.now())
	}

}, computed(() => 60000 / bpm.value / 4 / 2), {
	immediate: false
})

window.bpm = bpm

export async function playPiece() {
	console.log(notesToPlay)
	lastPlayedNote.value = notesToPlay[0]
	currentlyPlayedNoteIndex.value = 0
	canRenderTempNote.value = false
	wait = 0
	pageNumber.value = 1
	await Promise.all([
		Tone.loaded(),
		render()
	])
	resume()
}

export async function stopPiece() {
	currentlyPlayedNoteIndex.value = 0
	wait = 0
	lastPlayedNote.value = notesToPlay[0]
	canRenderTempNote.value = true
	pageNumber.value = 1
	await render()
	pause()
}

export async function resumePiece() {
	canRenderTempNote.value = false
	resume()
}

export async function pausePiece() {
	canRenderTempNote.value = true
	pause()
}

export function playAddedNote(addedNote, index) {
	if (addedNote.isRest() === undefined) {
		sampler.triggerAttackRelease(getNoteKeys(addedNote, index), getNoteDuration(addedNote));
	}
}
