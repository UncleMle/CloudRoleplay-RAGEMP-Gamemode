<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl pl-4"><i class="fa-solid fa-circle-info text-gray-400"></i> Help
                            </h1>
                            <CloseButton />

                            <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-500">
                                <button @click="browseView = 'commands'" class="hover:text-white">
                                    <i class="fa-solid fa-terminal pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Commands</span>
                                </button>

                                <button @click="browseView = 'keybinds'" class="duration-300 hover:text-white">
                                    <i class="fa-solid fa-key pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Keybinds</span>
                                </button>
                            </ui>

                            <div class="p-3 text-center max-h-[30vw] overflow-y-scroll">

                                <div v-if="browseView == 'commands'">
                                    <div v-for="(item, i) in commands" :key="i" class="pt-3 pb-3">
                                        <div class="border-2 p-3 rounded-lg pb-5 border-gray-500">
                                            <p class="pb-4 font-medium text-gray-300">{{ item.info }}</p>
                                            <font class="bg-gray-500/50 p-2 text-xl rounded-lg font-bold">/{{ item.name }}

                                                <font v-if="item.arguments.length > 0" class="text-yellow-300/80">[{{
                                                    item.arguments.join(', ') }}]</font>
                                            </font>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="browseView == 'keybinds'">
                                    <div v-for="(item, i) in keybinds" :key="i" class="pt-3 pb-3">
                                        <div class="border-2 p-3 rounded-lg pb-5 border-gray-500">
                                            <p class="pb-4 font-medium text-gray-300">{{ item.info }}</p>
                                            <font class="bg-gray-500/50 p-2 text-xl rounded-lg font-bold">{{ item.bind }}

                                            </font>
                                        </div>
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
import CloseButton from '../ui/CloseButton.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            browseView: "commands",
            keybinds: [
                {
                    bind: "F2",
                    info: "Toggles cursor."
                },
                {
                    bind: "Y",
                    info: "Used for interacting with points around the map."
                },
                {
                    bind: "N",
                    info: "Toggles VOIP."
                },
                {
                    bind: "Q",
                    info: "Toggles a vehicle's siren."
                },
                {
                    bind: "F10",
                    info: "Toggles GUI."
                }
            ],
            commands: [
                {
                    name: "me",
                    arguments: ["message"],
                    info: "Displays a /me roleplay message to players within proximity."
                },
                {
                    name: "ooc or /b",
                    arguments: ["message"],
                    info: "Displays a OOC message to players within proximity."
                },
                {
                    name: "ame",
                    arguments: ["message"],
                    info: "Created an RP AME message."
                },
                {
                    name: "afk",
                    arguments: ["answer"],
                    info: "Used to reset afk timer when promted."
                },
                {
                    name: "shout or /s",
                    arguments: ["answer"],
                    info: "Displays a message shouting to players within shouting proximity."
                },
                {
                    name: "stats",
                    arguments: [],
                    info: "Displays info about your character."
                },
                {
                    name: "report",
                    arguments: ["message"],
                    info: "Creates a report."
                },
                {
                    name: "help",
                    arguments: [],
                    info: "Displays general commands."
                },
                {
                    name: "pm",
                    arguments: ["nameOrId", "message"],
                    info: "Privately messages a player OOCLY."
                },
                {
                    name: "nick",
                    arguments: ["nameOrId", "nickname"],
                    info: "Sets a players nickname."
                },
                {
                    name: "removenick",
                    arguments: ["nameOrId"],
                    info: "Removes a players nickname."
                },
                {
                    name: "dc",
                    arguments: [],
                    info: "Disconnects from the server."
                },
                {
                    name: "disableautologin",
                    arguments: [],
                    info: "Disables auto login."
                },
                {
                    name: "park",
                    arguments: [],
                    info: "Parks your vehicle."
                },
                {
                    name: "mods",
                    arguments: [],
                    info: "Opens the mod menu to view mods for your vehicle."
                },
                {
                    name: "players",
                    arguments: [],
                    info: "Says the current player count."
                },
                {
                    name: "fdo",
                    arguments: ["message"],
                    info: "Creates a floating do statement."
                },
                {
                    name: "deletefdos",
                    arguments: [],
                    info: "Deletes your created Floating Do statements."
                }
            ]
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    components: {
        CloseButton
    }
}
</script>