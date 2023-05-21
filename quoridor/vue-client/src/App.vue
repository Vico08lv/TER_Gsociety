<!--Composant de base-->
<template>
    <div :class="{'responsive-container': isResponsive}">
        <!--          Logo du jeu pour la page d'acceuil-->
        <div class="divImg">
            <img class="img1" src="./assets/quoridor_logo.gif" v-if="!playGame">
        </div>
        <!--          Boutons pour creer ou rejoindre une partie-->
        <div class="boutons">
            <div v-if="!playGame" v-on:click="toggleCreer" class="myBtn"> Creer</div>
            <div v-if="!playGame" v-on:click="toggleRejoindre" class="myBtn"> Rejoindre</div>
        </div>
        <!--          Modale pour creer une partie ou rejoindre une partie-->
        <NewRoomComponent v-if="!playGame" :socket="socket" @event-roomId="setRoomId" v-bind:revele="reveleCreer"
                          v-bind:toggleModale="toggleCreer"/>
        <JoinRoomComponent v-if="!playGame" :socket="socket" @event-roomId="setRoomId" v-bind:revele="reveleRejoindre"
                           v-bind:toggleModale="toggleRejoindre"/>
        <!--          Modale pour les règles et les crédits-->
        <regles v-bind:revele="reveleRegles" v-bind:toggleModale="toggleRegles"></regles>
        <credit v-bind:revele="reveleCredit" v-bind:toggleModale="toggleCredit"></credit>
        <!--         Logo du jeu quand la partie a commencé -->
        <div><img src="./assets/quoridor_logo.gif" v-if="playGame" style="width: 30%; margin: auto;display: flex"></div>
        <div>
            <!--                  Popup pour informer si victoire-->
            <div class="popupWin" v-if="showPopup && Object.keys(this.winner)[0]===this.player.socketId">
                <br>
                <p>Je suis le super champion</p>
            </div>
            <div class="popupLoose" v-if="showPopup && Object.keys(this.winner)[0]!==this.player.socketId">
                <br>
                <p>Le super champion est : </p>
                <p>{{ Object.values(this.winner)[0] }} </p>
            </div>
            <div class="popupLoose" v-if="myAlerte">
                <p>Un adversaire a quitté la partie. Fin du Game.</p>
            </div>
        </div>

        <div class="le-jeux">
            <div class="template">
                <!--                      Affichage du nombre de barrière-->
                <div class="one">
                    <infoBarriere v-if="playGame" :username="player.username" :nb_-walls="game.nb_Walls"
                                  :socket="socket" :myInitGame="myInitGame"
                                  :otherInitGame="otherInitGame"></infoBarriere>
                </div>

                <div class="two">
                    <div class="turning">
                        <!--                          Plateau de jeu qui contient les graphisme Konva-->
                        <PlateauComponent :largeur="taillemin" :socket="socket" :roomId="roomId" v-if="playGame"
                                          @event-turn="changeturn" :myTurn="myTurn" :color="color"
                                          :nbSquares="nbSquares" :nbBarriere="nbBarriere" :myInitGame="myInitGame"
                                          :otherInitGame="otherInitGame" :newPosition="newPosition"/>
                    </div>

                </div>
                <!--                      Messagerie-->
                <div class="three">
                    <chat :socket="socket" v-if="playGame" :username="player.username" :room-id="roomId"></chat>
                </div>
            </div>
        </div>
        <!--          Alerte si c'est ton tour -->
        <div v-if="playGame && myTurn" class="alertmyturn">
            <strong>A toi de jouer</strong>
        </div>
        <div v-if="playGame && !myTurn" class="alertnotmyturn">
            <strong>Ce n'est pas ton tour</strong>
        </div>
        <!--          Boutons pour les règles et credit-->
        <div class="game_rule">
            <div v-on:click="toggleRegles" class="myBtn">Regles</div>
            <div v-on:click="togglePlayback" class="myBtn">
                <font-awesome-icon :icon="['fas', 'play']"/>
                <font-awesome-icon :icon="['fas', 'pause']"/>
            </div>
        </div>

        <div class="credit">
            <div v-on:click="toggleCredit" class="myBtn">Credits</div>
        </div>

        <div>
            <audio ref="audioElement" loop autoplay>
                <source src="./assets/long_quoridor_loop_audio.mp3" type="audio/mpeg">
                Votre navigateur ne prend pas en charge l'élément audio.
            </audio>
        </div>

    </div>

