<template>
    <div v-if="chatState">
        <div id="chat" v-if="showChat">
            <ul id="chat_messages">
                <li v-for="(item, message) in chatMessages" :key="'B' + message" v-html="item.toString()">
                </li>
            </ul>
            <input v-show="showInput" v-model="inputText" ref="input" id="chat_msg" type="text" />
    <li v-for="(item, cmd) in queryCmds" :key="'B' + cmd" class="suggestionDropDown">
        <ul class="itemSel" v-html="item"></ul>
    </li>
    </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            showInput: false,
            showChat: true,
            chatMessages: [],
            inputText: "",
            active: true,
            lastMsg: "",
            playerMessages: [],
            countPos: 0,
            queryCmds: []
        };
    },
    computed: {
        ...mapGetters({
            chatState: "getChatStatus"
        })
    },
    methods: {
        addKeyListener(e) {
            const KEY_T = 84;
            const KEY_ENTER = 13;

            if (!this.chatState) return;

            if (this.$router.currentRoute.path != "/") return;

            if (e.keyCode == KEY_T && this.inputText.length == 0) {
                this.enableChatInput(true);
                return true;
            }


            if (e.keyCode == KEY_ENTER) {
                let text = this.inputText;
                this.enableChatInput(false);

                if (text.charAt(0) !== "/") {
                    if (window.mp) {
                        window.mp.invoke("chatMessage", text);
                    }
                    return;
                }

                text = text.substr(1);

                if (text.length) {
                    if (window.mp) {
                        window.mp.invoke("command", text);
                    }
                }

                this.inputText = "";
            }

        },
        push(text) {
            this.chatMessages.unshift(text);
        },
        enableChatInput(enable) {
            this.inputText = "";

            if (!this.active && enable) {
                return;
            }

            if (enable !== this.showInput && window.mp) {
                this.$nextTick().then(() => this.$refs.input.focus());
                window.mp.invoke("focus", enable);
                window.mp.invoke("setTypingInChatState", enable);
                this.showInput = enable;
                this.inputText = "";
            }
        },
        hide() {
            this.showChat = false;
            console.log(this.showChat);
        },
        show() {
            this.showChat = true;
            console.log(this.showChat);
        },
        setCaretPosition(ctrl, pos) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        }
    },
    created() {
        if (window.mp) {
            const api = {
                "chat:push": this.push,
                "chat:clear": this.clear,
                "chat:activate": this.activate,
                //"chat:show": this.show,
                "msg:send": this.push
            };

            for (const fn in api) {
                if (window.mp) {
                    window.mp.events.add(fn, api[fn]);
                }
            }

        }
    },
    mounted() {
        console.log(this.chatState);
        document.addEventListener("keydown", this.addKeyListener);
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

        #chat ul#chat_messages > li {
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