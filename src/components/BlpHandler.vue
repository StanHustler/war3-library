<script setup>
import fs from "fs";
import {onMounted, ref} from "vue";
import {ipcRenderer} from "electron";

const props = defineProps(['fileDir','fileName'])
const { execFile } = require('node:child_process');

let btn_goPS = ref(false)
let box
onMounted(() => {
    box = document.getElementById("msg")
    // ipcRenderer.send('get-setting', 'BLPconv')
    // ipcRenderer.on('get-setting-reply', (event, args)=>{
    //     console.log(args)
    // })

    goConv(props.fileDir + props.fileName)
    goPS()
})

const goPS = () => {0
    const psPath = "C:\\Program Files\\Adobe\\Adobe Photoshop CC 2015.5\\Photoshop.exe"
    execFile(psPath,[props.fileDir + props.fileName.slice(0,-3)+"TGA"])
}

const goConv = (filepath) =>{
    const exePath = "C:\\Users\\cf260\\Desktop\\TGA\\青龙之心特效\\war3\\BLPconv.exe"
    execFile(exePath, [filepath], (error, stdout, stderr)=>{
        fs.readdir(props.fileDir, (er, files)=>{
            if (er) {
                box.innerText += er.toString()
                return
            }
            if (files.indexOf(props.fileName.slice(0,-3)+"TGA") === -1){
                box.innerText += stderr.toString()

            } else {
                box.innerText += "转换成功"
                btn_goPS.value=true
            }
        })
    })
}

const bak = () =>{

    fs.stat(props.fileDir + "bak", (e)=>{
        if (e){
            fs.mkdirSync(props.fileDir + "bak")
        }
        fs.copyFileSync(props.fileDir + props.fileName, props.fileDir+ 'bak\\' + props.fileName)
    })
}



</script>

<template>
    <div id="msg"/>
    <el-button v-if="btn_goPS" @click="goConv(props.fileDir + props.fileName.slice(0,-3)+'TGA')"> 已完成PS </el-button>
</template>

<style scoped>

</style>