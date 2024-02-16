<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="max-w-xl ml-10 mt-10">
                <div
                    class="rounded-xl font-medium text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">
                    <div class="flex border-b-2 border-gray-500">
                        <div class="p-3 text-xl">

                            <i class="fa-solid fa-person-half-dress text-gray-400 pr-2"></i>Character Creation
                        </div>
                    </div>

                    <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-500">
                        <button @click="browsingType = 'General'" class="hover:text-green-500 duration-300"><i
                                class="fa-solid fa-gear text-gray-400"></i><br /><span
                                class="text-gray-400">General</span></button>
                        <button @click="browsingType = 'Face'" class="hover:text-green-500 duration-300"><i
                                class="fa-solid fa-face-smile text-gray-400"></i><br /><span
                                class="text-gray-400">Face</span></button>
                        <button @click="browsingType = 'Hair'" class="hover:text-green-500 duration-300"><i
                                class="fa-solid fa-user text-gray-400"></i><br /><span
                                class="text-gray-400">Hair</span></button>
                        <button @click="browsingType = 'Other'" class="hover:text-green-500 duration-300"><i
                                class="fa-solid fa-shirt text-gray-400"></i><br /><span
                                class="text-gray-400">Other</span></button>
                    </ui>


                    <div :class="getCurrentHeight" class="duration-300">

                        <div v-if="browsingType == 'General'" class="mr-10 ml-10 mt-4">

                            <div class="flex justify-center">
                                <div class="w-full">
                                    <label class="block">
                                        <span class="font-medium">Enter your first name</span>
                                        <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                            <i class="fa-solid fa-signature absolute pt-3 pl-3 h-11 text-gray-400"></i>
                                            <input v-model="characterData.fname" type="text" maxlength="40"
                                                placeholder="Firstname"
                                                class="ml-9 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                        </div>
                                    </label>
                                    <label class="block mt-4">
                                        <span class="font-medium">Enter your surname</span>

                                        <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                            <i class="fa-solid fa-signature absolute pt-3 pl-3 h-11 text-gray-400"></i>
                                            <input v-model="characterData.lname" type="text" maxlength="40"
                                                placeholder="Surname"
                                                class="ml-9 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                        </div>
                                    </label>
                                </div>
                            </div>


                            <div class="flex justify-center mt-6">

                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" class="sr-only peer" v-model="characterData.model.sex">
                                    <div
                                        class="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer bg-pink-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-blue-300">
                                    </div>
                                    <span class="ms-3 text-sm font-medium text-white">Select Sex [{{ characterData.model.sex
                                        ? "male" : "female" }}]</span>
                                </label>
                            </div>

                            <div class="mt-2">
                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Mother</label>
                                <input id="steps-range" v-model="characterData.model.firstHeadShape" type="range" min=0
                                    max=40 value=0
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Father</label>
                                <input id="steps-range" v-model="characterData.model.secondHeadShape" type="range" min="0"
                                    max="40" value="0"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range"
                                    class="block mb-2 text-sm font-medium  text-white mt-4 border-t-2 pt-4 border-gray-500">Mother
                                    / Father Mix</label>
                                <input id="steps-range" v-model="characterData.model.headMix" type="range" min="0" max="100"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Skin Mix</label>
                                <input id="steps-range" v-model="characterData.model.skinMix" type="range" min="0" max="100"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            </div>
                        </div>


                        <div v-if="browsingType == 'Face'" class="mr-10 ml-10 mt-4">
                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Width</label>
                            <input id="steps-range" v-model="characterData.model.noseWidth" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Length</label>
                            <input id="steps-range" v-model="characterData.model.noseLength" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Tip</label>
                            <input id="steps-range" v-model="characterData.model.noseTip" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Brow Height</label>
                            <input id="steps-range" v-model="characterData.model.browHeight" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Cheekbone
                                Height</label>
                            <input id="steps-range" v-model="characterData.model.cheekBoneHeight" type="range" min="-10"
                                max="10" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Cheeks Width</label>
                            <input id="steps-range" v-model="characterData.model.cheeksWidth" type="range" min="-10"
                                max="10" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Lip Type</label>
                            <input id="steps-range" v-model="characterData.model.lips" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Jaw Height</label>
                            <input id="steps-range" v-model="characterData.model.jawHeight" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Chin
                                Position</label>
                            <input id="steps-range" v-model="characterData.model.chinPosition" type="range" min="-10"
                                max="10" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Chin Shape</label>
                            <input id="steps-range" v-model="characterData.model.chinShape" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Height</label>
                            <input id="steps-range" v-model="characterData.model.noseHeight" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Bridge</label>
                            <input id="steps-range" v-model="characterData.model.noseBridge" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Nose Bridge
                                Shift</label>
                            <input id="steps-range" v-model="characterData.model.noseBridgeShift" type="range" min="-10"
                                max="10" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Brow Width</label>
                            <input id="steps-range" v-model="characterData.model.browWidth" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Cheekbone
                                Width</label>
                            <input id="steps-range" v-model="characterData.model.cheekBoneWidth" type="range" min="-10"
                                max="10" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Eye Type</label>
                            <input id="steps-range" v-model="characterData.model.eyes" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Jaw Width</label>
                            <input id="steps-range" v-model="characterData.model.jawWidth" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Chin Length</label>
                            <input id="steps-range" v-model="characterData.model.chinLength" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Chin Width</label>
                            <input id="steps-range" v-model="characterData.model.chinWidth" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Neck Width</label>
                            <input id="steps-range" v-model="characterData.model.neckWidth" type="range" min="-10" max="10"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                        </div>

                        <div v-if="browsingType == 'Hair'" class="mr-10 ml-10 mt-4">
                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Hair Style</label>
                            <input id="steps-range" v-model="characterData.model.hairStyle" type="range" min="0" max="76"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Hair Colour</label>
                            <input id="steps-range" v-model="characterData.model.hairColour" type="range" min="0" max="63"
                                value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Eyebrows
                                Style</label>
                            <input id="steps-range" v-model="characterData.model.eyebrowsStyle" type="range" min="0"
                                max="40" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Facial Hair
                                Style</label>
                            <input id="steps-range" v-model="characterData.model.facialHairStyle" type="range" min="0"
                                max="63" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Hair
                                Highlights</label>
                            <input id="steps-range" v-model="characterData.model.hairHighlights" type="range" min="0"
                                max="63" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Eyebrows Colour
                            </label>
                            <input id="steps-range" v-model="characterData.model.eyebrowsColour" type="range" min="0"
                                max="63" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Facial Hair
                                Colour</label>
                            <input id="steps-range" v-model="characterData.model.facialHairColour" type="range" min="0"
                                max="63" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Chest hair
                                style</label>
                            <input id="steps-range" v-model="characterData.model.chestHairStyle" type="range" min="0"
                                max="16" value="0"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                        </div>

                        <div v-if="browsingType == 'Other'" class="mr-10 ml-10 mt-4">
                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Blemishes</label>
                            <input id="steps-range" v-model="characterData.model.blemishes" type="range" min="-1" max="12"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Ageing</label>
                            <input id="steps-range" v-model="characterData.model.ageing" type="range" min="-1" max="14"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Complexion</label>
                            <input id="steps-range" v-model="characterData.model.complexion" type="range" min="-1" max="11"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Sundamage</label>
                            <input id="steps-range" v-model="characterData.model.sunDamage" type="range" min="-1" max="16"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Moles /
                                Freckles</label>
                            <input id="steps-range" v-model="characterData.model.molesFreckles" type="range" min="-1"
                                max="18"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Makeup</label>
                            <input id="steps-range" v-model="characterData.model.makeup" type="range" min="-1" max="100"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                            <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Blush Style</label>
                            <input id="steps-range" v-model="characterData.model.blushStyle" type="range" min="-1" max="100"
                                class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                        </div>


                    </div>

                </div>
                <div class="flex justify-center mt-4 bg-black/70 rounded-lg shadow-2xl shadow-black font-medium">
                    <div class="w-full mr-10 ml-10 p-3 text-center">
                        <label for="steps-range" class="block mb-2 text-sm font-medium text-white">Rotation {{
                            characterData.model.rotation }}</label>
                        <input id="steps-range" v-model="characterData.model.rotation" type="range" min="0" max="360"
                            class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                    </div>
                </div>
                <div class="flex justify-center mt-4">
                    <button @click="createCharacter"
                        class="p-2 w-full hover:text-green-400 bg-black/70 font-medium rounded-lg shadow-2xl shadow-black duration-300">Create
                        Character</button>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import { sendToClient, sendToServer } from '@/helpers';

