<script setup lang="ts">
import fs from "fs";
import {ref} from "vue";
const TGA = require('tga');

let tga;

fs.readFile("/Users/stan/Desktop/暗影/暗影 暗影晶球/[TX][JN]AY-AYJQ-A1.TGA", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    tga = new TGA(data);
    console.log(tga)

    let cvs = document.querySelector("canvas")
    cvs.width = tga.width
    cvs.height = tga.height

    let imgData = new ImageData(tga.width, tga.height)
    imgData.data.set(tga.pixels)
    cvs.getContext('2d').putImageData(imgData, 0, 0)
})


</script>

<template>
    <div>tga changer</div>
    <canvas style='border:1px solid #000' />
</template>

<style scoped>

</style>