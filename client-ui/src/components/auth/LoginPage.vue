<template>

    <div class="flex justify-center mt-80">
        <div class="rounded-xl p-5 bg-gray-900 text-white w-96">
            <h1 class="flex justify-center text-lg">Login to Cloud</h1>

            <label class="block mt-6">
                Enter your username
                <div class="border-gray-700 border mt-2 p-2 rounded-lg">
                    <input v-model="username" placeholder="Username..." class="block w-full bg-transparent rounded-lg" />
                </div>
            </label>
            <label class="block mt-6">
                Enter your password
                <div class="border-gray-700 border mt-2 p-2 rounded-lg">
                    <input v-model="password" placeholder="Password..." class="block w-full rounded-lg bg-transparent" />
                </div>
            </label>

            <div class="flex justify-center mt-8">

                <button @click="login()" class="p-3 border w-full border-gray-700 rounded-lg">Login</button>

            </div>

            <div class="flex justify-center mt-3">

                <button class="p-3 border w-full border-gray-700 rounded-lg">Register</button>

            </div>


        </div>

</div>

</template>

<script>

    export default {
        data: function() {
            return {
                username: "",
                password: ""
            };
        },
        methods: {
            login() {
                if (window.mp) {
                    window.mp.trigger("client:sendAuthInfo", this.username, this.password);
                }
            }
        }
    }
</script>