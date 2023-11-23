<script setup>
import fs from "fs";
import {onMounted, ref} from "vue";
import {ipcRenderer} from "electron";

const props = defineProps(['fileDir','fileName'])
const { execFile } = require('node:child_process');

let btn_goPS = ref(false)

onMounted(() => {

    ipcRenderer.send('get-setting')
    ipcRenderer.on('get-setting-reply', (event, args)=>{
        console.log(event,args)
    })

    const msgbox = document.getElementById("msg")
    const exePath = "C:\\Users\\cf260\\Desktop\\TGA\\青龙之心特效\\war3\\BLPconv.exe"
    execFile(exePath, [  props.fileDir + props.fileName], (error, stdout, stderr)=>{
        fs.readdir(props.fileDir, (er, files)=>{
            if (er) {
                msgbox.innerText = er.toString()
                return
            }
            if (files.indexOf(props.fileName.slice(0,-3)+"TGA") === -1){
                msgbox.innerText = stderr.toString()

            } else {
                msgbox.innerText = "转换成功"
                btn_goPS.value=true
            }
        })
    })
})

const goPS = () => {

}

</script>

<template>
    <div id="msg"/>
    <el-button v-if="btn_goPS"> 前往PS </el-button>
</template>

<style scoped>

</style>