</template>

<script>

import io from 'socket.io-client';
import NewRoomComponent from './components/NewRoomComponent.vue';
import JoinRoomComponent from './components/JoinRoomComponent.vue';
import ListeRoomComponent from './components/ListeRoomComponent.vue';
import ListeUserComponent from './components/ListeUserComponent.vue';
import PlateauComponent from './components/PlateauComponent.vue';
import Regles from './components/Regles.vue';
import Credit from './components/Credit.vue';
import chat from './components/chat.vue';
import infoBarriere from './components/infoBarriere.vue';
import {library} from '@fortawesome/fontawesome-svg-core'
import {faPlay, faPause} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

library.add(faPlay, faPause)


export default {
    data() {
        return {
            isResponsive: false,
            player: null,
            socket: io(),
            roomId: null,
            playGame: false,
            color: null,
            nbSquares: null,
            nbBarriere: null,
            myInitGame: null,
            otherInitGame: [],
            myTurn: false,
            start: false,
            newPosition: null,
            game: null,
            showPopup: false,
            winner: {},
            myAlerte: false,
            largeur: null,
            hauteur: null,
            taillemin: null,
            reveleCreer: false,
            reveleRejoindre: false,
            reveleRegles: false,
            reveleCredit: false

        }
    },
    components: {
        NewRoomComponent,
        JoinRoomComponent,
        ListeRoomComponent,
        ListeUserComponent,
        PlateauComponent,
        Regles,
        chat,
        infoBarriere, Credit,
        FontAwesomeIcon

    },
    mounted() {
        //     pour le design responsive
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        this.updateResponsiveState(mediaQuery);
        mediaQuery.addListener(this.updateResponsiveState);

        // recuperation taille pour initialiser le canvas
        this.largeurEcran()

        // ecouteur pour mettre a jour la taille du canvas
        window.addEventListener('resize', this.largeurEcran);

    },
    created() {

        // ecouteur du serveur pour le début de partie
        this.socket.on('start game', ({info, initGame}) => {

            this.$refs.audioElement.play()

            this.nbSquares = info.nb_Squares;
            this.nbBarriere = info.nb_Walls;
            this.start = true
            // Pour récuperer les informations pour initialiser le canvas
            this.socket.emit('game', this.roomId);
            initGame.forEach(element => {
                if (element.socketId === this.socket.id) {
                    this.myInitGame = element
                } else {
                    this.otherInitGame.push(element)
                }
            })
            this.playGame = true;
        });

        // ecouteur pour determiner a qui le tour
        this.socket.on("my turn", (turn) => {
            this.myTurn = turn
        })

        // Pour mettre a jour les coordonnée des pions qui ont été déplacés
        this.socket.on("change", (coord) => {
            this.newPosition = coord
        })

        // ecouteur quand il y a un gagnant pour fin de partie
        this.socket.on('winner', (socketId) => {
            this.socket.off("disconnect players");
            if (socketId === this.socket.id) { // j'ai gagné
                this.winner[socketId] = this.player.username
            } else {// un adversaire a gagné
                this.otherInitGame.forEach(o => {
                    if (o.socketId === socketId) {
                        this.winner[socketId] = o.username
                    }
                })
            }
            this.showPopup = true

            // chronometre avant de relancer une partie
            setTimeout(() => {
                this.$refs.audioElement.pause()
                this.showPopup = false;
                location.reload(true); // ok c'est un peu brutal mais c'est un prototype (mais c'est tres efficace)
            }, 10000);

        });


        // pour avoir les informations si un joueur quitte la partie
        this.socket.on('disconnect players', () => {
            this.myAlerte = true

            // alert("Un adversaire a quitté la partie. Fin du Game.")
            setTimeout(() => {
                this.$refs.audioElement.pause()
                location.reload(true);
            }, 5000);

        })


    },
    methods: {

        largeurEcran() {// pour evaluer la meilleur dimention du canvas
            var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            this.hauteur = viewportHeight * 0.75;
            this.largeur = viewportWidth * 0.5;
            this.taillemin = Math.min(this.largeur, this.hauteur)
        },
        updateResponsiveState(mediaQuery) { // responsive design
            this.isResponsive = mediaQuery.matches;
        },
        setRoomId(payload) {// ecouter d'évenement en provenant des elements enfant
            this.player = payload.player;
            this.roomId = payload.roomId
            this.game = payload.game;
        },
        changeturn(payload) {// ecouter d'évenement en provenant des elements enfant
            this.myTurn = payload.myTurn
            this.socket.emit('coord', this.roomId, payload.coord);
        },
        // les methodes "toggle" permettent de gerer l'affichahe des modales
        toggleCreer: function () {
            this.reveleCreer = !this.reveleCreer
        },
        toggleRejoindre: function () {
            this.reveleRejoindre = !this.reveleRejoindre
        },
        toggleRegles: function () {
            this.reveleRegles = !this.reveleRegles
        },
        toggleCredit: function () {
            this.reveleCredit = !this.reveleCredit
        },
        togglePlayback() {
            const audioElement = this.$refs.audioElement;
            console.log(audioElement)
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
        }
    },
    beforeDestroy() { // tout est dans le nom
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        mediaQuery.removeListener(this.updateResponsiveState);
    }
};
</script>
<style scoped> /* style css pour le le composant App*/
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.responsive-container {
    padding: 2vh;
    background: #0B0B0B;
    font-family: 'Press Start 2P', cursive;
    height: 100vh;


}

