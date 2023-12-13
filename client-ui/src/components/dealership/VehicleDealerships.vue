<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[18vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-shirt text-gray-400"></i> Clothing Store</h1>
                            <CloseButton />

                            {{ playerData }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
        }),
    }
}
</script>