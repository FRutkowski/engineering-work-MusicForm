<script setup>
import { Vex } from "vexflow";
import { left as offsetLeft, top as offsetTop } from "../composables/addons";
import { amountOfMeasures, renderMeasure, updateMeasure } from "../composables/measure";
import { addNote, closestNote, currentNoteType } from '../composables/note';
import { currentPitch } from '../composables/pitch';
import { closestStaveIndex, createExampleSheet, staves, updateStavesWidths, maxPage } from "../composables/staves";
import { canRenderTempNote, renderTemporaryNote, tempNote } from "../composables/temporaryNote";
import { createRenderer, formatter, render, renderer, pageNumber } from "../composables/vexflow";
import { prepareTone, isLoaded, playPiece, stopPiece, resumePiece, pausePiece, lastPlayedNote, bpm, initPianoSampler, initSaxophoneSampler, initTrumpetSampler, initXylophoneSampler, initContrabassSampler, initFluteSampler, currentlyPlayedNote, notesToPlay } from "../composables/audio";
import { changeKeySignature, currentKeySignature } from "../composables/keySign";
import { downloadFile, loadProject } from "../composables/fileOperations"
import { parse } from "circular-json-es6";
import { watch } from "vue";


const { StaveNote, Voice, Accidental } = Vex.Flow
const notesPage = ref()
const titleOfPiece = ref('')
const subTitleOfPiece = ref('')
const composerTitle = ref('')
const lyricistTitle = ref('')
const currentModifier = ref(null)
const downloadFileName = ref('project.txt')

watch(titleOfPiece, (title) => {
  downloadFileName.value = title.split(' ').join('') + '.txt'
  console.log(staves)
})

onMounted(async () => {
  createRenderer(notesPage.value)
  createExampleSheet()
  updateStavesWidths()

  await Promise.all([
    prepareTone(),
    render()
  ])
})

const { top, left } = useElementBounding(computed(() => notesPage.value?.querySelector('svg')))
syncRef(top, offsetTop)
syncRef(left, offsetLeft)

watch([closestNote, currentPitch], ([closestNote, currentPitch]) => {
  if (closestNote === null || currentPitch === null || !canRenderTempNote.value) return
  let stave = staves[closestStaveIndex.value]

  const notes = [
    new StaveNote({ keys: [currentPitch], duration: currentNoteType.value })
      .setXShift(Math.abs(closestNote.getX()))
  ]

  if (currentModifier.value !== null) {
    let modifier = new Accidental(currentModifier.value).setXShift(-1 * Math.abs(closestNote.getX()))
    notes[0].addModifier(modifier)
  }

  const voice = new Voice({
    num_beats: stave.num_beats,
    beat_value: stave.beat_value
  })

  voice.setMode(3)
  voice.addTickables(notes)

  tempNote.voice = voice
  tempNote.staveIndex = closestStaveIndex.value

  return renderTemporaryNote()
})

watch(closestStaveIndex, (closestStaveIndex, previousClosestStaveIndex) => {
  if (!canRenderTempNote.value) return
  if (previousClosestStaveIndex !== -1) {
    const stave = staves[previousClosestStaveIndex]
    if (!stave) return

    const context = renderer.value.getContext()
    context.clearRect(stave.x, stave.y - 30, stave.width, stave.height + 50)
    updateMeasure(stave.stave, previousClosestStaveIndex, stave.width, stave.x, stave.y, context, stave.notes, stave.endBarType)
    renderMeasure(formatter, stave, context)
  }
})

function setRest() {
  currentNoteType.value.charAt(currentNoteType.value.length - 1) === 'r' ? currentNoteType.value = currentNoteType.value.slice(0, -1) : currentNoteType.value += "r"
}

async function addElement() {
  if (currentNoteType.value != null) {
    highlight.value.style.visibility = "hidden"
    addNote()
    await render()
  }
}

async function play() {
  console.log(staves)
  playPiece()
}

async function stop() {
  highlight.value.style.visibility = "hidden"
  stopPiece()
}

async function resume() {
  resumePiece()
}

