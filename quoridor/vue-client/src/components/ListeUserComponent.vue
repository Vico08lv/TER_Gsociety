<template>

    <div class="listeUser">
        <h1>Joueurs en attente</h1>
        <div class="spinner-border"></div>
        <ul id="user-list">
            <li v-for="player in players" :key="player.username">{{ player.username }}</li>
        </ul>
    </div>

</template>

<script>

export default {
    props: {
        socket: {
            required: true
        },
        roomID: undefined
    },
    data() {
        return {
            players: []
        }
    },
    mounted() {
        // Envoyer une demande de mise à jour de la liste des rooms au serveur
        if (this.roomID) {

            this.socket.emit('get users', this.roomID);

            this.socket.on('list users', (player) => {
                // Mettre à jour les données des rooms
                this.players = player;


            });
        }


    }
}
</script>

<style scoped>
@media (min-width: 1024px) {
    .listeUser {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .listeUser h1 {
        font-size: 1.5vw;
        padding: 5vh;
        position: absolute;
        top: 0;
    }

    .spinner-border {
    }

    #user-list li {
        font-size: 1vw;
        margin-top: 5vh;
        list-style: none;
    }

}

</style>