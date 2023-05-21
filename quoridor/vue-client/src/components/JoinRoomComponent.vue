<template>
    <div class="overlay" v-if="revele"></div>
    <div class="bloc-modale" v-if="revele">
        <button v-on:click="toggleModale" class="myClose" v-if="state!== 'waitPlayers'">X</button>
        <button v-on:click="toggleModale" @click="deserter" class="myClose" v-if="state=== 'waitPlayers'">Quitter
        </button>
        <div v-if="state=== 'setUsername'" class="user">
            <div>
                <label for="username">Nom : <p v-if="testsaisie" style="color:red"> non valide </p></label>
                <input type="text" id="username" v-model="player.username"/>
            </div>
            <button @click="validateName" class="myBtn">Rejoindre</button>
        </div>
        <ListeRoomComponent v-if="state=== 'setRoom'" :socket="socket" :player="player" @event-roomId="setRoomId"/>
        <ListeUserComponent v-if="state=== 'waitPlayers'" :roomID="player.roomId" :socket="socket"/>
    </div>
</template>

<script>

import {Player} from '@/models/Player';
import ListeRoomComponent from './ListeRoomComponent.vue';
import ListeUserComponent from './ListeUserComponent.vue';


export default {
    props: ['revele', 'toggleModale', 'socket'],
    data() {
        return {
            player: new Player(),
            state: "setUsername",
            game: null,
            testsaisie: false
        }
    },
    components: {
        ListeRoomComponent,
        ListeUserComponent
    },
    methods: {
        validateName() {

            if (this.testerTexte(this.player.username)) {// J'initialise les paramètres du joueur qui rejoint une partie
                this.player.socketId = this.socket.id;

                this.state = "setRoom";
                this.testsaisie = false
            } else {
                this.testsaisie = true;
            }
        },
        setRoomId(payload) {
            this.player.barLeft = payload.game.nb_Walls
            this.player.roomId = payload.roomId
            this.socket.emit('playerData', this.player);
            this.state = payload.state;
            this.game = payload.game

            this.$emit('event-roomId', {roomId: payload.roomId, player: this.player, game: this.game});

        },
        deserter() {
            this.socket.emit('deserter', this.player)
            this.state = 'setUsername'
            this.player = new Player();
        },
        testerTexte(texte) {
            // Vérifier si la chaîne est non vide
            if (texte.length === 0) {
                return false;
            }

            // Vérifier si la chaîne contient des caractères spéciaux
            var regex = /^[a-zA-Z0-9]+$/;
            if (!regex.test(texte)) {
                return false;
            }

            // La chaîne est valide
            return true;
        }
    }
}
</script>

<style scoped>
@media (min-width: 1024px) {
    .bloc-modale {
        position: fixed;
        top: 10%;
        bottom: 10%;
        left: 10%;
        right: 0;
        width: 80%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        flex-direction: column;
        color: #0c63e4;
        z-index: 999;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }


    input[type=text] {
        width: 80%;
        background: #333363;
        color: cornflowerblue;

    }


    .user {
        display: flex;
        flex-direction: column;
        gap: 60px;
        justify-content: center;
    }

    .myBtn {
        cursor: pointer;
        padding: 1vh 1vh;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
        width: 50%;
        margin: auto;
    }

    .myClose {
        font-size: 1vw;
        cursor: pointer;
        padding: 1vh 1vh;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
        margin-top: 1vh;
        margin-right: 1vh;
        position: absolute;
        top: 0;
        right: 0;
    }
}
</style>