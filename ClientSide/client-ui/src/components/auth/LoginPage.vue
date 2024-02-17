<template>
    <main class="w-full">
        <div v-if="uiStates.serverLoading" class="bg-black/70 w-full h-screen flex justify-center">
            <svg class="h-20 w-20 animate-spin text-gray-500 fill-black/30 mt-[20%]" viewBox="0 0 100 101" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
            </svg>
        </div>

        <body v-if="!uiStates.serverLoading">

            <div v-if="uiStates.authenticationState == 'charSelect'"
                class="fixed inset-0 w-full text-white text-lg duration-300 font-medium">
                <div class="duration-300 container flex items-center max-w-lg mx-auto mt-14 absolute left-10">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none duration-300">
                            <div class="border-b-2 border-gray-400 p-3">
                                <i class="fa-solid fa-shield absolute mt-1.5 text-gray-400"></i>
                                <h1 class="flex justify-start text-xl font-bold ml-8">Account</h1>
                            </div>

                            <div class="p-5 pb-8 text-lg">
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Name</span>
                                    <span class="absolute right-0 top-0">{{ characters.player_account_info.username
                                    }}</span>
                                </div>

                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Email</span>
                                    <span class="absolute right-0 top-0">{{
                                        characters.player_account_info.email_address }}</span>
                                </div>

                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 ">
                                        <i class="fa-solid fa-person absolute mt-1.5"></i>
                                        <i class="fa-solid fa-person-dress absolute mt-1.5 ml-3"></i>
                                        <font class="ml-8">Character Slots</font>
                                    </span>
                                    <span class="absolute right-0 top-0">{{
                                        characters.player_account_info.max_characters }}</span>
                                </div>

                                <div v-if="characters.player_account_info.admin_status > 0" class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-shield pr-2"></i>Admin Rank</span>
                                    <span class="absolute right-0 top-0 font-bold"
                                        :style="getStaffData(characters.player_account_info.admin_status).style">{{
                                            getStaffData(characters.player_account_info.admin_status).rank
                                        }}</span>
                                </div>

                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-right-to-bracket pr-2"></i>Auto
                                        Login</span>
                                    <span class="absolute right-0 top-0">
                                        <button :disabled="loadingState" @click="toggleAutoLogin"
                                            class="bg-green-500/50 p-2 rounded-lg duration-300 hover:bg-green-500/20"
                                            v-if="characters.player_account_info.auto_login == 1">Enabled</button>
                                        <button :disabled="loadingState" @click="toggleAutoLogin"
                                            class="bg-red-500/50 p-2 rounded-lg duration-300 hover:bg-red-500/20"
                                            v-else>Disabled</button>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="fixed inset-0 w-full text-white text-lg duration-300 font-medium">
                <div class="duration-300 container flex items-center max-w-3xl mx-auto" :class="baseStyle">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none duration-300">

                            <div class="text-2xl">
                                <div class="p-4 relative h-14">

                                    <div class="absolute left-10 duration-300">
                                        <span v-if="!characterSelectionState">
                                            <i class="fa-solid fa-shield text-2xl absolute text-gray-400"></i>
                                            <h1 class="flex justify-start font-bold ml-10">Authentication</h1>
                                        </span>
                                        <span v-else>
                                            <i class="fa-solid fa-person absolute mt-1.5 text-gray-400"></i>
                                            <i class="fa-solid fa-person-dress absolute mt-1.5 ml-3 text-gray-400"></i>
                                            <h1 class="flex justify-start text-xl font-bold ml-8">Character Selection</h1>
                                        </span>
                                    </div>

                                    <button @click="createCharacter" v-if="uiStates.authenticationState == 'charSelect'"
                                        class="absolute right-10 font-medium hover:text-green-500 duration-300">
                                        Add new character <i class="fa-solid fa-plus"></i>
                                    </button>
                                </div>

                            </div>

                            <div v-if="uiStates.authenticationState == ''" class="p-8">
                                <label class="block">
                                    <span class="font-medium">Enter your username or email</span>
                                    <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                        <i class="fa-solid fa-user absolute pt-3 pl-3 h-11 text-gray-400"></i>
                                        <input v-model="username" type="text" maxlength="70"
                                            class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>
                                <label class="block mt-3">
                                    <span class="font-medium">Enter your password</span>
                                    <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                        <i
                                            class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                        <input v-model="password" type="password" maxlength="70"
                                            class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <div>
                                    <button @click="uiStates.authenticationState = 'passwordReset'"
                                        class="font-medium text-sm mt-3 text-gray-300">Forgot your password?
                                        {{ uiStates.authenticationState }}</button>
                                </div>

                                <label class="mt-4 relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" class="sr-only peer" v-model="rememberMe">
                                    <div
                                        class="w-11 h-6 rounded-full peer bg-black/20 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 border border-gray-600">
                                    </div>
                                    <span class="ms-3 text-sm font-medium text-white">Remember me</span>
                                </label>

                                <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                    <button @click="uiStates.authenticationState = 'register'"
                                        class="w-full rounded-l-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20"><i
                                            class="fa-solid fa-book text-gray-400" type="button"></i> Register
                                    </button>

                                    <button :disabled="loadingState" @click="login(true)"
                                        class="w-full rounded-r-xl p-3 bg-gradient-to-l from-black/30 to-black/40 duration-300 hover:bg-black/20"
                                        :class="loadingState ? 'hover:border-red-400' : 'hover:border-gray-400'">
                                        <LoadingSpinner v-if="loadingState" />
                                        <span v-else>
                                            Login <i class="fa-solid fa-right-to-bracket text-gray-400"></i>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div v-if="uiStates.authenticationState == 'charSelect'"
                                class="p-3 max-h-[55rem] overflow-x-hidden">

                                <div v-if="characters.player_characters.length == 0"
                                    class="font-medium flex justify-center text-lg mt-4 pb-4 text-gray-300">
                                    You don't have any characters. Create a new one to get started.
                                </div>

                                <div v-for="(item, i) in characters.player_characters" :key="i">

                                    <div class="p-6 font-medium border rounded-3xl border-gray-500 mt-6 shadow-2xl">

                                        <div v-if="item.character_isbanned"
                                            class="flex justify-center bg-red-500/40 p-3 rounded-lg shadow-xl shadow-red-500/10">
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
                                                <td class="max-w-[5vw] overflow-hidden text-ellipsis">{{
                                                    item.character_name?.replace("_", " ") }}</td>
                                                <td>{{ item.character_health }}</td>
                                                <td>{{ formatDate(item.last_login) }}</td>
                                                <td>{{ item.player_exp.toLocaleString("en-US") }}</td>
                                            </tr>
                                        </table>
                                        <table class="w-full border-separate [border-spacing:0.75rem] border-b">
                                            <tr class="text-center">
                                                <td><i class="fa-solid fa-money-bill pr-2 "></i>Money</td>
                                                <td><i class="fa-solid fa-clock pr-2"></i>Time played</td>
                                                <td><i class="fa-solid fa-calendar-days pr-2"></i>Faction</td>
                                                <td><i class="fa-solid fa-calendar-days pr-2"></i>Created At </td>
                                            </tr>
                                            <tr class="text-center">
                                                <td class="text-green-500">${{ item.money_amount.toLocaleString("en-US") }}
                                                </td>
                                                <td>{{ (item.play_time_seconds / 60).toFixed(0) > 60 ?
                                                    ((item.play_time_seconds
                                                        / 60).toFixed(0) / 60).toFixed(2) + " hour(s)" : (item.play_time_seconds
                                                            /
                                                            60).toFixed(0) + " minute(s)" }}</td>
                                                <td class="max-w-[4vw] overflow-hidden text-ellipsis">none</td>
                                                <td>{{ formatDate(item.CreatedDate) }}</td>
                                            </tr>
                                        </table>
                                        <button :disabled="item.character_isbanned == 1 || uiStates.serverLoading"
                                            @click="playCharacter(item.character_id)"
                                            class="border p-2 w-full mt-10 rounded-lg border-gray-500 duration-300"
                                            :class="item.character_isbanned == 1 ? 'hover:border-red-500' : 'hover:border-green-500'">
                                            <i v-if="item.character_isbanned == 1"
                                                class="fa-solid fa-xmark text-red-500"></i>
                                            <i v-else class="fa-solid fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>


                            <div v-if="uiStates.authenticationState == 'register'" class="p-8 duration-300">
                                <div>

                                    <label class="block">
                                        <span class="font-medium">Enter your username</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-user absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="30" v-model="registerUsername" type="text"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>

                                        </div>
                                    </label>

                                    <label class="block mt-3">
                                        <span class="font-medium">Enter your email</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-envelope absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="registerEmail" type="text"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>
                                    <label class="block mt-3">
                                        <span class="font-medium">Enter your password</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="registerPassword" type="password"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <label class="block mt-3">
                                        <span class="font-medium">Confirm your password</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="registerPasswordConfirm" type="password"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <div class="font-medium text-sm mt-3 text-gray-300">
                                        * By creating an account you agree to Cloud RP's terms of service and privacy
                                        policy.
                                    </div>

                                    <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                        <button @click="uiStates.authenticationState = ''"
                                            class="w-full rounded-l-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20">
                                            <i class="fa-solid fa-rotate-left text-gray-400"></i> Back
                                        </button>
                                        <button :disabled="loadingState" @click="sendRegisterDataToServer()"
                                            class="w-full rounded-r-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20"
                                            :class="loadingState ? 'hover:border-red-400' : 'hover:border-gray-400'">

                                            <LoadingSpinner v-if="loadingState" />
                                            <span v-else>
                                                Register <i class="fa-solid fa-book text-gray-400"></i>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="uiStates.authenticationState == 'otp'" class="p-8">
                                <div>
                                    <label class="block">
                                        <span class="font-medium">Enter the OTP sent to your email address</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="20" v-model="otpPassword" type="text"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <div class="font-medium text-sm mt-3 text-gray-300">
                                        * By creating an account you agree to Cloud RP's terms of service and privacy
                                        policy.
                                    </div>

                                    <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                        <button @click="register()"
                                            class="w-full rounded-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20">Register
                                            <i class="fa-solid fa-book text-gray-400"></i></button>
                                    </div>
                                </div>
                            </div>


                            <div v-if="uiStates.authenticationState == 'passwordReset'" class="p-8">
                                <div>
                                    <label class="block">
                                        <span class="font-medium">Enter your email</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-envelope absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="resetEmail" type="text"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                        <button @click="uiStates.authenticationState = ''"
                                            class="w-full rounded-l-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20">
                                            <i class="fa-solid fa-rotate-left text-gray-400"></i> Back
                                        </button>
                                        <button :disabled="loadingState" @click="resetPasswordAuth()"
                                            class="w-full rounded-r-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20"
                                            :class="loadingState ? 'hover:border-red-400' : 'hover:border-gray-400'">

                                            <LoadingSpinner v-if="loadingState" />
                                            <span v-else>
                                                Reset Password <i class="fa-solid fa-lock text-gray-400"></i>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="uiStates.authenticationState == 'resettingPassword'" class="p-8">
                                <div>
                                    <label class="block">
                                        <span class="font-medium">Enter your OTP Code</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="20" v-model="passResetOtp" type="text"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <label class="block mt-3">
                                        <span class="font-medium">Enter your new Password</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="passResetPass" type="password"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <label class="block mt-3">
                                        <span class="font-medium">Confirm your new Password</span>
                                        <div class="mt-2 rounded-lg">
                                            <div class="mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                                <i
                                                    class="fa-solid fa-lock absolute pt-3 pl-3 h-11 border-gray-400 text-gray-400"></i>
                                                <input maxlength="70" v-model="passResetPassConfirm" type="password"
                                                    class="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                            </div>
                                        </div>
                                    </label>

                                    <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                        <button :disabled="loadingState" @click="resetPassword()"
                                            class="w-full rounded-xl p-3 bg-gradient-to-r from-black/30 to-black/40 duration-300 hover:bg-black/20 duration-300 hover:bg-black/20"
                                            :class="loadingState ? 'hover:border-red-400' : 'hover:border-gray-400'">

                                            <LoadingSpinner v-if="loadingState" />
                                            <span v-else>
                                                Reset <i class="fa-solid fa-lock text-gray-400"></i>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import { sendToServer } from '@/helpers';
