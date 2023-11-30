<template>
    <main>
        <div class="fixed inset-0 z-10 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52 border rounded-lg border-gray-400">
                <div class="relative bg-[#0b0b0b]/70 w-full h-fit py-4 rounded-lg border border-gray-900 shadow-2xl shadow-black p-4 ">
                    <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500"><i class="fa-solid fa-shield text-red-400"></i> You are banned.</h1>

                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Account</span>
                            <span class="absolute right-0 top-0">{{ banData.username }}</span>
                        </div>
                    </div>

                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Social Club</span>
                            <span class="absolute right-0 top-0">{{ banData.social_club_name }}</span>
                        </div>
                    </div>

                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-computer pr-2"></i>IP Address</span>
                            <span class="absolute right-0 top-0">{{replaceWithAsterisk(String(banData.ip_address))}}</span>
                        </div>
                    </div>

                    <div v-if="banData.lift_unix_time == -1" class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-calendar-days pr-2"></i>Expires in</span>
                            <span class="absolute right-0 top-0 text-red-500">Ban is permanent</span>
                        </div>
                    </div>
                    <div v-else class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-calendar-days pr-2"></i>Expires in</span>
                            <span class="absolute right-0 top-0">{{unixToDays(banData.lift_unix_time)}}</span>
                        </div>
                    </div>

                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-calendar-days pr-2"></i>Issued on</span>
                            <span class="absolute right-0 top-0">{{unixToDays(banData.issue_unix_date)}}</span>
                        </div>
                    </div>

                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-shield pr-2"></i>Administrator</span>
                            <span class="absolute right-0 top-0">{{banData.admin}}</span>
                        </div>
                    </div>


                    <div class="font-medium text-medium">
                        <div class="relative w-full mt-4">
                            <span class="left-0 top-0 "><i class="fa-solid fa-book pr-2"></i>Reason</span>
                            <span class="absolute right-0 top-0 max-w-sm h-6 overflow-hidden text-ellipsis">{{ banData.ban_reason }}</span>
                        </div>
                    </div>

                </div>
                </div>
            </div>
        </main>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapGetters({
                banData: "getBanData"
            })
        },
        methods: {
            replaceWithAsterisk: function (str) {
                let indices = [];
                for (let i = 5; i < str.length; i++) {
                    if (!str[i].includes(".")) {
                        indices.push(i);
                    }
                }
                let res = "";
                res = indices
                    .reduce((acc, val) => {
                        acc[val] = "*";
                        return acc;
                    }, str.split(""))
                    .join("");
                return res;
            },
            unixToDays(unix) {
                let date = new Date(unix * 1000);

                return date.toUTCString();
            }
        }
    }
</script>