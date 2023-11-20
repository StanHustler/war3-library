<script setup lang="ts">
import fs from "fs";
import {ref} from "vue";
import {decodeTga, Filter} from "image-in-browser";

let tga;
let tga_bak
let cvs;

fs.readFile("/Users/stan/Desktop/暗影/暗影 暗影晶球/[TX][JN]AY-AYJQ-A1.TGA", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    tga = decodeTga({data})
    tga_bak = structuredClone(tga._data._data)
    console.log(tga)
    cvs = document.querySelector("canvas")
    freshCvs(tga)
})

const freshCvs = (tga) => {
    function sum(arr){
        return arr.reduce((prev,cur)=> prev+cur)
    }

    console.log(sum(tga._data._data))
    let w = tga._data._width
    let h = tga._data._height

    cvs.width = w
    cvs.height = h

    let imgData = new ImageData(w, h)
    imgData.data.set(tga._data._data)
    cvs.getContext('2d').putImageData(imgData, 0, 0)
}

let hue = ref(0)
let saturation = ref(1)
const fltr = () => {
    tga._data._data = structuredClone(tga_bak)
    Filter.adjustColor({image: tga, saturation: saturation.value, hue: hue.value})
    freshCvs(tga)
}
</script>

<template>
    <div>tga changer</div>
    <canvas style='border:1px solid #000' />

    <div>saturation</div>
    <el-slider v-model="saturation" show-input :min="0" :max="2" :step="0.01" @change="fltr" class="dark"/>
    <div>hue</div>
    <el-slider v-model="hue" show-input :min="0" :max="45" :step="0.1" @change="fltr"/>
</template>

<style scoped>

</style>