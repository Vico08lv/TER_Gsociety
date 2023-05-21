<!--Composant pour visualiser les barrières des joueurs-->

<template>

    <div class="container" >
        <h2 class="thetitre">Barrières</h2>
            <div class="myBar">
                <div ><p class="nomBar" :style="{ color : myInitGame.color}"> Moi : {{ new_nb_Walls[socket.id] }}/{{nb_Walls}}</p></div>
                <div class="bar center">
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth(socket.id) , backgroundColor: myInitGame.color}"> </div>
                    </div>
                </div>
            </div>
        <div class="myBar" v-for="player in otherInitGame" :key="otherInitGame.socketId">
            <div ><p class="nomBar" :style="{ color : player.color}">{{player.username}} : {{ new_nb_Walls[player.socketId] }}/{{nb_Walls}}</p></div>
            <div class="bar center">
                <div class="progress">
                    <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth(player.socketId) , backgroundColor: player.color}"> </div>
                </div>
            </div>
        </div>
        </div>

</template>

<script>

export default {
    name: "infoBarriere",
    props:["username","nb_Walls","socket","otherInitGame","myInitGame"],
    data(){
        return{
            new_nb_Walls : {},
            myValue: {}
        }
    },mounted() {
        //Initialisation des barres de progression
        this.new_nb_Walls[this.myInitGame.socketId] = this.nb_Walls
        this.myValue[this.myInitGame.socketId] = 100
        this.otherInitGame.forEach(o=>{
            this.new_nb_Walls[o.socketId] = this.nb_Walls
            this.myValue[o.socketId] = 100
        })


        // mise à jour des murs restants
        this.socket.on('majBar', (players) => {
            players.forEach(p =>{
                this.new_nb_Walls[p.socketId] = p.barLeft
                this.myValue[p.socketId] = (this.new_nb_Walls[p.socketId]/this.nb_Walls)*100;

            })

        })
    },
    methods:{
        progressBarWidth(socketId) {
            return `${this.myValue[socketId]}%`;
        }
    }
}



</script>

<style scoped >

@media (min-width: 1024px) {
  .container {
    text-align: center;
    color: #0d6efd;
  }

  .myBar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0B0B0B;
    color: #0c63e4;
    /*width: 50%;*/
    /*height: 50vh;*/
      margin: auto auto 5vh;
  }


  .bar {
    width: 40vh;
  }

  .myBar .progress {
    height: 4vh;
    width: 100%;
    background-color: #333363;
    border-radius: 0;
    /*transform: rotate(-90deg);*/
    border: 2px solid #0b5ed7;
  }

  .progress-bar {
    height: 4vh;
    /*background-color: #0d6efd;*/
  }

  .nomBar{width: 100%; text-align: center;  margin: 0}

  .thetitre{
      margin-bottom: 5vh;
  }
}
</style>