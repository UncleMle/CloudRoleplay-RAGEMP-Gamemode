<template>
    <main>
        <div class="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm w-full text-white">
            <div class="container flex items-center max-w-lg mx-auto mt-52">
                <div class="flex justify-center">
                    <div class="rounded-xl text-white w-[34rem] bg-black/70 shadow-2xl shadow-black border border-gray-400 ">

                        <div class="border-b border-gray-400">
                            <div class="p-4">
                                <i class="fa-solid fa-right-to-bracket absolute mt-1.5 text-gray-400"></i>
                                <h1 class="flex justify-start text-xl font-bold ml-5">{{ characterSelectionState ? "Select Character" : "Login to Cloud RP" }}</h1>
                            </div>
                        </div>

                        <div v-if="!characterSelectionState" class="p-8">
                            <form @submit.prevent="login()">
                                <label class="block mt-2">
                                    <span class="font-medium">Enter your username</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i class="fa-solid fa-user absolute pt-3 border-r p-2 h-10 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="username" type="text" placeholder="Username..." class="ml-9 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>
                                <label class="block mt-3">
                                    <span class="font-medium">Enter your password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i class="fa-solid fa-lock absolute pt-3 border-r p-2 h-10 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="password" type="password" placeholder="Password..." class="ml-9 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>

                                </label>

                                <label class="mt-4 relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" class="sr-only peer" v-model="rememberMe">
                                    <div class="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-black/20 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
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
                        <div v-else class="p-8">
                            <form>
                                <label class="block">
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
                </div>
            </div>
    </main>


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