async function pause() {
  pausePiece()
}

const el = ref(null);
const highlight = ref()
let lastPlayedNoteY = 0
const { x: windowX, y: windowY } = useWindowScroll()
watch(lastPlayedNote, async (thisNote) => {
  const currentNote = thisNote?.vexflowNote
  if (!currentNote || canRenderTempNote.value) return

  try {
    const { y, height } = currentNote.stave ?? { x: 0, y: 0 }
    const x = currentNote.getAbsoluteX()
    if (Math.abs(lastPlayedNoteY - y) > 400) {
      if (pageNumber.value < maxPage.value) ++pageNumber.value
      windowY.value = 0;
      await render()
    }

    highlight.value.style.visibility = "visible"
    if (lastPlayedNoteY !== y) {
      window.scrollTo({
        top: y + 460 - innerHeight / 2,
        behavior: 'smooth'
      })
    }

    lastPlayedNoteY = y
    highlight.value.style.left = x + left.value + 'px'
    highlight.value.style.top = y + 460 + 'px'
    highlight.value.style.height = height + 'px'
  } catch (err) { }
})

function toggleSamplerToPiano() {
  initPianoSampler()
}

function toggleSamplerToSaxophone() {
  initSaxophoneSampler()
}

function toggleSamplerToTrumpet() {
  initTrumpetSampler()
}

function toggleSamplerToXylophone() {
  initXylophoneSampler()
}

function toggleSamplerToContrabass() {
  initContrabassSampler()
}

function toggleSamplerToFlute() {
  initFluteSampler()
}

async function incrementPage() {
  if (pageNumber.value < maxPage.value) ++pageNumber.value
  highlight.value.style.visibility = "hidden"
  pause()
  await render()
}

async function decrementPage() {
  if (pageNumber.value > 1) --pageNumber.value
  highlight.value.style.visibility = "hidden"
  pause()
  await render()
}

function updateKeySignature(newKeySignature) {
  currentKeySignature.value = newKeySignature
  changeKeySignature()
}

function saveFile() {
  const toJSON = { project: [] }
  toJSON.project.push({
    title: titleOfPiece.value,
    subtitle: subTitleOfPiece.value,
    amountOfMeasures: amountOfMeasures.value,
    lyricistTitle: lyricistTitle.value,
    composerTitle: composerTitle.value,
    bpm: bpm.value
  })

  downloadFile(toJSON, downloadFileName)
}

const { files, open, reset } = useFileDialog()
function loadFile(file) {
  const fileReader = new FileReader()
  fileReader.readAsText(file)
  fileReader.onload = async () => {
    const json = parse(fileReader.result, null, 4)
    titleOfPiece.value = json.project[0].title
    subTitleOfPiece.value = json.project[0].subtitle
    amountOfMeasures.value = json.project[0].amountOfMeasures
    lyricistTitle.value = json.project[0].lyricistTitle
    composerTitle.value = json.project[0].composerTitle
    bpm.value = json.project[0].bpm
    await loadProject(json)
  }
}

watch(files, (files) => {
  loadFile(files[0])
})

</script>

