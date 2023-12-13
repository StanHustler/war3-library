<script setup>
import {onMounted, ref, watch} from "vue";
import fs from 'node:fs'
import {decodePng, encodePng, encodeTga, Transform} from "image-in-browser";
import {ElMessage} from "element-plus";

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
    if (dir.indexOf('0png')===-1) fs.mkdirSync(inputPath.value + "\\0png")


    let dic = {}
    for (let i= 0; i< bgData.data.data.length; i+=4 ) {
        let [r, g, b, a] = [
            bgData.data.data[i],
            bgData.data.data[i + 1],
            bgData.data.data[i + 2],
            bgData.data.data[i + 3],
        ]
        if (r===255 && g===255 && b===255 && a===0) continue
        dic[i]= r
        dic[i + 1]= g
        dic[i + 2]= b
        dic[i + 3]= a
    }

    dir.map((name)=>{
        if (name.toLowerCase().indexOf('0png')!==-1)return
        let fileData = decodePng({data: fs.readFileSync(inputPath.value + '\\' + name)})
        fileData = Transform.copyResize({image: fileData, width: inputPixels.value.w, height: inputPixels.value.h})

        if (!fileData.hasAlpha) {
            fileData = fileData.convert({numChannels: 4})
        }

        for (let i= 0; i< fileData.data.data.length; i+=4 ){
            for (let j=0;j<4;j++){
                if (dic[i+j])  fileData.data.data[i+j] = dic[i+j];
            }
        }

        fs.writeFileSync(inputPath.value + "\\0png\\" + name.split('.')[0]+ '.png', encodePng({image:fileData}))
        renderCvs(fileData)

    })

    ElMessage({
        message: "叠图完成，请在【文件夹\\0png】中查看",
        type: 'success',
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