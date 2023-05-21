<template>
    <div class="container">
        <div ref="plateau">
            <Background :width="width" :height="height" :layerBackground="layerBackground" :taille-grille="nbSquares"/>
            <Rect :roomId="roomId" :socket="socket" :width="width" :height="height" :layerCell="layerCell"
                  :taille-grille="nbSquares"/>
            <BarrierEmpl :roomId="roomId" :socket="socket" :width="width" :height="height" :layerBarEmpl="layerBarEmpl"
                         :taille-grille="nbSquares"/>
            <Pion :newPosition="newPosition" :myInitGame="myInitGame" :otherInitGame="otherInitGame" :width="width"
                  :height="height" :layerPion="layerPion" :listeJoueur="listeJoueur" :taille-grille="nbSquares"/>
            <Camps :width="width" :height="height" :layerCamps="layerCamps" :otherInitGame="otherInitGame"
                   :my-init-game="myInitGame" :taille-grille="nbSquares"/>
        </div>
    </div>
</template>

<script>
import Konva from 'konva';
import Background from "./jeu/background.vue";
import Rect from "./jeu/cellule.vue";
import Pion from "./jeu/circle.vue";
import BarrierEmpl from "./jeu/barriere_empl.vue";
import Camps from "./jeu/camps.vue";


export default {
    name: 'PlateauComponent',
    data() {
        return {
            stage: null,
            width: this.largeur,
            height: this.largeur,
            listeJoueur: [],
            layerBackground: null,
            layerCell: null,
            layerBarEmpl: null,
            layerPion: null,
            layerCamps: null
        };
    },
    props: ["nbSquares", "myInitGame", "otherInitGame", "myTurn", "newPosition", "nbBarriere", "roomId", "socket", "largeur"],
    components: {
        Background, Rect, Pion, BarrierEmpl, Camps
    },
    computed: {
        stage() {
            return this.$refs.stage;
        }
    },
    methods: {
        changeturn(payload) {
            this.$emit('event-turn', payload);
        },
    }, watch: {

        // Mise à jour de la taille du canvas en fonction de la taille de la fenetre
        largeur: function (newVal, oldVal) {
            var scaleRatioX = newVal / this.width;
            var scaleRatioY = newVal / this.height;


            this.stage.width(newVal)
            this.stage.height(newVal)


            this.layerCell.scale({x: scaleRatioX, y: scaleRatioY})
            this.layerPion.scale({x: scaleRatioX, y: scaleRatioY})
            this.layerCamps.scale({x: scaleRatioX, y: scaleRatioY})
            this.layerBackground.scale({x: scaleRatioX, y: scaleRatioY})
            this.layerBarEmpl.scale({x: scaleRatioX, y: scaleRatioY})


            switch (this.myInitGame.bord_oppose) {
                case "bas": //180
                    this.stage.offset({x: newVal, y: newVal});
                    break;
                case  "droite" : //90
                    this.stage.offset({x: newVal, y: 0});
                    break;
                case "gauche" : //-90
                    this.stage.offset({x: 0, y: newVal});
                    break
            }

            this.stage.draw();
        }
    },

    mounted() {
        // On créé un variable listejoueur qui récupère les pseudo et couleurs des joueurs
        this.listeJoueur.push([this.myInitGame.socketId, this.myInitGame.color]);
        this.otherInitGame.forEach(e => this.listeJoueur.push([e.socketId, e.color]));

        // console.log("plateau joueurs : "+this.listeJoueur);

        //Création de la stage
        this.stage = new Konva.Stage({
            container: this.$refs.plateau,
            width: this.width,
            height: this.height,
        });


        //Création du calque de fond
        const layerBackground = new Konva.Layer({
            fill: "blue",
        });
        this.stage.add(layerBackground);
        // Stockage de la layerBackground
        this.layerBackground = layerBackground;


        //Création du calque des cellules
        const layerCell = new Konva.Layer({
            fill: "blue",
        });
        this.stage.add(layerCell);
        // Stockage de la layerCell
        this.layerCell = layerCell;


        //Création du calque des emplacements des barrieres
        const layerBarEmpl = new Konva.Layer({
            fill: "blue",
        });
        this.stage.add(layerBarEmpl);
        // Stockage de la layerBarEmpl
        this.layerBarEmpl = layerBarEmpl;


        //Création du calque des pions
        const layerPion = new Konva.Layer({
            fill: "blue",
        });
        this.stage.add(layerPion);
        // Stockage de la layerPion
        this.layerPion = layerPion;

        //Création du calque des pions
        const layerCamps = new Konva.Layer({
            fill: "blue",
        });
        this.stage.add(layerCamps);
        // Stockage de la layerPion
        this.layerCamps = layerCamps;

        //Rotation du canvas en pour que chaque joueur ait son pion en bas du plateau
        switch (this.myInitGame.bord_oppose) {
            case "bas": //180
                this.stage.rotate(180)
                this.stage.offset({x: this.stage.width(), y: this.stage.height()});
                break;
            case  "droite" : //90
                this.stage.rotate(-90)
                this.stage.offset({x: this.stage.width(), y: 0});

                break;
            case "gauche" : //-90
                this.stage.rotate(90)
                this.stage.offset({x: 0, y: this.stage.height()});
                break
        }
        // Appliquer la translation pour décaler le point d'ancrage
        this.stage.draw();
    }
}
</script>

<style scoped>
@media (min-width: 1024px) {
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

}
</style>