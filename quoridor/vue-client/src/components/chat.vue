<template>
    <div class="chat__layer">
        <!--    <div class="information">-->
        <!--      <form v-if="!joined" @submit.prevent="onSubmit">-->
        <!--        <label for="">Username</label>-->
        <!--        <input type="text" class="form-control" v-model="username" />-->
        <!--        <button type="submit" class="btn btn-primary mt-3">Envoyer</button>-->
        <!--      </form>-->
        <!--    </div>-->
        <div class="container">
            <div>
                <h2 id="chatty">chatbox</h2>
                <!--        <button class="future_modal">📨</button>-->
            </div>
            <div ref="messages" id="messages">
                <div id="emoji_list"></div>
                <div
                        v-for="message in messages"
                        :key="message.id"
                        :class="{
                'message-from-me': message.socketId === socket.id,
                'message-from-others': message.socketId !== socket.id
              }"
                >
                    <div v-if="message.user !== username">
            <span class="user"
            >{{ message.user }}</span
            >
                    </div>
                    <div>
                        <p class="contenu">{{ message.text }}</p>
                        <p class="heure">{{
                            new Date(message.id).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            }}</p>
                    </div>
                </div>
            </div>
            <!-- fin du div du milieu -->
            <!-- =================== -->
            <!-- div du bas -->
            <div>
                <input
                        v-model="text"
                        placeholder="..."
                        class="text-message"
                        v-on:keyup.enter="sendMessage"
                        v-on:keyup="onTyping"
                />
            </div>
            <!--      <div id="typing-indicator"></div>-->
        </div>
    </div>
</template>

<script>
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.css";

export default {
    props: ['username', 'socket', 'roomId'],
    data() {
        return {
            text: "",
            messages: [],
            isTyping: false,
            timeout: null
        };
    },
    created() {
        this.onSubmit();
    },
    methods: {
        onSubmit() {
            // this.socket.emit('game', this.roomId );
            this.socket.on("message recu", (data) => {


                this.timedif = this.time !== new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                this.messages = [...this.messages, data];
            });
            this.socket.on("typing", (data) => {
                const typingUser = data.username;
                if (typingUser !== this.username) {
                    document.getElementById(
                        "typing-indicator"
                    ).innerHTML = `${typingUser} est en train d'écrire`;
                }
            });
            this.socket.on("stop typing", () => {
                this.socket.emit("stop typing", {
                    username: this.username,
                }, this.roomId);
                document.getElementById("typing-indicator").innerHTML = "";
            });
        },
        scrollToBottom() {
            this.$nextTick(() => {
                if (this.$refs.messages) {
                    this.$refs.messages.scrollToBottom = this.$refs.messages.scrollHeight;
                }
            });
        },
        onTyping() {
            this.isTyping = false;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.isTyping = true;
                this.socket.emit("typing", {
                    username: this.username,
                }, this.roomId);
            }, 500);
        },

        sendMessage() {
            this.isTyping = false;
            const message = {
                id: new Date().getTime(),
                text: this.text,
                user: this.username,
                socketId: this.socket.id,
            };

            this.messages = [...this.messages, message];
            this.text = "";
            this.socket.emit("message", message, this.roomId);
            this.scrollToBottom();
        },
    },

    watch() {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
    },
};
</script>

<!-- =========================================================== -->

<!-- ========= du css pour la visibilité ============= -->
<!-- =========================================================== -->
<style scoped>

@media (min-width: 1024px) {

    .text-message {
        width: 100%;
        outline: none;
        border: solid 1px lightskyblue;
        border-radius: 1vh;
        bottom: 3.3%;
        box-sizing: border-box;
    }

    input {
        color: white;
        background: #333363;
    }

    input::placeholder {
        padding-left: 8px;
        color: white;
    }


    .message-from-me {
        padding: 5px;
        width: 70%;
        border-radius: 7px;
        word-wrap: break-word;
        border: 1px solid #0b5ed7;
        background-color: #333363;
        font-size: 1vh;
        margin-right: 0;
        margin-left: auto;
        margin-bottom: 1vh;
    }

    .user {
        color: cornflowerblue;
    }

    .contenu {
        font-family: "Press Start 2P", cursive;
        font-style: italic;
        margin: 0;
        padding: 0;
    }

    .heure {
        font-family: "Press Start 2P", cursive;
        font-style: italic;
        margin: 0;
        padding: 0;
        font-size: 0.5vh;
        color: cornflowerblue;
    }

    /*.message-from-me div p {*/
    /*  border: 1px solid #0b5ed7;*/
    /*  background-color: #333363;*/
    /*  max-width: 100%;*/
    /*  word-wrap: break-word !important;*/
    /*  padding: 0.5rem;*/
    /*}*/
    /*.message-from-me div span {*/
    /*  margin-right: 0;*/
    /*  max-width: 100%;*/
    /*}*/
    .message-from-others {
        padding: 5px;
        width: 70%;
        border-radius: 7px;
        word-wrap: break-word;
        border: 1px solid #B85BF1;
        background-color: rgba(121, 15, 194, 0.2);
        font-size: 1vh;
        margin-left: 0;
        margin-right: auto;
        margin-bottom: 1vh;
    }


    /*.message-from-others div p {*/
    /*  border: 1px solid #0b5ed7;*/
    /*  background-color: #333363;*/
    /*  max-width: 100%;*/
    /*  word-wrap: break-word !important;*/
    /*  padding: 0.5rem;*/
    /*}*/
    /*.message-from-others div span {*/
    /*  padding: 0.5rem;*/
    /*  !*background: #80804c;*!*/
    /*  align-self: flex-end;*/
    /*  max-width: 100%;*/
    /*  !*border-radius: 50%;*!*/
    /*  word-wrap: break-word !important;*/
    /*}*/
    .message__user__time {
        /*background-color: yellow;*/
    }

    #typing-indicator {
        /*font-size: 0.8rem;*/
        color: black;
        background-color: aquamarine;
        margin-top: 10px;
    }

    /* style du div ou du container  */
    .chat__layer {
        display: flex;
        flex-direction: column;
        width: 95%;
        height: 80%;
        background-color: #0B0B0B;
        /*height: 90vh;*/
        color: white;
        border: 2px solid #217BFF;
        border-radius: 10px;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
    }

    /* div information pour s'aasurer que quelqu'un est connecté et récuperer ses informations pour la connection ce dernier a été stylé avec bootstrap */
    /* le content mais nommer container
   */
    .container {
        font-family: 'Press Start 2P', cursive;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 90vh;
        overflow: auto;
    }

    /* div du haut  */
    .container > div:first-child {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 1vh;
        border-bottom: 2px solid #0c63e4;
    }

    .container > div:first-child #chatty {
        margin: auto;
        /*font-family: "Press Start 2P", sans-serif;*/
        font-size: 1.5vw;
    }

    /* div du milieu */
    .container > div:nth-child(2) {
        display: flex;
        max-height: fit-content;
        flex-direction: column;
        padding: 10px;
        flex: 1;
        overflow-y: auto;
    }

    /* div du bas  */
    .container > div:last-child {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 1vh;
        border-top: 2px solid #0c63e4;
    }
}
</style>
