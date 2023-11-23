<script lang="ts" setup>
import fs from "fs";
import {onMounted, ref} from "vue";
import {ipcRenderer} from "electron";

const props = defineProps(['fileDir', 'fileName'])
const {execFile} = require('node:child_process');

let btn_goPS = ref(false)
const setting = ref({'converter':null,'photoshop':null})
let box
const dialogVisible = ref(true)

onMounted(() => {
    box = document.getElementById("msg")

    getSetting().then(()=>{
        console.log(setting.value)
        if (setting.value.photoshop && setting.value.converter){
            dialogVisible.value= false
            init()
        }
    })

})

const init = () =>{
    goBak()
    goConv(props.fileDir + props.fileName)
    goPS()
}

const getSetting = async () => {
    setting.value.converter = await ipcRenderer.invoke('setting', ['get',"converter"])
    setting.value.photoshop = await ipcRenderer.invoke('setting', ['get',"photoshop"])
}

const setSetting = async () => {
    await ipcRenderer.invoke('setting', ['set', "converter", setting.value.converter])
    await ipcRenderer.invoke('setting', ['set', "photoshop", setting.value.photoshop])
    dialogVisible.value = false
    init()
}

const goPS = () => {
    const psPath = setting.value.photoshop
    execFile(psPath, [props.fileDir + props.fileName.slice(0, -3) + "TGA"])
}

const goConv = (filepath) => {
    const exePath = setting.value.converter
    execFile(exePath, [filepath], (error, stdout, stderr) => {
        fs.readdir(props.fileDir, (er, files) => {
            if (er) {
                box.innerText += er.toString()
                return
            }
            if (files.indexOf(props.fileName.slice(0, -3) + "TGA") === -1) {
                box.innerText += stderr.toString()

            } else {
                box.innerText += "转换成功"
                btn_goPS.value = true
            }
        })
    })
}

const goBak = () => {

    fs.stat(props.fileDir + "bak", (e) => {
        if (e) {
            fs.mkdirSync(props.fileDir + "bak")
        }
        fs.copyFileSync(props.fileDir + props.fileName, props.fileDir + 'bak\\' + props.fileName)
    })
}


</script>

<template>
    <div id="msg"/>
    <el-button v-if="btn_goPS" @click="goConv(props.fileDir + props.fileName.slice(0,-3)+'TGA')"> 已完成PS</el-button>
    <el-button @click="dialogVisible = true"> 打开设置 </el-button>

    <el-dialog
            v-model="dialogVisible"
            title="请配置路径"
            width="80%"
            :show-close=false
            :close-on-press-escape=false
            :close-on-click-modal=false
    >


        <el-row style="justify-content: space-between;align-items: center; padding-bottom: 20px">
            <span>BLPconv</span>
            <el-input v-model="setting.converter" style="width: 80%" placeholder="C:\Users\cf260\Desktop\BLPconv.exe"/>
        </el-row>
        <el-row style="justify-content: space-between;align-items: center;">
            <span>photoshop</span>
            <el-input v-model="setting.photoshop" style="width: 80%" placeholder="C:\Program Files\PS\Photoshop.exe"/>
        </el-row>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="setSetting">
                Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>