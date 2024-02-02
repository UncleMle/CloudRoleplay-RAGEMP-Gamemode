<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-list text-gray-400"></i> Duty Uniforms</h1>
                            <CloseButton />

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.faction_uniforms" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-500">

                                    {{ item }} || {{ idx }}
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

export default {
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    }
}
</script>