<template>
  <div ref="highlight" class="highlight"></div>
  <div id="page">
    <div class="controlPanel">
      <label class="controlPanelLabel">{{ "Duration:" }}</label>
      <button class="controlPanelButton" @click="currentNoteType = 'w'"><img src="../assets/cala_nuta.png"></button>
      <button class="controlPanelButton" @click="currentNoteType = 'h'"><img src="../assets/pol_nuta.png"></button>
      <button class="controlPanelButton" @click="currentNoteType = 'q'"><img src="../assets/cwierc_nuta.png"></button>
      <button class="controlPanelButton" @click="currentNoteType = '8'"><img src="../assets/osemka.png"></button>
      <button class="controlPanelButton" @click="currentNoteType = '16'"><img src="../assets/szesnastka.png"></button>
      <button class="controlPanelButton" @click="currentNoteType = '32'"><img
          src="../assets/trzydziestka_dwojka.png"></button>
      <button class="controlPanelButtonLast" @click="setRest"><img src="../assets/pauza.png"></button>
      <label class="controlPanelLabel">{{ "Pitch:" }}</label>
      <button class="controlPanelButton" @click="currentModifier = 'b'"><img src="../assets/bemol.png"></button>
      <button class="controlPanelButton" @click="currentModifier = '#'"><img src="../assets/sharp.png"></button>
      <button class="controlPanelButton" @click="currentModifier = 'n'"><img src="../assets/natural.png"></button>
      <button class="controlPanelButtonLast" @click="currentModifier = null"><img src="../assets/remove.png"></button>
      <label class="controlPanelLabel">{{ "Playback:" }}</label>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="play"><img src="../assets/play2.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="stop"><img src="../assets/stop2.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="resume"><img
          src="../assets/resume2.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonLast" @click="pause"><img
          src="../assets/pause2.png"></button>
      <label class="controlPanelLabel">{{ "Instruments:" }}</label>
      <button :disabled="!isLoaded" class="controlPanelButtonFirst" @click="toggleSamplerToPiano"><img
          src="../assets/piano.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="toggleSamplerToSaxophone"><img
          src="../assets/saxophone.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="toggleSamplerToTrumpet"><img
          src="../assets/trumpet.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="toggleSamplerToXylophone"><img
          src="../assets/xylophone.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButton" @click="toggleSamplerToContrabass"><img
          src="../assets/violin.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonLast" @click="toggleSamplerToFlute"><img
          src="../assets/flute.png"></button>
      <label class="controlPanelLabel">{{ "Amount of measures:" }}</label>
      <input :disabled="!isLoaded" v-model="amountOfMeasures" class="controlPanelButtonInputLast" />
      <label class="controlPanelLabel">{{ "Bpm:" }}</label>
      <input :disabled="!isLoaded" v-model="bpm" class="controlPanelButtonInput" />
    </div>
    <div class="controlPanel">
      <label class="controlPanelLabel">{{ "Key signature:" }}</label>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('G')"><img
          src="../assets/G-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('D')"><img
          src="../assets/D-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('A')"><img
          src="../assets/A-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('E')"><img
          src="../assets/E-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('B')"><img
          src="../assets/H-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('F#')"><img
          src="../assets/Fis-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('C#')"><img
          src="../assets/Cis-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Cb')"><img
          src="../assets/Ces-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Gb')"><img
          src="../assets/Ges-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Db')"><img
          src="../assets/Des-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Ab')"><img
          src="../assets/As-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Eb')"><img
          src="../assets/Es-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('Bb')"><img
          src="../assets/B-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySig" @click="updateKeySignature('F')"><img
          src="../assets/F-dur.png"></button>
      <button :disabled="!isLoaded" class="controlPanelButtonKeySigLast" @click="updateKeySignature('C')"><img
          src="../assets/C-dur.png"></button>
      <button class="fileInput" @change="onFileSelected">
        <p class="controlPanelLabel2" @click="saveFile">Save file</p>
      </button>
      <button class="fileInput" @change="onFileSelected">
        <p class="controlPanelLabel2" @click="open">Load file</p>
      </button>
    </div>
    <div :class="'sheetMusicPage'">
      <div class="pageButtons">
        <button class="controlPanelButtonPageLeft" @click="decrementPage"><img src="../assets/arrow-left.png"></button>
        <input class="title !outline-none" v-model="titleOfPiece" :placeholder="'(Title)'" />
        <button class="controlPanelButtonPageRight" @click="incrementPage"><img
            src="../assets/arrow-right.png"></button>
      </div>
      <input class="subTitle !outline-none" v-model="subTitleOfPiece" :placeholder="'(Subtitle)'" />
      <input class="composerTitle !outline-none" v-model="composerTitle" :placeholder="'(Composer)'" />
      <input class="lyricistTitle !outline-none" v-model="lyricistTitle" :placeholder="'(Lyricist)'" />
      <div ref="notesPage" @click="addElement">
      </div>
    </div>
  </div>
</template>