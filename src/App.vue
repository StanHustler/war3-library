<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import ColorChanger from "./components/ColorChanger.vue";
import TgaChanger from "./components/TgaChanger.vue";
import ModelLoader from "./components/ModelLoader.vue";
import {onMounted, ref} from "vue";
import BlpHandler from "./components/BlpHandler.vue";

let file = ref(null);
// let file = ref({
//     fileName : "[TX][SYW]QLZX-1.blp",
//     fileDir : "C:\\Users\\cf260\\Desktop\\TGA\\青龙之心特效\\war3\\"
// })

onMounted(()=>{
    window.addEventListener("drop", (e)=>{
        e.preventDefault()
        let f = e.dataTransfer.files[0]
        file.value = {
            fileName: f.name,
            fileDir: f.path.slice(0,f.path.length - f.name.length)
        }
        console.log(file)
    })
    window.addEventListener("dragover",(e)=>{
        e.preventDefault()
    })
})

const checkType = (type)=>{
    return file.value.fileName.split('.')[1].toLowerCase() === type
}

</script>

<template>
<!--    <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />-->
<!--    <ColorChanger />-->
<!--    <TgaChanger />-->
<!--    <ModelLoader />-->
    <el-watermark content="绘未科技" v-if="file===null">
        <div style="height: 500px;">
            <p>拖入文件</p>
            <p>支持MDX，BLP文件</p>
        </div>
    </el-watermark >

    <ColorChanger :file-dir="file.fileDir" :file-name="file.fileName" v-else-if="checkType('mdx')"/>
    <BlpHandler :file-dir="file.fileDir" :file-name="file.fileName" v-else-if="checkType('blp')"/>
    <div v-else>
        暂不支持的文件类型
    </div>
</template>

<style>
.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo.electron:hover {
    filter: drop-shadow(0 0 2em #9FEAF9);
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
