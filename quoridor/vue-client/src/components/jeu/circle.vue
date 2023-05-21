<!--Le pion-->

<template>
    <div>
        <div ref="pion"></div>
    </div>
</template>

<script>

import Konva from "konva";

export default {
    props: {
        layerPion: Object,
        tailleGrille: Number,
        listeJoueur: Object,
        width: Number,
        height: Number,
        otherInitGame: Object,
        myInitGame: Object,
        newPosition: Object
    },
    data() {
        return {
            mx: (this.width / this.tailleGrille),
            sx: (-(this.width / this.tailleGrille) / 2 - (this.width / this.tailleGrille) / 12),
        }
    },
    watch: {
        //changement de position d'un pion
        newPosition: function (newVal, oldVal) {
            const self = this;
            // code à exécuter lorsque la prop change
            let lePion = this.layerPion.find(node => node.attrs.owner === newVal.id)[0];
            const tween = new Konva.Tween({
                node: lePion,
                duration: 0.5,
                x: (1 + newVal.coord.x) * this.mx + this.sx,
                y: (1 + newVal.coord.y) * this.mx + this.sx,
                opacity: 1,
                onFinish: function () {
                    lePion.setAttrs({
                        x: (1 + newVal.coord.x) * self.mx + self.sx,
                        y: (1 + newVal.coord.y) * self.mx + self.sx
                    });
                }
            });
            tween.play()


        },
        //Création des pions au démarrage de la partie
        layerPion: {
            immediate: true,
            handler(layerPion) {
                if (layerPion) {
                    //On récupère les positions et les couleurs des pions
                    const pionPos = [
                        [
                            (1 + this.myInitGame.positionStart.x) * this.mx + this.sx,
                            (1 + this.myInitGame.positionStart.y) * this.mx + this.sx
                        ]
                    ];
                    this.otherInitGame.forEach(e => {
                        pionPos.push(
                            [
                                (1 + e.positionStart.x) * this.mx + this.sx,
                                (1 + e.positionStart.y) * this.mx + this.sx
                            ]
                        )
                    });
                    // On créé les pions en fonction des données récupérées
                    for (const num in this.listeJoueur) {
                        const pion = new Konva.Circle({
                            owner: this.listeJoueur[num][0],
                            x: pionPos[num][0],
                            y: pionPos[num][1],
                            radius: 0.4 * ((this.width / this.tailleGrille) - (this.width / this.tailleGrille) / 6),
                            fill: this.listeJoueur[num][1],
                        });
                        layerPion.add(pion);
                    }
                    layerPion.draw();
                }
            },
        },
    },
};
</script>