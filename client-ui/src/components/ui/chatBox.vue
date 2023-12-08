<template>
    <div v-if="getUiStates.chatEnabled">
        <div id="chat">
            <ul id="chat_messages">
                <li v-for="item in chatMessages" :key="'KY' + item" v-html="item.toString()">
                </li>
            </ul>
            <input v-if="inputFieldShowing" v-model="userText" ref="input" id="chat_msg" type="text" />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            userText: "",
            KEYBIND_T: 84,
            KEYBIND_ENTER: 13,
            KEYBIND_UPARR: 38,
            KEYBIND_DOWNARR: 40,
            inputFieldShowing: false,
            chatMessages: [],
            playerMessages: [],
            chatIteration: 0
        };
    },
    computed: {
        ...mapGetters({
            getUiStates: "getUiStates"
        })
    },
    watch: {
        inputFieldShowing(oldVal) {
            this.typingState(oldVal);
        }
    },
    methods: {
        keyDownListener(e) {
            if (this.$router.currentRoute.path != "/" || !this.getUiStates.chatEnabled) return;

            if (e.keyCode == this.KEYBIND_T && !this.inputFieldShowing) {
                this.inputFieldShowing = true;
                this.$nextTick().then(() => this.$refs.input.focus());
                e.preventDefault();
            }

            if (e.keyCode == this.KEYBIND_ENTER) {
                this.inputFieldShowing = false;
                let text = this.userText;

                if(text.length > 0) {
                    text.charAt(0) == "/" ? this.invokeCommand(text) : this.invokeChatMessage(text);
                    this.playerMessages.push(this.userText);
                    this.chatIteration = 0;
                    this.userText = "";
                }
            }

            if(e.keyCode == this.KEYBIND_UPARR && this.inputFieldShowing) {
                this.chatIteration > this.playerMessages.length - 1 ? this.chatIteration = 0 : 0;

                this.userText = this.playerMessages.slice().reverse()[this.chatIteration++];
            }

            if(e.keyCode == this.KEYBIND_DOWNARR && this.inputFieldShowing) {
                this.chatIteration < this.playerMessages.length - 1 ? this.chatIteration = 0 : 0;

                this.userText = this.playerMessages.slice().reverse()[this.chatIteration--];
            }
        },
        typingState(toggle) {
            if (window.mp) {
                window.mp.invoke("focus", toggle);
                window.mp.invoke("setTypingInChatState", toggle);
            }
        },
        invokeChatMessage(message) {
            if (window.mp) {
                window.mp.invoke("chatMessage", message);
            }
        },
        invokeCommand(command) {
            if (window.mp) {
                command = command.substr(1);
                window.mp.invoke("command", command);
            }
        },
        push(text) {
            this.chatMessages.unshift(text);
        },
    },
    created() {
        if (window.mp) {
            const api = {
                "chat:push": this.push,
                "msg:send": this.push
            };

            for (const fn in api) {
                if (window.mp) {
                    window.mp.events.add(fn, api[fn]);
                }
            }
        }

        document.addEventListener("keydown", this.keyDownListener);
    }
};
</script>


<style scoped>
*,
body,
html {
    opacity: 1;
    padding: 0;
    margin: 0;
    font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
    font-weight: 510;
    font-size: 16px;
    background-color: transparent;
    user-select: none;
    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Safari, Chrome, Opera, Samsung */
    -khtml-user-select: none;
    /* Konqueror HTML */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* Edge, IE */
    user-select: none;
    /* Modern browsers */
    outline: none;
}

#chat,
a,
body,
html {
    color: #fff;
}

body,
html {
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    -webkit-transition: all 0.4s;
    -webkit-user-select: none;
}

#chat {
    width: 800px;
    line-height: 24px;
    font-weight: 700;
    text-shadow: -33px -33px 2 #000, 33px -33px 2 #000, -33px 33px 2 #000, 33px 33px 2 #000;
    text-shadow: 0 0 5px #000000, 0 0 6px #000000;
    font-family: "Arial", sans-serif;
    font-size: 16px;
    margin-left: 15px;
}

@media screen and (min-height: 1080px) {
    #chat {
        font-size: 18px !important;
        font-weight: 700;
    }
}

#chat ul#chat_messages {
    height: 285px;
    margin-top: 1vh;
    transform: rotate(180deg);
    padding: 10px 20px;
    list-style-type: none;
    overflow: auto;
}

#chat ul#chat_messages>li {
    transform: rotate(-180deg);
}

#chat input#chat_msg {
    background-color: rgba(0, 0, 0, 0.425);
    color: white;
    outline: none;
    border-left: none;
    border-right: none;
    border-top: none;
    border-bottom: none;
    width: 800px;
    height: 3.12em;
    padding: 0 0.5em 0 0.5em;
    margin-top: 0.5em;
}

.suggestionDropDown {
    padding: 0 0.5em 0 0.5em;
    background-color: rgba(0, 0, 0, 0.425);
    color: rgb(169, 167, 167);
    border-left: solid rgb(121, 121, 121) 3px;
}
</style>