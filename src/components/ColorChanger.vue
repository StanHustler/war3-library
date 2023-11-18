<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX} from 'war3-model';


import {defineComponent, onMounted, ref} from "vue";
    import * as fs from "fs";

let model
let mdxProperty = ref();
function readMDX(){

    const filePath = '/Users/stan/Desktop/暗影/暗影 暗影尖刺/[TX][JN]AY-AYJC.mdx';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        model = parseMDX(data.buffer)
        let res = []
        for (let i of model.Nodes) {
            if ('SegmentColor' in i) {
                res.push({
                    "Name": i.Name,
                    "SegmentColor": i.SegmentColor
                })
            }
        }
        mdxProperty.value = res
        console.log(res)
    })

}
const parseFloatRGBArray2 = (arr) => {
    return arr.map((subArr) => {
        return subArr.map((num) => Math.floor(num * 255));
    });
};

const fToStyle = (arr : number[]) => {

    const fToI = (f) => Math.floor(f * 255);

    return {
        backgroundColor: `rgb( ${fToI(arr[0])}, ${fToI(arr[1])}, ${fToI(arr[2])} )`
    };
}

</script>

<template>
    <el-table style="width: 100%" v-if="mdxProperty" :data="mdxProperty">
        <el-table-column prop="Name" label="Name" width="180" />
        <el-table-column prop="SegmentColor" label="SegmentColor" width="180" >
            <template #default="scope">
                <div class="box-container">
                    <div class="color-box" :style="fToStyle(scope.row.SegmentColor[0])"/>
                    <div class="color-box" :style="fToStyle(scope.row.SegmentColor[1])"/>
                    <div class="color-box" :style="fToStyle(scope.row.SegmentColor[2])"/>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <button @click="readMDX" v-else>读取模型</button>
</template>

<style scoped>
    .box-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .color-box {
        width: 20px;
        height: 20px;
        border: 1px solid #000;
    }
</style>