import { getStaffRanks } from '@/helpers';

export default {
    data: function () {
        return {
            username: "",
            password: "",
            registerUsername: "",
            registerEmail: "",
            registerPassword: "",
            registerPasswordConfirm: "",
            rememberMe: false,
            characterName: "",
            showRegister: false,
            authState: "",
            otpPassword: "",
            passResetOtp: "",
            resetingPass: false,
            resetEmail: "",
            passResetEmail: "",
            passResetPass: "",
            passResetPassConfirm: ""
        };
    },
    components: {
        LoadingSpinner
    },
    computed: {
        ...mapGetters({
            characterSelectionState: 'getCharacterSelectionStatus',
            showOtp: 'getOtpState',
            loadingState: 'getLoadingState',
            characters: 'getPlayerInfo',
            uiStates: 'getUiStates'
        }),
        baseStyle() {
            let baseStyle = "mt-14";

            if (this.uiStates.authenticationState !== "charSelect") {
                baseStyle = "mt-52";
            }

            return baseStyle;
        }
    },
    created() {
        document.addEventListener("keydown", this.handleKeyDown);

        if (Object.keys(this.characters.auto_auth_data).length > 0) {
            this.rememberMe = true;

            this.username = this.characters.auto_auth_data.username;
            this.password = "**********";
        }
    },
    methods: {
        login(btn) {
            if (!btn) return;

            this.$store.state.uiStates.serverLoading = true;
            sendToServer('server:recieveAuthInfo', JSON.stringify(this.$data));
        },
        playCharacter(characterId) {
            if (this.characters.player_characters.length > 0) {
                this.$store.state.uiStates.serverLoading = true;

                sendToServer('server:recieveCharacterId', characterId);
            }
        },
        createCharacter() {
            sendToServer("server:setUserToCharacterCreation");
        },
        sendRegisterDataToServer() {
            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:recieveRegister", JSON.stringify({
                registerUsername: this.registerUsername,
                registerPassword: this.registerPassword,
                registerPasswordConfirm: this.registerPasswordConfirm,
                registerEmail: this.registerEmail
            }));
        },
        register() {
            if (!this.showRegister) return this.showRegister = true;
            sendToServer('server:authRecieveOtp', this.otpPassword);
        },
        resetPasswordAuth() {
            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:resetPasswordAuth", this.resetEmail);
        },
        resetPassword() {
            this.$store.state.uiStates.serverLoading = true;

            sendToServer('server:resetPassword', JSON.stringify({
                otpCode: this.passResetOtp,
                password: this.passResetPass,
                passwordConfirm: this.passResetPassConfirm
            }));

            this.password = this.passResetPass;
            this.username = this.resetEmail;
            this.resetEmail = "";

            this.passResetPass = "";
            this.passResetPassConfirm = "";
        },
        getStaffData(rankId) {
            let { adminRanksList, adminRanksStyles } = getStaffRanks();

            return {
                rank: adminRanksList[rankId],
                style: adminRanksStyles[rankId]
            };
        },
        toggleAutoLogin() {
            this.$store.state.uiStates.serverLoading = true;
            sendToServer("server:togglePlayerAutoLogin");
        },
        getCharacterData() {
            return this.$store.state.playerInfo.player_characters;
        },
        formatDate(dateString) {
            const dateTime = new Date(dateString);
            return dateTime.toLocaleDateString();
        },
        handleKeyDown(e) {
            if (e.keyCode !== 13) return;

            switch (this.uiStates.authenticationState) {
                case '':
                    {
                        this.login(true);
                        break;
                    }
                case 'register':
                    {
                        this.sendRegisterDataToServer();
                        break;
                    }
                case 'passwordReset':
                    {
                        this.resetPasswordAuth();
                        break;
                    }
                case 'resettingPassword':
                    {
                        this.resetPassword();
                        break;
                    }
                default: break;
            }

        }
    },
}
</script>