<template>
    <div class="overlay" v-if="revele"></div>

    <div class="bloc-modale" v-if="revele">
        <button v-on:click="toggleModale" class="myBtn myClose">X</button>
        <!--            <img src="../assets/elon.png" style="height: 60%; border-radius: 40px;">-->
        <img src="../assets/logo_gsociety.png" style="height: 60%; border-radius: 40px;">
        <br>
        <br>
        <!--            <h1>Gsociety</h1>-->
        <br>
        <h2>Lijuan - Loum - Mathieu - Victor</h2>
    </div>
</template>

<script>

export default {
    name: 'Credit',
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
        background-color: rgba(0, 0, 0, 0.6);
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
}
</style>