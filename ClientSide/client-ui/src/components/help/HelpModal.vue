<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full colourBackground border-t-4 border-b-4 shadow-2xl shadow-black border-purple-400/50 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pl-4 absolute"><i class="fa-solid fa-question text-gray-300"></i>
                                Help
                            </h1>
                            <CloseButton />

                            <ui class="flex justify-center mt-2 space-x-10 pb-2">
                                <button @click="browseView = 'commands'"
                                    class="hover:text-purple-400 hover:scale-105 duration-300">
                                    <i class="fa-solid fa-terminal pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Commands</span>
                                </button>

                                <button @click="browseView = 'keybinds'"
                                    class="duration-300 hover:scale-105 hover:text-purple-400">
                                    <i class="fa-solid fa-key pr-2"></i>
                                    <span class="text-gray-300 hover:text-white duration-300 font-medium">Keybinds</span>
                                </button>

                                <button v-if="playerData.admin_data.rankId > 0" @click="browseView = 'admin'"
                                    class="duration-300 hover:scale-105 duration-300">
                                    <i class="fa-solid fa-shield text-red-400 pr-2"></i>
                                    <span class="text-red-300 font-medium">Admin</span>
                                </button>
                            </ui>

                            <div class="border-b-4 mr-4 ml-4 border-gray-400/50">

                            </div>

                            <div class="p-3 text-center max-h-[30vw] overflow-y-scroll">

                                <div v-if="browseView == 'commands'">
                                    <div v-for="(item, i) in commands" :key="i" class="pt-3 pb-3">
                                        <div class="border-2 p-3 rounded-lg pb-5 border-gray-400/30">
                                            <p class="pb-4 font-medium text-gray-300">{{ item.info }}</p>

                                            <div class="flex justify-center">
                                                <div
                                                    class="bg-purple-400/30 min-w-60 border border-gray-400/40 p-2 text-xl rounded-lg font-bold">
                                                    /{{ item.name }}

                                                    <font v-if="item.arguments.length > 0" class="text-gray-300/80">[{{
                                                        item.arguments.join(', ') }}]</font>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="browseView == 'keybinds'">
                                    <div v-for="(item, i) in keybinds" :key="i" class="pt-3 pb-3">
                                        <div class="border-2 p-3 rounded-lg pb-5 border-gray-400/30">
                                            <p class="pb-4 font-medium text-gray-300">{{ item.info }}</p>
                                            <font
                                                class="bg-purple-400/30 border border-gray-400/40 p-2 text-xl rounded-lg font-bold">
                                                {{ item.bind }}
                                            </font>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="browseView == 'admin'">
                                    <div v-for="(item, i) in admin" :key="i" class="pt-3 pb-3">
                                        <div v-if="item.admin <= playerData.admin_data.rankId"
                                            class="border-2 p-3 rounded-lg pb-5 border-gray-400/30">

                                            <p class="pb-4 font-medium text-gray-300">{{ item.info }}</p>

                                            <div class="flex justify-center">
                                                <div
                                                    class="bg-purple-400/30 min-w-60 border border-gray-400/40 text-red-400 p-2 text-xl rounded-lg font-bold">
                                                    /{{ item.name }}

                                                    <font v-if="item.arguments.length > 0" class="text-gray-300/80">[{{
                                                        item.arguments.join(', ') }}]</font>
                                                </div>
                                            </div>
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
            browseView: "admin",
            admin: [
                {
                    name: "aduty",
                    admin: 3,
                    arguments: [],
                    info: "Toggle Admin Duty."
                },
                {
                    name: "aesp",
                    admin: 3,
                    arguments: [],
                    info: "Toggles admin esp."
                },
                {
                    name: "ann",
                    admin: 4,
                    arguments: ["message"],
                    info: "Broadcasts admin announcement."
                },
                {
                    name: "reports",
                    admin: 1,
                    arguments: [],
                    info: "Views active reports."
                },
                {
                    name: "goback",
                    admin: 3,
                    arguments: [],
                    info: "Teleports to last admin postion."
                },
                {
                    name: "staff",
                    admin: 1,
                    arguments: [],
                    info: "Views online staff members."
                },
                {
                    name: "a",
                    admin: 1,
                    arguments: ["message"],
                    info: "Talks in admin chat message."
                },
                {
                    name: "goto",
                    admin: 1,
                    arguments: ["nameOrId"],
                    info: "Teleports to a player via name or id."
                },
                {
                    name: "kick",
                    admin: 3,
                    arguments: ["nameOrId", "silent"],
                    info: "Kicks a player via name or id."
                },
                {
                    name: "revive",
                    admin: 3,
                    arguments: ["nameOrId"],
                    info: "Revives a player via name or id."
                },
                {
                    name: "bring",
                    admin: 3,
                    arguments: ["nameOrId"],
                    info: "Teleports a player to you via name or id."
                },
                {
                    name: "veh",
                    admin: 7,
                    arguments: ["vehName", "colourOne", "colourTwo"],
                    info: "Spawns in a vehicle."
                },
                {
                    name: "vbring",
                    admin: 3,
                    arguments: ["idOrPlate"],
                    info: "Teleports a vehicle to you via its ID or number plate."
                },
                {
                    name: "vbringall",
                    admin: 9,
                    arguments: [],
                    info: "Brings all vehicles in the world."
                },
                {
                    name: "senalltoi",
                    admin: 9,
                    arguments: [],
                    info: "Sends all world vehicles to insurance."
                },
                {
                    name: "freeze",
                    admin: 3,
                    arguments: ["nameOrId"],
                    info: "Freezes a player."
                },
                {
                    name: "tpm",
                    admin: 3,
                    arguments: [],
                    info: "Teleports to a set waypoint."
                },
                {
                    name: "spos",
                    admin: 3,
                    arguments: [],
                    info: "Saves your position."
                },
                {
                    name: "delv",
                    admin: 8,
                    arguments: ["Your vehicle or vehicle Id"],
                    info: "Deletes your vehicle."
                },
                {
                    name: "gcv",
                    admin: 3,
                    arguments: ["close vehicle or vehicle ID"],
                    info: "Prints information about a vehicle."
                },
                {
                    name: "setd",
                    admin: 3,
                    arguments: ["nameOrId", "dimension"],
                    info: "Sets a players dimension."
                },
                {
                    name: "addnewv",
                    admin: 8,
                    arguments: ["vehicleName", "classId", "classType", "dispName"],
                    info: "Adds a new vehicle to the server."
                },
                {
                    name: "changevdata",
                    admin: 8,
                    arguments: ["targetName", "newDisplayName"],
                    info: "Changes a current vehicles data."
                },
                {
                    name: "fix",
                    admin: 3,
                    arguments: [],
                    info: "Fixes the vehicle your in."
                },
                {
                    name: "setaped",
                    admin: 6,
                    arguments: ["nameOrId", "pedName | none"],
                    info: "Sets a admins admin ped."
                },
                {
                    name: "ban",
                    admin: 3,
                    arguments: ["nameOrId", "length (-1 for perm)", "reason"],
                    info: "Bans a player."
                },
                {
                    name: "unban",
                    admin: 3,
                    arguments: ["username"],
                    info: "Unbans a user via username."
                },
                {
                    name: "spw",
                    admin: 9,
                    arguments: ["weaponName", "ammo"],
                    info: "Spawns in a weapon."
                },
                {
                    name: "flip",
                    admin: 3,
                    arguments: ["current vehicle or id"],
                    info: "Flips a vehicle."
                },
                {
                    name: "stv",
                    admin: 3,
                    arguments: ["seatId = 0"],
                    info: "Sets into a vehicle."
                },
                {
                    name: "id",
                    admin: 3,
                    arguments: ["nameOrId"],
                    info: "Opens stats menu about a player."
                },
                {
                    name: "sethp",
                    admin: 3,
                    arguments: ["nameOrId", "health"],
                    info: "Sets health of a player."
                },
                {
                    name: "setaname",
                    admin: 7,
                    arguments: ["nameOrId", "adminName"],
                    info: "Sets a users admin name."
                },
                {
                    name: "setadmin",
                    admin: 6,
                    arguments: ["nameOrId", "adminLevel"],
                    info: "Sets a users admin rank."
                },
                {
                    name: "sentov",
                    admin: 3,
                    arguments: ["plateOrId"],
                    info: "Sends a vehicle to insurance via its ID or plate."
                },
                {
                    name: "gotov",
                    admin: 3,
                    arguments: ["plateOrId"],
                    info: "Teleports to a vehicle via its ID or plate."
                },
                {
                    name: "ha",
                    admin: 7,
                    arguments: ["message"],
                    info: "Talks in HA+ chat."
                },
                {
                    name: "arefuel",
                    admin: 3,
                    arguments: ["current vehicle | id or plate"],
                    info: "Refuels a vehicle."
                },
                {
                    name: "emptyfuel",
                    admin: 7,
                    arguments: ["current vehicle | id or plate"],
                    info: "Removes a vehicles fuel."
                },
                {
                    name: "banchar",
                    admin: 3,
                    arguments: ["characterName"],
                    info: "Bans a character via character name."
                },
                {
                    name: "unbanchar",
                    admin: 3,
                    arguments: ["characterName"],
                    info: "Unbans a character via character name."
                },
                {
                    name: "setvplate",
                    admin: 7,
                    arguments: ["plate"],
                    info: "Sets a vehicles numberplate."
                },
                {
                    name: "gotoc",
                    admin: 3,
                    arguments: ["x", "y", "z"],
                    info: "Teleports to coordinates."
                },
                {
                    name: "giveamoney",
                    admin: 7,
                    arguments: ["nameOrId", "moneyAmount"],
                    info: "Gives a character money."
                },
                {
                    name: "removeamoney",
                    admin: 7,
                    arguments: ["nameOrId", "moneyAmount"],
                    info: "Removes a players character."
                },
                {
                    name: "slap",
                    admin: 3,
                    arguments: ["nameOrId", "units"],
                    info: "Slaps a player."
                },
                {
                    name: "slay",
                    admin: 3,
                    arguments: ["nameOrId"],
                    info: "Slays a player."
                },
                {
                    name: "delcorpse",
                    admin: 3,
                    arguments: ["corpseId"],
                    info: "Deletes a corpse via id."
                },
                {
                    name: "amarker",
                    admin: 3,
                    arguments: ["message"],
                    info: "Creates an admin marker."
                },
                {
                    name: "delfdo",
                    admin: 3,
                    arguments: ["fdoId"],
                    info: "Deletes floating do via id."
                },
                {
                    name: "rmamark",
                    admin: 3,
                    arguments: ["amarkId"],
                    info: "Deletes admin marker via id."
                },
                {
                    name: "rmamarks",
                    admin: 3,
                    arguments: [],
                    info: "Deletes your placed admin markers."
                },
                {
                    name: "makeped",
                    admin: 9,
                    arguments: ["pedName"],
                    info: "Spawns in a ped."
                },
                {
                    name: "makeobj",
                    admin: 9,
                    arguments: ["objName", "rot"],
                    info: "Spawns in an object."
                },
                {
                    name: "avt",
                    admin: 3,
                    arguments: ["x", "y", "z"],
                    info: "Teleports your current vehicle to coords."
                },
                {
                    name: "agivel",
                    admin: 8,
                    arguments: ["nameOrId", "license"],
                    info: "Gives a player a license."
                },
                {
                    name: "asuspend",
                    admin: 8,
                    arguments: ["nameOrId", "license"],
                    info: "Suspends player's license."
                },
                {
                    name: "agivef",
                    admin: 8,
                    arguments: ["nameOrId", "faction"],
                    info: "Adds a player to a faction."
                },
                {
                    name: "addfrank",
                    admin: 9,
                    arguments: ["faction", "salary", "rankName"],
                    info: "Creates a faction rank."
                },
                {
                    name: "givefrank",
                    admin: 9,
                    arguments: ["nameOrId", "faction", "rankId"],
                    info: "Gives a player a faction rank."
                },
                {
                    name: "setfleader",
                    admin: 7,
                    arguments: ["nameOrId", "faction"],
                    info: "Sets a faction leader."
                },
                {
                    name: "giveasalary",
                    admin: 7,
                    arguments: ["nameOrId", "salary"],
                    info: "Gives a player a salary amount."
                },
                {
                    name: "givevip",
                    admin: 7,
                    arguments: ["nameOrId", "days"],
                    info: "Gives a player VIP status for a set amount of days."
                },
                {
                    name: "rtable",
                    admin: 8,
                    arguments: [],
                    info: "Spawns in a roulette table."
                },
                {
                    name: "delrtable",
                    admin: 8,
                    arguments: ["tableId"],
                    info: "Deletes a roulette table by id."
                },
            ],
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
                    name: "melow",
                    arguments: ["message"],
                    info: "Displays a /melow roleplay message to players within proximity."
                },
                {
                    name: "do",
                    arguments: ["message"],
                    info: "Displays a /do roleplay message to players within proximity."
                },
                {
                    name: "dolow",
                    arguments: ["message"],
                    info: "Displays a /dolow roleplay message to players within proximity."
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
                    name: "vlow",
                    arguments: ["message"],
                    info: "Sends a message to occupants of a players vehicle."
                },
                {
                    name: "whisper or /w",
                    arguments: ["nameOrId", "message"],
                    info: "Whispers to another player within proximity."
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
                },
                {
                    name: "logout",
                    arguments: [],
                    info: "Logs you out."
                },
                {
                    name: "longdo",
                    arguments: ["nameOrId", "message"],
                    info: "Sends a long do statement to the given player."
                },
                {
                    name: "licenses",
                    arguments: [],
                    info: "Shows you all your licenses."
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