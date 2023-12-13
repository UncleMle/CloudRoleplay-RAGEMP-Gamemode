<template>
    <button @click="resetRouter()" class="absolute top-1 right-4">
        <i class="fa-solid fa-xmark duration-300 hover:text-red-500"></i>
    </button>
</template>

<script>
    export default {
        props: ['resetGui', 'vehData', 'customEvent'],
        methods: {
            resetRouter() {
                if (window.mp) {
                    window.mp.trigger("browser:resetRouter");

                    if(this.customEvent) {
                        window.mp.trigger(this.customEvent);
                        return;
                    }

                    if(this.resetGui) {
                        window.mp.trigger("gui:toggleHudComplete", true);
                        console.log(JSON.stringify(this.vehData));
                        window.mp.trigger("vehicle:setAttachments", JSON.stringify(this.vehData), true);
                    }
                }
            }
        }
    }
</script>