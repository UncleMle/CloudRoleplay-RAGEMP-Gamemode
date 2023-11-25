<template>
    <button @click="resetRouter()" class="absolute top-1 right-4">
        <i class="fa-solid fa-xmark duration-300 hover:text-red-500"></i>
    </button>
</template>

<script>
    export default {
        methods: {
            resetRouter() {
                if (window.mp) {
                    window.mp.trigger("browser:resetRouter");
                }
            }
        }
    }
</script>