<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX, generateMDX} from 'war3-model';


import {defineComponent, onMounted, ref} from "vue";
    import * as fs from "fs";
import {ValueLib} from "../lib/valueLib";
import {ElMessageBox} from "element-plus";

let model
let mdxProperty = ref();
let filterWhiteData = ref(false)
function readMDX(){

    const filePath = '/Users/stan/Desktop/暗影/暗影 暗影尖刺/[TX][JN]AY-AYJC.mdx';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        model = parseMDX(data.buffer)
        console.log(model)
        let res = []
        let idx = -1
        for (let i of model.Nodes) {
            idx++
            if ('SegmentColor' in i) {
                res.push({
                    "idx": idx,
                    "Name": i.Name,
                    "C0": ValueLib.colorFA2Rgba(i.SegmentColor[0], i.Alpha[0]),
                    "C1": ValueLib.colorFA2Rgba(i.SegmentColor[1], i.Alpha[1]),
                    "C2": ValueLib.colorFA2Rgba(i.SegmentColor[2], i.Alpha[2]),
                })
            }
        }
        mdxProperty.value = res
    })

}

const onClick = () => {
    console.log(mdxProperty.value)
    for (let i of mdxProperty.value) {
        let node = model.Nodes[i.idx]
        let rgba0 = ValueLib.rgba2Ar(i.C0)
        let rgba1 = ValueLib.rgba2Ar(i.C1)
        let rgba2 = ValueLib.rgba2Ar(i.C2)
        node.SegmentColor= [rgba0.rgb, rgba1.rgb, rgba2.rgb]
        node.Alpha = [rgba0.a, rgba1.a, rgba2.a]
    }
    let res = generateMDX(model)
    fs.writeFile('/Users/stan/Desktop/暗影/暗影 暗影尖刺/res.mdx', Buffer.from(res), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        ElMessageBox.alert('保存成功', '提示', {
            confirmButtonText: '确定',
            callback: action => {
                console.log(action)
            }
        });
    });

}

</script>

<template>
    <div  v-if="mdxProperty">
        <el-switch v-model="filterWhiteData"/>
        <el-table style="width: 100%" :data="mdxProperty">
            <el-table-column prop="Name" label="Name" width="140" />
            <el-table-column prop="SegmentColor" label="SegmentColor" width="180" >
                <template #default="scope">
                    <div class="box-container">
                        <el-color-picker show-alpha v-model="scope.row.C0"/>
                        <el-color-picker show-alpha v-model="scope.row.C1"/>
                        <el-color-picker show-alpha v-model="scope.row.C2"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="onClick">Default</el-button>
    </div>
    <button @click="readMDX" v-else>读取模型</button>
</template>

<style scoped>
    .box-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>