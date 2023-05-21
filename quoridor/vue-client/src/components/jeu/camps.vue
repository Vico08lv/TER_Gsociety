<!--Mettre en evidence l'objectif de victoire (côté à rejoindre)-->

<template>
    <div>
        <div ref="camps"></div>
    </div>
</template>

<script>
import Konva from "konva";

export default {
    props: {
        layerCamps: Object,
        width: Number,
        height: Number,
        myInitGame: Object,
        otherInitGame: Object,
        tailleGrille: Number
    },

    watch: {

        layerCamps: {
            immediate: true,
            handler(layerCamps) {
                if (layerCamps) {
                    //On dessine la ligne sur le bord opposé en fonction de la valeur de bord_oppose
                    this.drawLigneCamps(this.myInitGame.bord_oppose, this.myInitGame.color)
                    this.otherInitGame.forEach(o => {
                        this.drawLigneCamps(o.bord_oppose, o.color)
                    })
                    layerCamps.draw();
                }
            },
        },
    },
    methods: {

        //On trace les lignes en fonction des camps
        drawLigneCamps(campsOppose, color) {
            switch (campsOppose) {
                case "haut":
                    this.myLine(0, 0, this.width - (this.width / this.tailleGrille) / 6, 5, color)
                    break
                case "bas":
                    this.myLine(0, this.height - (this.width / this.tailleGrille) / 6, this.width - (this.width / this.tailleGrille) / 6, -5, color)
                    break
                case "droite":
                    this.myLine(this.width - (this.width / this.tailleGrille) / 6, 0, -5, this.height - (this.width / this.tailleGrille) / 6, color)
                    break
                case "gauche":
                    this.myLine(0, 0, 5, this.height - (this.width / this.tailleGrille) / 6, color)
                    break
            }
        },

        //fonction de tracé
        myLine(x0, y0, width, height, color) {

            const ligneCamp = new Konva.Rect({
                x: x0,
                y: y0,
                width: width,
                height: height,
                fill: color
            });
            this.layerCamps.add(ligneCamp);
        }
    }
};
</script>