<template>

    <div class="flex justify-center mt-80">
        <div class="rounded-xl p-5  text-white w-96 bg-gray-700 shadow-2xl shadow-black">
            <h1 class="flex justify-center text-xl font-bold">{{ characterSelectionState ? "Select Character" : "Login to Cloud RP" }}</h1>

            <div v-if="!characterSelectionState">
                <form @submit.prevent="login()">
                    <label class="block mt-6">
                        Enter your username
                        <div class="border-gray-400 border-b mt-2 p-2">
                            <input v-model="username" placeholder="Username..." class="block w-full bg-transparent rounded-lg outline-none" />
                        </div>
                    </label>
                    <label class="block mt-6">
                        Enter your password
                        <div class="border-gray-400 border-b mt-2 p-2">
                            <input v-model="password" type="password" placeholder="Password..." class="block w-full rounded-lg bg-transparent outline-none" />
                        </div>
                    </label>

                    <label class="mt-4 relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer" v-model="rememberMe">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Remember me</span>
                    </label>

                    <div class="flex border justify-center mt-2 border-gray-400 rounded-lg">

                        <button @click="login(true)" class="p-3 w-full ">Login</button>

                    </div>

                    <div class="flex border justify-center mt-3 border-gray-400 rounded-lg">

                        <button @click="register()" class="p-3 w-full rounded-lg">Register</button>
                    </div>
                </form>
            </div>
            <div v-else>
                <form>
                    <label class="block mt-6">
                        Enter your character name
                        <div class="border-gray-400 border-b mt-2 p-2">
                            <input v-model="characterName" placeholder="Username..." class="block w-full bg-transparent rounded-lg outline-none" />
                        </div>
                    </label>
                    <div class="flex border justify-center mt-3 border-gray-400 rounded-lg">

                        <button @click="playCharacter()" class="p-3 w-full rounded-lg">Play</button>
                    </div>
                </form>
            </div>


        </div>

</div>

</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        data: function() {
            return {
                username: "",
                password: "",
                rememberMe: false,
                characterName: ""
            };
        },
        computed: {
            ...mapGetters({
                characterSelectionState: 'getCharacterSelectionStatus'
            })
        },
        methods: {
            login(btn) {
                if (!btn) return;
                if (window.mp) {
                    window.mp.trigger("browser:sendObject", "server:recieveAuthInfo",JSON.stringify(this.$data));
                }
            },
            playCharacter() {
                if (this.characterName.length > 0 && window.mp) {
                    window.mp.trigger("browser:sendString", "server:recieveCharacterName", this.characterName);
                }
            },
            register() {
                console.log("register");
            }
        },
        watch: {

        }
    }
</script>