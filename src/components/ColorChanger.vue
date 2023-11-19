<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX, generateMDX} from 'war3-model';


import {defineComponent, onMounted, ref} from "vue";
    import * as fs from "fs";
import {ValueLib} from "../lib/valueLib";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";

let filePath
let fileDir

let model
let mdxProperty = ref();
let idxMapper = new Map()

let openDialog = ref(false)
let radio = ref()
let groupProperty = ref()
let color = ref()

const clr = ['C0', 'C1', 'C2']

const handleUpload: UploadProps['beforeUpload'] = (rawFile) => {
    filePath = rawFile.path
    console.log(filePath)
    fileDir = filePath.slice(0,filePath.length - rawFile.name.length)
    console.log(fileDir)
    function readMDX(){
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
                    idxMapper[idx] = res.length -1
                }
            }
            mdxProperty.value = res
        })

    }

    readMDX()

    return false
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
    fs.writeFile(fileDir + 'res.mdx', Buffer.from(res), (err) => {
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

const batchEdit = () =>{

    let res = new Map()

    openDialog.value=true
    for (let i of mdxProperty.value) {
        for (const c of clr) {
            if (res.has(i[c])) {
                res.get(i[c]).push([i.idx, clr.indexOf(c)]);
            } else {
                res.set(i[c], [[i.idx, clr.indexOf(c)]]);
            }
        }
    }

    groupProperty.value = res
}

const confirm = () => {
    if (!radio.value) {
        ElMessage.error('请先选择被修改项')
        return
    }


    for (let i of groupProperty.value.get(radio.value)) {
        mdxProperty.value[idxMapper[i[0]]][clr[i[1]]] = color.value
    }

    openDialog.value=false
}

</script>

<template>
    <div  v-if="mdxProperty">
        <el-table style="width: 100%" :data="mdxProperty">
            <el-table-column prop="Name" label="Name"/>
            <el-table-column prop="SegmentColor" label="SegmentColor" >
                <template #default="scope">
                    <div class="box-container">
                        <el-color-picker show-alpha v-model="scope.row.C0"/>
                        <el-color-picker show-alpha v-model="scope.row.C1"/>
                        <el-color-picker show-alpha v-model="scope.row.C2"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="batchEdit">批量修改</el-button>
        <el-button @click="onClick">导出模型</el-button>
    </div>
    <el-upload :before-upload="handleUpload" drag v-else>
        <div class="el-upload__text" style="height: 300px;display: flex;justify-content:center;align-items:center;">
            拖入文件 或者 <em>点击选择</em>
        </div>
        <template #tip>
            <div class="el-upload__tip">
                目前仅支持MDX格式
            </div>
        </template>
    </el-upload>

    <el-dialog title="批量修改" v-model="openDialog" fullscreen>
        <el-radio-group v-model="radio">
            <el-radio :label="data[0]" v-for="data in groupProperty">
                <el-color-picker show-alpha v-model="data[0]"/>
                X {{data[1].length}}
            </el-radio>
        </el-radio-group>

        <el-divider />

        <el-color-picker show-alpha v-model="color"/>

        <template #footer>
            <el-button type="primary" @click="confirm">确 定</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>
    .box-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
</style>