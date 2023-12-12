<script setup>
import {onMounted, ref, watch} from "vue";
import fs from 'node:fs'
import {decodePng, encodeTga, Transform} from "image-in-browser";

const props = defineProps(['fileDir', 'fileName'])
const inputPixels= ref({w:64,h:64})
let cvs
let bgData
let inputPath= ref("C:\\Users\\cf260\\Desktop\\技能\\框\\test")

onMounted(()=>{
    cvs = document.querySelector("canvas")
    bgData = decodePng({data: fs.readFileSync(props.fileDir + props.fileName)})
    renderCvs(bgData)
})

const renderCvs = (data) => {
    let [w,h] = [data.width, data.height]
    cvs.width = w
    cvs.height = h
    let imgData = new ImageData(w, h)
    imgData.data.set(data.data.data)
    cvs.getContext('2d').putImageData(imgData, 0, 0)
}

watch(props,(e)=>{
    bgData = decodePng({data: fs.readFileSync(props.fileDir + props.fileName)})
    renderCvs(bgData)
})


const onHandle = () => {
    bgData = Transform.copyResize({image: bgData, width: inputPixels.value.w, height: inputPixels.value.h})

    let dir = fs.readdirSync(inputPath.value)
    if (dir.indexOf('blp')===-1) fs.mkdirSync(inputPath.value + "\\blp")
    dir.map((name)=>{
        if (name.toLowerCase().indexOf('png')===-1)return
        let fileData = decodePng({data: fs.readFileSync(inputPath.value + '\\' + name)})
        console.log(inputPath.value + '\\' + name)
        fileData = Transform.copyResize({image: fileData, width: inputPixels.value.w, height: inputPixels.value.h})

        for (let i= 0; i< bgData.data.data.length; i+=4 ){
            let [r,g,b,a] = [
                bgData.data.data[i],
                bgData.data.data[i+1],
                bgData.data.data[i+2],
                bgData.data.data[i+3],
            ]

            // if ([r,g,b,a] === [255,255,255,0])continue
            if (r===255 && g===255 && b===255 && a===0) continue
            fileData.data.data[i]=r;
            fileData.data.data[i+1]=g;
            fileData.data.data[i+2]=b;
            fileData.data.data[i+3]=a;
        }

        fs.writeFileSync(inputPath.value + "\\blp\\" + name.split('.')[0]+ '.tga', encodeTga({image:fileData}))
        renderCvs(fileData)
    })

}

</script>

<template>

    <canvas/>
    <el-row>
        <el-col>
            <el-input v-model="inputPixels.w" style="width: 50px"/>
            x
            <el-input v-model="inputPixels.h" style="width: 50px"/>
        </el-col>
    </el-row>
    <el-row>
        <el-input v-model="inputPath" placeholder="C:\Users\cf260\Desktop\技能\框\test"/>
        <el-col><el-button :onclick="onHandle"> 处理 </el-button></el-col>
    </el-row>
</template>

<style scoped>
</style>