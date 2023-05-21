<!--Fond du canvas-->

<template>
    <div>
        <div ref="background"></div>
    </div>
</template>

<script>
export default {
    props: {
        layerBackground: Object,
        tailleGrille: Number,
        width: Number,
        height: Number,
    },

    watch: {

        layerBackground: {
            immediate: true,
            handler(layerBackground) {
                if (layerBackground) {
                    //On trace le fond en fonction de la dimension du canvas
                    const background = new Konva.Rect({
                        id: "fond",
                        x: 0,
                        y: 0,
                        width: this.tailleGrille * (this.width / this.tailleGrille) - (this.width / this.tailleGrille) / 6,
                        height: this.tailleGrille * (this.height / this.tailleGrille) - (this.height / this.tailleGrille) / 6,
                        fill: "#0B0B0B",
                    });
                    layerBackground.add(background);
                    layerBackground.draw();
                }
            },
        },
    },
};
</script>