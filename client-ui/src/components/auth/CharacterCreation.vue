<template>

    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
                <div class="max-w-xl ml-10 mt-10">
                    <div class="rounded-xl font-medium text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">
                      <div class="flex border-b-2 border-gray-400">
                          <div class="p-3 text-xl">

                              <i class="fa-solid fa-person-half-dress text-gray-400 pr-2"></i>Character Creation
                          </div>
                      </div>

                            <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-400">
                                <button @click="browsingType = 'General'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-gear"></i><br /><span class="text-gray-300">General</span></button>
                                <button @click="browsingType = 'Face'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-face-smile"></i><br /><span class="text-gray-300">Face</span></button>
                                <button @click="browsingType = 'Hair'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-user"></i><br /><span class="text-gray-300">Hair</span></button>
                                <button @click="browsingType = 'Misc'" class="hover:text-green-500 duration-300"><i class="fa-solid fa-shirt"></i><br /><span class="text-gray-300">Misc</span></button>
                            </ui>

                        
                    <div class="h-[34vw] overflow-x-scroll overlow-hidden select-none">
                        
                        <div v-if="browsingType == 'General'" class="mr-10 ml-10 mt-4">
                            <div class="flex justify-center">
                                <label class="mt-4 relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" class="sr-only peer" v-model="characterData.sex">
                                    <div class="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-black/20 rounded-full peer dark:bg-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-300"></div>
                                    <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Select Sex [{{ characterData.sex ? "female" : "male" }}]</span>
                                </label>
                            </div>

                            <div class="mt-2">
                                <label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mother</label>
                                <input id="steps-range" v-model="characterData.model.firstHeadShape" type="range" min=0 max=40 value=0 class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-black/20 accent-gray-400 accent-shadow-lg accent-shadow-black">
                                <label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Father</label>
                                <input id="steps-range" v-model="characterData.model.secondHeadShape" type="range" min="0" max="40" value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-black/20 accent-gray-400 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4 border-t-2 pt-4 border-gray-400">Mother / Father Mix</label>
                                <input id="steps-range" v-model="characterData.model.headMix" type="range" min="0" max="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-black/20 accent-gray-400 accent-shadow-lg accent-shadow-black">
                                <label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Skin Mix</label>
                                <input id="steps-range" v-model="characterData.model.skinMix" type="range" min="0" max="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-black/20 accent-gray-400 accent-shadow-lg accent-shadow-black">
                            </div>
                        </div>


                     </div>
                    
                    
                    </div>
                    </div>
                </div>
        </main>
</template>

<script>
    export default {

        data() {
            return {
                browsingType: "General",
                characterData: {
                    fname: "",
                    lname: "",
                    model: {
                        firstHeadShape: 0,
                        secondHeadShape: 0,
                        firstSkinTone: 0,
                        secondSkinTone: 0,
                        headMix: 0,
                        skinMix: 0,
                        sex: false
                    }
                }
            }
        },
        watch: {
            characterData: {
                handler(newValue) {
                    if (window.mp) {
                        window.mp.trigger("character:setModel", JSON.stringify(newValue.model));

                    }

                    console.log(JSON.stringify(newValue.model), Number(newValue.model.firstHeadShape));
                },
                deep: true,
            },
        },
        methods: {

        }

    }

</script>