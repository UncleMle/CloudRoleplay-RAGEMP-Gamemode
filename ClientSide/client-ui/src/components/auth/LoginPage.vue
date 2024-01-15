<template>
    <main>
        <div v-if="uiStates.authenticationState == 'charSelect'"
            class="fixed inset-0 w-full text-white text-lg duration-300">
            <div class="duration-300 container flex items-center max-w-3xl mx-auto absolute left-20 mt-20">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none duration-300">

                        <div class="border-b-2 border-gray-400 p-3">
                            <i class="fa-solid fa-shield absolute mt-1.5 text-gray-400"></i>
                            <h1 class="flex justify-start text-xl font-bold ml-8">Account</h1>
                        </div>
                        {{ characters.player_account_info }}

                    </div>

                </div>
            </div>
        </div>

        <div class="fixed inset-0 w-full text-white text-lg duration-300">
            <div class="duration-300 container flex items-center max-w-3xl mx-auto" :class="baseStyle">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none duration-300">

                        <div class="border-b-2 border-gray-400">
                            <div class="p-4 relative h-14">

                                <div class="absolute left-10 duration-300">
                                    <span v-if="!characterSelectionState">
                                        <i class="fa-solid fa-shield absolute mt-1.5 text-gray-400"></i>
                                        <h1 class="flex justify-start text-xl font-bold ml-6">Authentication</h1>
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
                            <form>
                                <label class="block">
                                    <span class="font-medium">Enter username or email</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-user absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="username" type="text" placeholder="Username or email..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>
                                <label class="block mt-3">
                                    <span class="font-medium">Enter your password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="password" type="password" placeholder="Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
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
                                        class="w-full border-gray-500 border-2 rounded-l-xl p-3 duration-300 hover:border-gray-400"><i
                                            class="fa-solid fa-book text-gray-400"></i> Register</button>
                                    <button :disabled="loadingState" @click="login(true)"
                                        class="w-full border-2 border-gray-500 rounded-r-xl p-3 hover:border-gray-400 duration-300"
                                        :class="loadingState ? 'hover:border-red-400' : 'hover:border-gray-400'">
                                        <LoadingSpinner v-if="loadingState" />
                                        <span v-else>
                                            Login <i class="fa-solid fa-right-to-bracket text-gray-400"></i>
                                        </span>
                                    </button>
                                </div>

                            </form>
                        </div>
                        <div v-if="uiStates.authenticationState == 'charSelect'"
                            class="p-3 max-h-[55rem] overflow-x-hidden">

                            <div v-if="characters.player_characters.length == 0"
                                class="font-medium flex justify-center text-lg mt-4 pb-4 text-gray-300">
                                You don't have any characters. Create a new one to get started.
                            </div>

                            <div v-for="item in characters.player_characters" :key="item">

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
                                                item.character_name.replace("_", " ") }}</td>
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
                                            <td class="text-green-500">${{ item.money_amount.toLocaleString("en-US") }}</td>
                                            <td>{{ (item.play_time_seconds / 60).toFixed(0) > 60 ? ((item.play_time_seconds
                                                / 60).toFixed(0) / 60).toFixed(2) + " hour(s)" : (item.play_time_seconds /
                                                    60).toFixed(0) + " minute(s)" }}</td>
                                            <td class="max-w-[4vw] overflow-hidden text-ellipsis">none</td>
                                            <td>{{ formatDate(item.CreatedDate) }}</td>
                                        </tr>
                                    </table>
                                    <button :disabled="item.character_isbanned == 1"
                                        @click="playCharacter(item.character_name)"
                                        class="border p-2 w-full mt-10 rounded-lg border-gray-500 duration-300"
                                        :class="item.character_isbanned == 1 ? 'hover:border-red-500' : 'hover:border-green-500'">
                                        <i v-if="item.character_isbanned == 1" class="fa-solid fa-xmark text-red-500"></i>
                                        <i v-else class="fa-solid fa-play"></i>
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div v-if="uiStates.authenticationState == 'register'" class="p-8 duration-300">
                            <div>

                                <label class="block">
                                    <span class="font-medium">Enter your username</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-user absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="registerUsername" type="text" placeholder="Username..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <label class="block mt-3">
                                    <span class="font-medium">Enter your email</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-envelope absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="registerEmail" type="text" placeholder="Email..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>
                                <label class="block mt-3">
                                    <span class="font-medium">Enter your password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="registerPassword" type="password" placeholder="Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <label class="block mt-3">
                                    <span class="font-medium">Confirm your password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="registerPasswordConfirm" type="password"
                                            placeholder="Password confirmation..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <div class="font-medium text-sm mt-3 text-gray-300">
                                    * By creating an account you agree to Cloud RP's terms of service and privacy policy.
                                </div>

                                <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                    <button @click="uiStates.authenticationState = ''"
                                        class="w-full border-2 border-gray-500 rounded-l-xl p-3 hover:border-gray-400 duration-300">
                                        <i class="fa-solid fa-rotate-left text-gray-400"></i> Back
                                    </button>
                                    <button :disabled="loadingState" @click="sendRegisterDataToServer()"
                                        class="w-full border-gray-500 border-2 rounded-r-xl p-3 duration-300"
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
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="otpPassword" type="text" placeholder="One Time Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <div class="font-medium text-sm mt-3 text-gray-300">
                                    * By creating an account you agree to Cloud RP's terms of service and privacy policy.
                                </div>

                                <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                    <button @click="register()"
                                        class="w-full border-gray-500 border-2 rounded-xl p-3 duration-300 hover:border-green-400">Register
                                        <i class="fa-solid fa-book text-gray-400"></i></button>
                                </div>
                            </div>
                        </div>


                        <div v-if="uiStates.authenticationState == 'passwordReset'" class="p-8">
                            <div>
                                <label class="block">
                                    <span class="font-medium">Enter your email</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-envelope absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="resetEmail" type="text" placeholder="Email..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                    <button @click="uiStates.authenticationState = ''"
                                        class="w-full border-2 border-gray-500 rounded-l-xl p-3 hover:border-gray-400 duration-300">
                                        <i class="fa-solid fa-rotate-left text-gray-400"></i> Back
                                    </button>
                                    <button :disabled="loadingState" @click="resetPasswordAuth()"
                                        class="w-full border-gray-500 border-2 rounded-r-xl p-3 duration-300"
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
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="passResetOtp" type="text" placeholder="One Time Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <label class="block mt-3">
                                    <span class="font-medium">Enter your new Password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="passResetPass" type="password" placeholder="New Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <label class="block mt-3">
                                    <span class="font-medium">Confirm your new Password</span>
                                    <div class="border-gray-400 border mt-2 rounded-lg">
                                        <div>
                                            <i
                                                class="fa-solid fa-lock absolute pt-3 border-r p-3 h-11 border-gray-400 text-gray-400"></i>
                                        </div>
                                        <input v-model="passResetPassConfirm" type="password"
                                            placeholder="Confirm new Password..."
                                            class="ml-12 p-2 block w-full rounded-lg bg-transparent outline-none" />
                                    </div>
                                </label>

                                <div class="inline-flex w-full mt-4 space-x-10 font-medium">
                                    <button :disabled="loadingState" @click="resetPassword()"
                                        class="w-full border-gray-500 border-2 rounded-xl p-3 duration-300"
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
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import { sendToServer } from '@/helpers';

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
            let baseStyle = "";

            if (this.uiStates.authenticationState === "charSelect") {
                baseStyle += " absolute right-20";
            }

            if (this.characters.player_characters.length > 1) {
                baseStyle += " mt-20";
            } else {
                baseStyle += " mt-52";
            }

            return baseStyle;
        }
    },
    methods: {
        login(btn) {
            if (!btn) return;

            this.$store.state.uiStates.serverLoading = true;
            sendToServer('server:recieveAuthInfo', JSON.stringify(this.$data));
        },
        playCharacter(cname) {
            if (this.characters.player_characters.length > 0) {
                sendToServer('server:recieveCharacterName', cname);
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
        getCharacterData() {
            return this.$store.state.playerInfo.player_characters;
        },
        formatDate(dateString) {
            const dateTime = new Date(dateString);
            return dateTime.toLocaleDateString();
        }
    },
}
</script>