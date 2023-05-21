<template>
    <div class="overlay" v-if="revele"></div>

    <div class="bloc-modale" v-if="revele">
        <button v-on:click="toggleModale" class="myBtn myClose">X</button>
        <h1>Règles du jeu</h1>
        <div class="regle">

            <div class="one">
                <h3>PION</h3>
                <div class="container-image">
                    <img class="image" src="../assets/regle_deplacement.gif">
                </div>

                <p>cliquez sur une cellule pour déplacer</p>
            </div>
            <div class="two">
                <h3>BARRIERE</h3>
                <div class="container-image">
                    <img class="image" src="../assets/regle_bar.gif">
                </div>
                <p>cliquez entre les cellules pour placer</p>
            </div>
            <div class="three">
                <h3>VICTOIRE</h3>
                <div class="container-image">
                    <img class="image" src="../assets/regle_victoire.gif">
                </div>
                <p>atteignez le côté opposé</p>
            </div>
        </div>
        <p>Règles détaillées : <a href="https://jeux-casse-tete.com/blog/regles-de-jeux/regle-du-jeu-quoridor"
                                  target="_blank">ici</a></p>
    </div>

</template>

<script>

export default {
    name: 'Regles',
    props: ['revele', 'toggleModale']

}


</script>

<style scoped>


@media (min-width: 768px) {
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
        background-color: rgba(0, 0, 0, 0.6); /* transparent black */
        /*z-index: -10; !* ensure it is above other elements *!*/
        z-index: 998;
    }

    .myBtn {
        cursor: pointer;
        /*font-size: 3em;*/
        padding: 1vh 1vh;
        background: #0B0B0B;
        box-shadow: rgba(255, 0, 0, 0.35) 0px 5px 15px;
        border: 2px solid #0b5ed7;
        color: #0b5ed7;
    }

    .myClose {
        margin-top: 1vh;
        margin-right: 1vh;
        position: absolute;
        top: 0;
        right: 0;
    }

    .regle {
        margin: 5vh;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 2vh;
        grid-auto-rows: minmax(100px, auto);
        width: 100%
    }

    .one {
        margin: auto;
        grid-column: 1/2;
        grid-row: 1;
        width: 100%;
    }

    .two {
        margin: auto;
        grid-column: 2/3;
        grid-row: 1;
        width: 100%;
    }

    .three {
        margin: auto;
        grid-column: 3/4;
        grid-row: 1;
        width: 100%;
    }

    h1 {
        font-size: 1.5vw;
        margin-bottom: 2vh;
    }

    h3 {
        font-size: 1vw;
        margin-bottom: 2vh;
        text-align: center;
    }

    p {
        font-size: 1vw;
        margin-top: 2vh;
        text-align: center;
    }

    .container-image {
        width: 100%;
        overflow: hidden;
    }

    .image {
        display: block;
        margin: auto;
        width: 70%;
        height: auto;
    }

}
</style>