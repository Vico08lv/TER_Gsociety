<!--Emplacement des barrières-->

<template>
    <div>
        <div ref="barEmpl"></div>
    </div>
</template>

<script>

import Konva from 'konva';

export default {
    props: {
        layerBarEmpl: Object,
        tailleGrille: Number,
        width: Number,
        height: Number,
        selected: Array,
        roomId: Number,
        socket: Object,
        placable: false
    },
    data() {
        return {
            myTurn: null,
            clickable: true
        }
    },
    mounted() {

        //Ecouteur pour savoir à qui est le tour
        this.socket.on("my turn", (turn) => {
            this.myTurn = turn
        })

        //Mise à jour des barrières posés par le joueur précédent
        this.socket.on("updated bar", (bar) => {
            this.layerBarEmpl.getChildren().forEach(b => {
                if (b.attrs.name === bar.name && b.attrs.x1 === bar.x1 && b.attrs.y1 === bar.y1) {
                    b.fill("#EDED5E")
                    b.placable = true

                    //On colore les emplacements des nouvelles barrières en jaune
                    if (b.attrs.name === "V") {
                        this.layerBarEmpl.find(node => node.attrs.x1 === b.attrs.x1 && node.attrs.y1 === b.attrs.y1 + 1 && node.attrs.name === "V")[0].fill("#EDED5E").placable = true
                        this.layerBarEmpl.find(node => node.attrs.x1 === b.attrs.x1 && node.attrs.y1 === b.attrs.y1 - 1 && node.attrs.name === "V")[0].placable = true
                    } else {
                        this.layerBarEmpl.find(node => node.attrs.x1 === b.attrs.x1 + 1 && node.attrs.y1 === b.attrs.y1 && node.attrs.name === "H")[0].fill("#EDED5E").placable = true
                        this.layerBarEmpl.find(node => node.attrs.x1 === b.attrs.x1 - 1 && node.attrs.y1 === b.attrs.y1 && node.attrs.name === "H")[0].placable = true
                    }

                }
            })
            this.layerBarEmpl.draw()
        })
    },
    watch: {
        layerBarEmpl: {
            immediate: true,
            handler(layerBarEmpl) {
                const self = this;
                if (layerBarEmpl) {

                    //Pour les barrières verticales, on créé les emplacements de barrière
                    for (let i = 0; i < this.tailleGrille - 1; i++) {
                        for (let j = 0; j < this.tailleGrille; j++) {
                            let barV = new Konva.Rect({
                                id: "" + i + "" + j,
                                x: (this.width / this.tailleGrille) * i + (this.width / this.tailleGrille) * 0.875,
                                y: (this.height / this.tailleGrille) * j + (this.height / this.tailleGrille) * 0.125 / 3,
                                x1: i,
                                y1: j,
                                width: (this.width / this.tailleGrille) / 12,
                                height: (this.height / this.tailleGrille) * 0.75,
                                fill: '#464646',
                                name: "V"
                            });
                            //On ne met pas d'écouteur sur la dernière ligne d'emplacement car les barrières se placent par deux
                            if (j !== this.tailleGrille - 1) {

                                //Quand on click sur un emplacement
                                barV.on('click', function (evt) {
                                    //si c'est mon tour, et que l'on est pas en attente d'une réponse du serveur (eviter les spam click)
                                    if (!this.placable && self.myTurn && self.clickable) {
                                        self.clickable = false

                                        //Selection des 2 parties de barrière bar1 et bar2
                                        let bar1 = {
                                            name: evt.target.attrs.name,
                                            x1: evt.target.attrs.x1,
                                            y1: evt.target.attrs.y1
                                        }
                                        let bar = layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 && node.attrs.y1 === evt.target.attrs.y1 + 1 && node.attrs.name === "V")[0]
                                        let bar2 = {
                                            name: bar.attrs.name,
                                            x1: bar.attrs.x1,
                                            y1: bar.attrs.y1
                                        }

                                        //On emet au serveur pour tester la validité des emplacements
                                        self.socket.emit("testBar", self.roomId, bar1, bar2)

                                        //Retour du serveur. Si valide, colore les barrières et désactivation de l'écouteur
                                        self.socket.on("valid Bar", (res) => {
                                            self.clickable = true
                                            if (res) {
                                                evt.target.fill('#EDED5E')
                                                layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 && node.attrs.y1 === evt.target.attrs.y1 + 1 && node.attrs.name === "V")[0].fill('#EDED5E')
                                                layerBarEmpl.draw()
                                            } else {
                                                self.socket.off("valid Bar");
                                            }
                                        })
                                    }
                                })

                                //ecouteur pour visualiser l'emplacement de la barriere
                                barV.on('mouseover', function (evt) {
                                    if (!this.placable && self.myTurn) {
                                        evt.target.fill('#E89AC4')
                                        layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 && node.attrs.y1 === evt.target.attrs.y1 + 1 && node.attrs.name === "V")[0].fill('#E89AC4')
                                        layerBarEmpl.draw()
                                    }
                                })
                                barV.on('mouseout', function (evt) {
                                    if (!this.placable && self.myTurn) {
                                        evt.target.fill('#464646')
                                        layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 && node.attrs.y1 === evt.target.attrs.y1 + 1 && node.attrs.name === "V")[0].fill('#464646')
                                        layerBarEmpl.draw()
                                    }
                                })

                            }
                            layerBarEmpl.add(barV);
                        }
                    }

                    //Idem pour les barrières horizontales
                    for (let i = 0; i < this.tailleGrille; i++) {
                        for (let j = 0; j < this.tailleGrille - 1; j++) {
                            let barH = new Konva.Rect({
                                id: "" + i + "" + j,
                                x: (this.width / this.tailleGrille) * i + (this.width / this.tailleGrille) * 0.125 / 3,
                                y: (this.height / this.tailleGrille) * j + (this.height / this.tailleGrille) * 0.875,
                                x1: i,
                                y1: j,
                                width: (this.width / this.tailleGrille) * 0.75,
                                height: (this.height / this.tailleGrille) / 12,
                                fill: '#464646',
                                name: "H"
                            });
                            if (i !== this.tailleGrille - 1) {
                                barH.on('click', function (evt) {
                                    if (!this.placable && self.myTurn && self.clickable) {
                                        self.clickable = false
                                        let bar1 = {
                                            name: evt.target.attrs.name,
                                            x1: evt.target.attrs.x1,
                                            y1: evt.target.attrs.y1
                                        }
                                        let bar = layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 + 1 && node.attrs.y1 === evt.target.attrs.y1 && node.attrs.name === "H")[0]
                                        let bar2 = {
                                            name: bar.attrs.name,
                                            x1: bar.attrs.x1,
                                            y1: bar.attrs.y1
                                        }
                                        self.socket.emit("testBar", self.roomId, bar1, bar2)
                                        self.socket.on("valid Bar", (res) => {
                                            self.clickable = true
                                            if (res) {
                                                evt.target.fill('#EDED5E')
                                                layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 + 1 && node.attrs.y1 === evt.target.attrs.y1 && node.attrs.name === "H")[0].fill('#EDED5E')
                                                layerBarEmpl.draw()
                                            } else {
                                                self.socket.off("valid Bar");
                                            }
                                        })
                                    }
                                })
                                barH.on('mouseover', function (evt) {
                                    if (!this.placable && self.myTurn) {
                                        evt.target.fill('#E89AC4')
                                        layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 + 1 && node.attrs.y1 === evt.target.attrs.y1 && node.attrs.name === "H")[0].fill('#E89AC4')
                                        layerBarEmpl.draw()
                                    }
                                })
                                barH.on('mouseout', function (evt) {
                                    if (!this.placable && self.myTurn) {
                                        evt.target.fill('#464646')
                                        layerBarEmpl.find(node => node.attrs.x1 === evt.target.attrs.x1 + 1 && node.attrs.y1 === evt.target.attrs.y1 && node.attrs.name === "H")[0].fill('#464646')
                                        layerBarEmpl.draw()
                                    }
                                })
                            }
                            layerBarEmpl.add(barH);
                        }
                    }
                    layerBarEmpl.draw();
                }
            },
        },
    },
};
</script>