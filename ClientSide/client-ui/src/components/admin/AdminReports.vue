<template>
    <main>
        <div class="fixed inset-0 z-10 w-full text-white text-lg">
            <div class="container flex items-center max-w-5xl mx-auto mt-52 border rounded-lg border-gray-400">
                <div
                    class="relative bg-[#0b0b0b]/70 w-full h-fit py-4 rounded-lg border border-gray-900 shadow-2xl shadow-black text-xl font-medium">

                    <h1 class="font-bold text-2xl pb-2 pl-4"><i class="text-gray-400"></i><i
                            class="fa-solid fa-shield text-gray-400"></i> Active Reports</h1>

                    <CloseButton />

                    <div class="max-h-[35rem] overflow-scroll overflow-x-hidden">
                        <table class="border-separate border-spacing-4 w-full font-normal h-20">
                            <thead>
                                <tr>
                                    <th class="border-b-2 border-gray-500">Player</th>
                                    <th class="border-b-2 border-gray-500">Report ID</th>
                                    <th class="border-b-2 border-gray-500">Description</th>
                                    <th class="border-b-2 border-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody class="text-center">
                                <tr v-for="item in reportData" :key="item" class="max-h-10">
                                    <td class="border-b-2 border-gray-500">Player [{{ item.playerId }}]</td>
                                    <td class="border-b-2 border-gray-500">Report [{{ item.reportId }}]</td>
                                    <td class="border-b-2 border-gray-500 max-w-xs overflow-hidden text-ellipsis text-sm">{{
                                        item.description }}</td>
                                    <td class="border-b-2 border-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        <button @click="accept(item.reportId)" class="p-2 mr-2"><i
                                                class="fa-solid fa-check text-green-400"></i></button>
                                        <button @click="close(item.reportId)" class="p-2"><i
                                                class="fa-solid fa-xmark text-red-400"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </main>
</template>

<script>
import CloseButton from '../ui/CloseButton.vue';

export default {
    data() {
        return {
            reportData: []
        }
    },
    components: {
        CloseButton
    },
    methods: {
        accept(reportId) {
            if (window.mp) {
                window.mp.trigger("browser:sendString", "server:acceptReport", reportId);
            }
        },
        close(reportId) {
            if (window.mp) {
                window.mp.trigger("browser:sendString", "server:closeReport", reportId);
            }
        }
    },
    mounted() {
        this.reportData = this.$store.state.playerInfo.report_data;
    }
}
</script>