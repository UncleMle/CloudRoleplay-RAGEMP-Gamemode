<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-[60%] colourBackground border-t-4 border-b-4 shadow-2xl shadow-black border-purple-400/50 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <CloseButton />

                            <ui class="flex justify-center mt-2 space-x-10 pb-2">
                                <button @click="animPage = 'commands'"
                                    class="hover:text-purple-400 hover:scale-105 duration-300">
                                    <i class="fa-solid fa-terminal pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Commands</span>
                                </button>

                                <button @click="animPage = 'keybinds'"
                                    class="duration-300 hover:scale-105 hover:text-purple-400">
                                    <i class="fa-solid fa-key pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Keybinds</span>
                                </button>

                            </ui>

                            <div class="border-b-4 mr-4 ml-4 border-gray-400/50">

                            </div>

                            <div class="p-3 text-center max-h-[30vw] overflow-y-scroll">

                                <div v-if="animPage == 'home'">

                                    <div v-for="(anim, i) in playerData.animations_data" :key="i" class="pt-3 pb-3">

                                        <button @click="playAnim(anim.name)"
                                            class="border-2 p-3 w-full rounded-lg pb-5 border-gray-400/30 duration-300 hover:scale-90">
                                            <p class="pb-4 font-medium text-gray-300">{{ anim.name }}</p>
                                        </button>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import CloseButton from '../ui/CloseButton.vue';
import { mapGetters } from 'vuex';
import { sendToServer } from '../../helpers';


export default {
    data() {
        return {
            animPage: "home"
        }
    },
    components: { CloseButton },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    methods: {
        playAnim(name) {
            sendToServer("server:anim:animationPlayer", name);
        }
    }
}
</script>
