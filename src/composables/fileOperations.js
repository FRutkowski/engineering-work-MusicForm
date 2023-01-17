import { stringify } from "circular-json-es6";
import { Accidental, Stave, StaveNote, Vex } from "vexflow";
import { notesToPlay, stavesToAudioParser } from "./audio";
import { currentKeySignature, duplicatedKeys, keySignatures } from "./keySign";
import { createMeasure } from "./measure";
import { keysArray } from "./modifier";
import { staves, updateStavesWidths } from "./staves";
import { render, renderer } from "./vexflow";

export function downloadFile(toJSON, downloadFileName) {
  const notesToFile = []
  const stavesToFile = []
  console.log(notesToPlay)
  for (const currentNote of notesToPlay) {
    notesToFile.push({
      keys: currentNote.keys,
      duration: currentNote.duration,
      staveIndex: currentNote.staveIndex,
      isRest: currentNote.vexflowNote.isRest()
    })
  }

  for (const stave of staves) {
    stavesToFile.push({
      width: stave.width,
      height: stave.height,
      x: stave.x,
      y: stave.y,
      row: stave.row,
      beginBarType: stave.beginBarType,
      endBarType: stave.endBarType,
      hasTimeSignature: stave.hasTimeSignature,
      hasKeySignature: stave.hasKeySignature,
      key: stave.key,
      page: stave.page,
      hasClef: stave.hasClef
    })
  }

  toJSON.project.push(notesToFile)
  toJSON.project.push(stavesToFile)
  const dictstring = stringify(toJSON, null, 4)
  const a = document.createElement('a')
  const blob = new Blob([dictstring], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = downloadFileName.value
  a.click()
}

export async function loadProject(json) {
  console.log("to json")
  console.log(json)
  const context = renderer.value.getContext()
  staves.length = 0
  const notesFromFile = json.project[json.project.length - 2]
  const stavesFromFile = json.project[json.project.length - 1]
  console.log(notesFromFile)
  console.log(stavesFromFile)

  let stave = stavesFromFile[0]
  currentKeySignature.value = stave.key
  const notes = []
  let currentIndex = 0
  for (const currentNote of notesFromFile) {
    if (currentNote.staveIndex !== currentIndex) {
      const currentStave = new Stave(stave.x, stave.y, stave.width);
      if (stave.hasClef) currentStave.addClef("treble")
      if (stave.hasTimeSignature) currentStave.addTimeSignature("4/4")
      if (stave.hasKeySignature) currentStave.addKeySignature(stave.key)
      createMeasure(currentStave, stave.width, stave.x, stave.y, context, [...notes], stave.endBarType, stave.row, stave.hasTimeSignature,
        stave.hasKeySignature, stave.key, stave.hasClef)
      notes.length = 0
      ++currentIndex
      stave = stavesFromFile[currentIndex]
    }

    const vexflowNote = createStaveNote(currentNote.keys, stave.key, currentNote.duration, currentNote.isRest)
    notes.push(vexflowNote)
  }

  const currentStave = new Stave(stave.x, stave.y, stave.width);
  if (stave.hasClef) currentStave.addClef("treble")
  if (stave.hasTimeSignature) currentStave.addTimeSignature("4/4")
  if (stave.hasKeySignature) currentStave.addKeySignature(stave.key)
  createMeasure(currentStave, stave.width, stave.x, stave.y, context, [...notes], stave.endBarType, stave.row, stave.hasTimeSignature,
    stave.hasKeySignature, stave.key, stave.hasClef)

  updateStavesWidths()
  stavesToAudioParser()
  await render()
}

function createStaveNote(keys, keySignature, duration, isRest) {
  if (keySignature.charAt(keySignature.length - 1) === 'm') keySignature = duplicatedKeys.get(keySignature)
  if (parseInt(duration) === 1) duration = 'w'
  if (parseInt(duration) === 2) duration = 'h'
  if (parseInt(duration) === 4) duration = 'q'
  if (parseInt(duration) === 8) duration = '8'
  if (parseInt(duration) === 16) duration = '16'
  if (parseInt(duration) === 32) duration = '32'

  console.log("tworzenie nuty")
  console.log(isRest)
  const vexflowNoteProps = []
  if (isRest) {
    return duration !== 'w'
      ? new StaveNote({ keys: ["b/4"], duration: duration + "r" })
      : new StaveNote({ keys: ["e/5"], duration: duration + "r" })
  }

  for (const currentKey of keys) {
    // const firstCharOfKey = currentKey.charAt(0) === 'B' ? 'h' : currentKey.charAt(0).toLowerCase()
    const firstCharOfKey = currentKey.charAt(0).toLowerCase()
    if ((currentKey.charAt(1) === '#' || currentKey.charAt(1) === 'b') && (!keySignatures.has(keySignature + currentKey.charAt(0).toUpperCase())
      || (keySignatures.has(keySignature + currentKey.charAt(0).toUpperCase()) && keySignatures.get(keySignature + currentKey.charAt(0).toUpperCase())
        !== currentKey.charAt(0) + currentKey.charAt(1)))) {
      vexflowNoteProps.push({ key: firstCharOfKey + "/" + currentKey.charAt(currentKey.length - 1), modifier: currentKey.charAt(1) })
    } else {
      vexflowNoteProps.push({ key: firstCharOfKey + "/" + currentKey.charAt(currentKey.length - 1), modifier: false })
    }
  }

  vexflowNoteProps.sort((a, b) => keysArray.indexOf(a.key) - keysArray.indexOf(b.key))
  const isModifier = []
  const vexflowKeys = []
  for (let i = 0; i < vexflowNoteProps.length; ++i) {
    isModifier.push(vexflowNoteProps[i].modifier)
    vexflowKeys.push(vexflowNoteProps[i].key)
  }

  const vexFlowNote = new StaveNote({ keys: vexflowKeys, duration: duration })
  for (let i = 0; i < isModifier.length; ++i) {
    if (isModifier[i] !== false) vexFlowNote.addModifier(new Accidental(isModifier[i]), i)
  }

  return vexFlowNote
}