@media (min-width: 1024px) {
    .le-jeux {
        margin-top: 1vh;
        max-height: 80%;
        overflow: hidden; /* Empêche le dépassement de contenu de la div */
    }

    .template {
        height: 100%;
        display: grid;
        grid-template-columns: 20% 60% 20%; /* Utilisation des pourcentages pour les colonnes */
    }

    .one {
        grid-column: 1; /* Début de la première colonne */
        grid-row: 1;
    }

    .two {
        grid-column: 2; /* Début de la deuxième colonne */
        grid-row: 1;
    }

    .three {
        grid-column: 3; /* Début de la troisième colonne */
        grid-row: 1;
    }

    .divImg {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .img1 {
        width: 80%;
    }

    @keyframes scaleMove {
        0% {
            transform: rotate(360deg);
        }
        50% {
            transform: scale(1.2);

        }
        100% {
            transform: scale(1.05);
        }

    }
    .boutons {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        gap: 5vh;
        margin-top: 2.5vh;

    }


    .myBtn {
        font-size: 1vw;
        cursor: pointer;
        /*font-size: 3em;*/
        padding: 1vh 2vw;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
    }


    .credit {
        position: fixed;
        bottom: 0;
        right: 0;
        padding: 2vh;
    }


    .credit div {
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
    }

    .game_rule {
        position: fixed;
        bottom: 0;
        left: 0;
        padding: 2vh;

        display: flex;
        flex-direction: row;
        gap: 3vh;
    }


    .game_rule div {
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
    }

    .alertmyturn {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        width: 50%;
        padding: 1vh;
        background: #0B0B0B;
        box-shadow: rgba(5, 137, 89, 0.35) 0px 5px 15px;
        border: 2px solid #01D58E;
        color: #01D58E;
        margin-bottom: 2vh;
    }

    .alertnotmyturn {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        width: 50%;
        padding: 1vh;
        background: #0B0B0B;
        box-shadow: rgba(121, 15, 194, 0.35) 0px 5px 15px;
        border: 2px solid #B85BF1;
        color: #B85BF1;
        margin-bottom: 2vh;

    }

    .popupWin {
        position: fixed;
        top: 40%;
        bottom: 40%;
        left: 30%;
        right: 30%;
        width: 40%;
        height: 20%;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        /*position: relative;*/
        z-index: 999;
        /*top: 50%;*/
        /*left: 50%;*/
        /*transform: translate(-50%, -50%);*/
        background: rgba(30, 30, 30, 0.75);
        box-shadow: rgba(77, 150, 214, 0.8) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
    }

    .popupLoose {
        position: fixed;
        top: 40%;
        bottom: 40%;
        left: 30%;
        right: 30%;
        width: 40%;
        height: 20%;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        /*position: relative;*/
        z-index: 999;
        /*top: 50%;*/
        /*left: 50%;*/
        /*transform: translate(-50%, -50%);*/
        background: rgba(30, 30, 30, 0.75);
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid rgba(255, 0, 0, 0.35);
        color: rgba(255, 0, 0, 0.35);
    }

    .popup p {
        margin: auto;
    }
}


</style>

