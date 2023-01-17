import { firstRowY, top } from "./addons"
import { closestStaveIndex, staves } from "./staves"

const { x, y } = useMouse({ type: 'client' })

export const pitchCoordinates = computedEager(() => {
    const firstStaveYWithOffset = top.value + firstRowY
    const pitchCoordinates = []
    for (let i = firstStaveYWithOffset - 54; i <= firstStaveYWithOffset + 126; i += 9) {
        pitchCoordinates.push(i)
    }

    return pitchCoordinates
})

export const pitchValues = computedEager(() => {
    return {
        [pitchCoordinates.value[0]]: "e/6",
        [pitchCoordinates.value[1]]: "d/6",
        [pitchCoordinates.value[2]]: "c/6",
        [pitchCoordinates.value[3]]: "b/5",
        [pitchCoordinates.value[4]]: "a/5",
        [pitchCoordinates.value[5]]: "g/5",
        [pitchCoordinates.value[6]]: "f/5",
        [pitchCoordinates.value[7]]: "e/5",
        [pitchCoordinates.value[8]]: "d/5",
        [pitchCoordinates.value[9]]: "c/5",
        [pitchCoordinates.value[10]]: "b/4",
        [pitchCoordinates.value[11]]: "a/4",
        [pitchCoordinates.value[12]]: "g/4",
        [pitchCoordinates.value[13]]: "f/4",
        [pitchCoordinates.value[14]]: "e/4",
        [pitchCoordinates.value[15]]: "d/4",
        [pitchCoordinates.value[16]]: "c/4",
        [pitchCoordinates.value[17]]: "b/3",
        [pitchCoordinates.value[18]]: "a/3",
        [pitchCoordinates.value[19]]: "g/3",
        [pitchCoordinates.value[20]]: "f/3"
}})

export const currentPitch = computed(() => {
    if (closestStaveIndex.value === -1) return null
    let currentPitch = null
    const stave = staves[closestStaveIndex.value]
    let difference = 0
    if (stave.row > 1) {
        difference = Math.abs(stave.y - staves[0].y)
    }

    for (let i = 0; i < pitchCoordinates.value.length - 1; ++i) {
        if (y.value >= pitchCoordinates.value[i] + difference && y.value < pitchCoordinates.value[i + 1] + difference) {
            currentPitch = pitchValues.value[pitchCoordinates.value[i]]
            break
        }
    }

    if (currentPitch === null) return "c/4"
    return currentPitch
})
