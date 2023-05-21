<template>

    <div class="listeRoom">
        <h1>Salons disponibles</h1>
        <div class="mycontainer">
            <ul id="room-list">
                <li v-for="room in rooms" :key="room.id" class="room row">
                    <p>
                        <font-awesome-icon :icon="['fas', 'gamepad']"/>
                        {{ room.id }}
                    </p>
                    <p>
                        <font-awesome-icon :icon="['fas', 'user']"/>
                        {{ room.info.nb_Players }}
                    </p>
                    <p>
                        <font-awesome-icon :icon="['fas', 'th-large']"/>
                        {{ room.info.nb_Squares }}x{{ room.info.nb_Squares }}
                    </p>
                    <p>
                        <font-awesome-icon :icon="['fas', 'hand']"/>
                        {{ room.info.nb_Walls }}
                    </p>
                    <button @click="joinRoom(room)" class="myBtn">Join</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core'
import {faUser, faThLarge, faHand, faGamepad} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";


library.add(faUser, faThLarge, faHand, faGamepad)
export default {
    components: {FontAwesomeIcon},
    props: ["socket", "player"],
    data() {
        return {
            rooms: [],
            roomId: null,
            game: null
        }
    },
    created() {
        //obtenir la liste des rooms à la création du composant
        this.socket.emit('get rooms', (this.roomId));
        console.log(this.rooms)
        //mettre en place l'écouteur lorsque des parties sont créés/supprimées/lancées
        this.socket.on('list rooms', (room) => {
            this.rooms = room;
        });

    },
    methods: {

        //rejoindre une room
        joinRoom(room) {
            console.log(room.id)
            this.roomId = room.id;
            this.game = room.info;
            console.log("[List] : " + this.roomId);
            this.$emit('event-roomId', {roomId: this.roomId, state: "waitPlayers", game: room.info});

        }
    }
}
</script>
<style scoped>

@media (min-width: 1024px) {
    .listeRoom {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .listeRoom h1 {
        font-size: 1.5vw;
        padding: 5vh;
        position: absolute;
        top: 0;
    }

    .mycontainer {
        margin-top: 5vh;
        max-height: 70%;
        overflow: auto;
    }

    .room {
        width: 95%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0c63e4;
        margin-bottom: 2vh;
    }

    .row {
        font-size: 0.9vw;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 2vw;
        list-style: none;
        padding: 0;
        margin: 0 0 1vh;
    }

    .myBtn {
        font-size: 0.9vw;
        cursor: pointer;
        padding: 1vh 1vh;
        background: #0B0B0B;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
        width: 50%;
        height: 90%;
        margin: auto;
    }

    .myBtn:hover {
        background: #333363;
    }


    .room p {
        margin: auto;
    }

}
</style>