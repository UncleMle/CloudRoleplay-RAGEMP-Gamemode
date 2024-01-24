<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-truck text-gray-400"></i> Available Jobs</h1>
                            <CloseButton />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import CloseButton from '../../ui/CloseButton.vue'
import { sendToServer } from '../../../helpers';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    components: {
        CloseButton
    },
    methods: {
        startPostalJob() {
            sendToServer("server:startPostalJob");
        }
    }
}
</script>