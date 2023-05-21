<template>
    <div class="overlay" v-if="revele"></div>

    <div class="bloc-modale" v-if="revele">
        <div v-if="state=== 'initGame'" class="container">

            <!--Boutons de choix des paramètres de la partie-->
            <div class="alldiv row">
                <label for="username">Nom : <p v-if="testsaisie" style="color:red"> non valide </p></label>
                <input type="text" id="username" v-model="player.username" placeholder="your username"/>

            </div>
            <div>
                <div class="alldiv row">
                    <label for="nbPlayersInput">Nombre de joueurs : </label>
                    <div>
                        <div>
                            <input class="demo1" type="radio" v-model="game.nb_Players" id="twoPlayers"
                                   name="twoPlayers" :value="parseInt(2)" checked>
                            <label for="twoPlayers"> 2 joueurs </label>
                        </div>
                        <div>
                            <input class="demo1" type="radio" v-model="game.nb_Players" id="threePlayers"
                                   name="threePlayers" :value="parseInt(3)">
                            <label for="threePlayers"> 3 joueurs </label>
                        </div>
                        <div>
                            <input class="demo1" type="radio" v-model="game.nb_Players" id="fourPlayers"
                                   name="fourPlayers" :value="parseInt(4)">
                            <label for="fourPlayers"> 4 joueurs </label>
                        </div>

                    </div>
                </div>
            </div>
            <div class="alldiv row">
                <label for="nbSquares">Nombre de cellules : </label>
                <div>
                    <div>
                        <input class="demo1" type="radio" v-model="game.nb_Squares" id="septCells" name="septCells"
                               :value="parseInt(7)">
                        <label for="septCells"> 7 cellules </label>
                    </div>
                    <div>
                        <input class="demo1" type="radio" v-model="game.nb_Squares" id="nineCells" name="nineCells"
                               :value="parseInt(9)">
                        <label for="nineCells"> 9 cellules </label>
                    </div>
                    <div>
                        <input class="demo1" type="radio" v-model="game.nb_Squares" id="elevenCells" name="elevenCells"
                               :value="parseInt(11)">
                        <label for="elevenCells"> 11 cellules </label>
                    </div>
                    <div>
                        <input class="demo1" type="radio" v-model="game.nb_Squares" id="treizeCells" name="treizeCells"
                               :value="parseInt(13)">
                        <label for="treizeCells"> 13 cellules </label>
                    </div>
                </div>
            </div>
            <div class="alldiv row">
                <label for="nbWallsInput">Nombre de barrières :</label>
                <div>
                    <input v-model.number="game.nb_Walls" type="range" id="nbWalls" name="nbWalls" :min="parseInt(3)"
                           :max="parseInt(10)" class="custom-range">
                    <p style="text-align: center">{{ game.nb_Walls }}</p>
                </div>
            </div>
            <button class="myBtn" @click="createRoom">Creer la partie</button>
        </div>

        <!--Fermer la modale-->
        <button v-on:click="toggleModale" class="myClose" v-if="state=== 'initGame'">X</button>

        <!--Cloturer la room si le joueur quitte-->
        <button v-on:click="toggleModale" @click="deserter" class="myClose " v-if="state=== 'wait'">Quitter</button>

        <!--Liste des joueur en attente dans le salon-->
        <ListeUserComponent v-if="state=== 'wait'" :roomID="player.roomId" :socket="socket"/>
    </div>


</template>

<script>
import {Player} from '@/models/Player';
import {Game} from '@/models/Game';
import ListeUserComponent from './ListeUserComponent.vue';

export default {
    props: ['revele', 'toggleModale', 'socket'],
    data() {
        return {
            player: new Player(),
            game: new Game(),
            state: 'initGame',
            testsaisie: false
        }
    },
    components: {
        ListeUserComponent,
    },
    mounted() {
        this.$watch("state", (newValue) => {
            if (newValue === "wait") {
                this.socket.off("room id");
            }
        })
    },
    methods: {
        createRoom() {

            //Ajoute le joueur à la partie si les conditions sont vérifiées et initialise ses attributs
            if (this.testerTexte(this.player.username)) {
                this.testsaisie = false;
                this.game.new_nb_Walls = this.game.nb_Walls;
                this.player.barLeft = this.game.nb_Walls;
                // J'initialise les paramètres du joueur Hote de la partie
                this.player.isHost(this.socket.id)
                // J'envoie au serveur le joueur pour l'ajouter au salon
                this.socket.emit('playerData', this.player, this.game);

                // Permet d'émettre au composant "parent" les information concernant le salon
                this.socket.on('room id', (roomId) => {
                    this.player.roomId = roomId;
                    this.state = 'wait';
                    this.$emit('event-roomId', {roomId: roomId, player: this.player, game: this.game});

                });
            } else {
                this.testsaisie = true;
            }
        },

        //Si le joueur quitte la partie
        deserter() {
            this.socket.emit('deserter', this.player)
            this.state = 'initGame';
            this.player = new Player();
        },
        //   Test si nom du joueur est valide
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

    input[type="radio"].demo1 {
        display: none;
    }

    input[type="radio"].demo1 + label {
        padding: 0.3rem 0.5rem;
        border: 1px dashed #333363;
    }

    input[type="radio"].demo1:checked + label {
        border: 1px solid #0b5ed7;
        background: #333363;
    }


    .container {
        display: flex;
        flex-direction: column;
        gap: 2vh;
        padding: 2vh;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .alldiv {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        list-style: none;
        margin: 1vh;
    }


    .row {
        /*font-size: 1vw;*/
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        gap: 2vh;
        list-style: none;
    }

    .row div {
        list-style: none;
        padding: 0;
    }

    .row p {
        width: 80%;
    }

    input[type=text] {
        width: 80%;
        background: #333363;
        color: cornflowerblue;
    }


    input[type=range] {
        width: 80%;
        height: 2.5vh;
        border-radius: 5px;
        -webkit-appearance: none;
        background: #333363;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 2vh;
        height: 3.5vh;
        border-radius: 5px;
        background: #0b5ed7;
        cursor: pointer;
        position: relative;
    }

    .myBtn {
        /*font-size: 1vw;*/
        cursor: pointer;
        /*font-size: 3em;*/
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
  