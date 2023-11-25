<template>
    <main>
        <div class="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-t-2 border-b-2 border-gray-500">

                        <div class="border-b border-gray-400">
                            <div class="p-4">
                                <i class="fa-solid fa-right-to-bracket absolute mt-1.5 text-gray-400"></i>
                                <h1 class="flex justify-start text-xl font-bold ml-6">{{ characterSelectionState ? "Select Character" : "Login to Cloud RP" }}</h1>
                            </div>
                        </div>

                        <div v-if="!characterSelectionState" class="p-8">
                            <form @submit.prevent="login()">
                                <label class="block mt-2">
                                    <span class="font-medium">Enter your username</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i class="fa-solid fa-user absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="username" type="text" placeholder="Username..." class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>
                                <label class="block mt-3">
                                    <span class="font-medium">Enter your password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="password" type="password" placeholder="Password..." class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
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
                        <div v-else class="p-3 max-h-[55rem] overflow-x-hidden">

                            <div v-for="item in characters" :key="item">

                                <div class="p-6 font-medium border rounded-3xl border-gray-500 mt-6 shadow-2xl">

                                    <div v-if="item.isBanned" class="flex justify-center bg-red-500/40 p-3 rounded-lg shadow-xl shadow-red-500/10">
                                        Character is banned
                                    </div>

                                    <table class="w-full border-separate [border-spacing:0.75rem] border-b">
                                        <tr class="text-center">
                                            <td><i class="fa-solid fa-file-signature pr-2 "></i>Name</td>
                                            <td><i class="fa-solid fa-notes-medical pr-2"></i>Health</td>
                                            <td><i class="fa-solid fa-calendar-days pr-2"></i>Last Seen</td>
                                            <td><i class="fa-solid fa-star pr-2"></i>Exp</td>
                                        </tr>
                                        <tr class="text-center">
                                            <td class="max-w-[5vw] overflow-hidden text-ellipsis">{{ item.character_name.replace("_", " ") }}</td>
                                            <td>{{ item.character_health }}</td>
                                            <td>{{ formatDate(item.last_login) }}</td>
                                            <td>6969969</td>
                                        </tr>
                                    </table>
                                    <table class="w-full border-separate [border-spacing:0.75rem] border-b">
                                        <tr class="text-center">
                                            <td><i class="fa-solid fa-money-bill pr-2 "></i>Money</td>
                                            <td><i class="fa-solid fa-notes-medical pr-2"></i>Time played</td>
                                            <td><i class="fa-solid fa-calendar-days pr-2"></i>Faction</td>
                                            <td><i class="fa-solid fa-calendar-days pr-2"></i>Created At </td>
                                        </tr>
                                        <tr class="text-center">
                                            <td class="text-green-500">${{ item.money_amount.toLocaleString("en-US") }}</td>
                                            <td>100 minutes</td>
                                            <td class="max-w-[4vw] overflow-hidden text-ellipsis">none</td>
                                            <td>{{ formatDate(item.CreatedDate) }}</td>
                                        </tr>
                                    </table>
                                    <button @click="playCharacter(item.character_name)" class="border p-2 w-full mt-10 rounded-lg border-gray-500 hover:border-green-500 duration-300"><i class="fa-solid fa-play"></i></button>
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
    import { mapGetters } from 'vuex';

    export default {
        data: function() {
            return {
                username: "",
                password: "",
                rememberMe: false,
                characterName: "",
                characters: [] 
            };
        },
        computed: {
            ...mapGetters({
                characterSelectionState: 'getCharacterSelectionStatus',
            })
        },
        methods: {
            login(btn) {
                if (!btn) return;
                if (window.mp) {
                    window.mp.trigger("browser:sendObject", "server:recieveAuthInfo",JSON.stringify(this.$data));
                }
            },
            playCharacter(cname) {
                if (this.characters.length > 0 && window.mp) {
                    window.mp.trigger("browser:sendString", "server:recieveCharacterName", cname);
                }
            },
            register() {
                console.log("register");
            },
            getCharacterData() {
                return this.$store.state.playerInfo.player_characters;
            },
            formatDate(dateString) {
                const dateTime = new Date(dateString);
                return dateTime.toLocaleDateString();
            }
        },
        watch: {

        },
        mounted() {
            this.characters = this.$store.state.playerInfo.player_characters;
            console.log(this.characters);
        }
    }
</script>