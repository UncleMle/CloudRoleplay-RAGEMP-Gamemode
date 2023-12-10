<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="p-7 grid grid-cols-5 space-x-4">

                            <div id="dragparent">
                                <div class="border p-4" v-for="element in myArray" :key="element.id">
                                    <div class="dragthing w-70">
                                        {{ element.name }}
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
import dragular from 'dragula';

export default {
    data() {
        return {
            myArray: [
                {
                    name: "test",
                    id: 2
                },
                {
                    name: "test two",
                    id: 3
                }
            ]
        }
    },
    mounted() {
        dragular([document.querySelector("#dragparent")]).on("drag", () => {
            console.log("being dragged");
        });
    }
}
</script>