export default {

    data() {
        return {
            browsingType: "General",
            characterData: {
                fname: "",
                lname: "",
                model: {
                    rotation: 0,
                    firstHeadShape: 0,
                    secondHeadShape: 0,
                    firstSkinTone: 0,
                    secondSkinTone: 0,
                    headMix: 50,
                    skinMix: 50,
                    sex: true,
                    noseWidth: 0,
                    noseLength: 0,
                    noseTip: 0,
                    browHeight: 0,
                    cheekBoneHeight: 0,
                    cheeksWidth: 0,
                    lips: 0,
                    lipstick: -1,
                    jawHeight: 0,
                    chinPosition: 0,
                    chinShape: 0,
                    noseHeight: 0,
                    noseBridge: 0,
                    noseBridgeShift: 0,
                    browWidth: 0,
                    cheekBoneWidth: 0,
                    eyes: 0,
                    jawWidth: 0,
                    chinLength: 0,
                    chinWidth: 0,
                    neckWidth: 0,
                    eyeColour: 0,
                    blemishes: -1,
                    ageing: -1,
                    facialHairStyle: -1,
                    facialHairColour: 0,
                    chestHairStyle: -1,
                    hairStyle: 0,
                    hairColour: 0,
                    hairHighlights: 0,
                    eyebrowsStyle: 0,
                    eyebrowsColour: 0,
                    complexion: -1,
                    sunDamage: -1,
                    molesFreckles: -1,
                    blushStyle: -1,
                    makeup: -1
                }
            }
        }
    },
    watch: {
        characterData: {
            handler(newValue) {
                sendToClient("character:setModel", JSON.stringify(newValue.model));
            },
            deep: true,
        },
    },
    computed: {
        getCurrentHeight() {
            let baseStyle = "overflow-x-hidden overlow-hidden select-none "

            switch (this.browsingType) {
                case "General": {
                    baseStyle += "h-[28vw]";
                    break;
                }
                case "Face": {
                    baseStyle += "h-[38vw]";
                    break;
                }
                case "Hair": {
                    baseStyle += "h-[27vw]";
                    break;
                }
                case "Other": {
                    baseStyle += "h-[25vw]";
                    break;
                }
                default: {
                    baseStyle += "h-[40vw]";
                }
            }
            return baseStyle;
        }
    },
    methods: {
        createCharacter() {
            sendToServer("server:recieveCharacterModel", JSON.stringify(this.$data.characterData));
        }
    }

}

</script>