<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX, generateMDX} from 'war3-model';


import {defineComponent, onMounted, ref} from "vue";
    import * as fs from "fs";
import {ValueLib} from "../lib/valueLib";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";

let filePath
let fileDir

let model
let nodeProperty = ref();
let geoProperty = ref();

let idxMapper = new Map()
let pageSelect = ref("0")

let openDialog = ref(false)

let groupProperty = ref()
let color = ref()

const clr = ['C0', 'C1', 'C2']

const handleUpload: UploadProps['beforeUpload'] = (rawFile) => {
    filePath = rawFile.path
    fileDir = filePath.slice(0,filePath.length - rawFile.name.length)
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
                        "C0": ValueLib.colorFA2Rgb(i.SegmentColor[0]),
                        "C1": ValueLib.colorFA2Rgb(i.SegmentColor[1]),
                        "C2": ValueLib.colorFA2Rgb(i.SegmentColor[2]),
                    })
                    idxMapper[idx] = res.length -1
                }
            }
            nodeProperty.value = res
            idx = 0
            geoProperty.value = model.GeosetAnims.map((row)=>{
                return {
                    "idx": idx++,
                    "Color" : ValueLib.colorFA2Rgb(row.Color),
                }
            })
        })

    }

    readMDX()

    return false
}

const onClick = () => {
    for (let i of nodeProperty.value) {
        let node = model.Nodes[i.idx]
        let rgba0 = ValueLib.colorRgb2FA(i.C0)
        let rgba1 = ValueLib.colorRgb2FA(i.C1)
        let rgba2 = ValueLib.colorRgb2FA(i.C2)
        node.SegmentColor= [rgba0, rgba1, rgba2]
    }

    for (let j of geoProperty.value) {
        model.GeosetAnims[j.idx].Color = ValueLib.colorRgb2FA(j.Color)
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
    for (let i of nodeProperty.value) {
        for (const c of clr) {
            if (res.has(i[c])) {
                res.get(i[c]).push([i.idx, clr.indexOf(c)]);
            } else {
                res.set(i[c], [[i.idx, clr.indexOf(c)]]);
            }
        }
    }
    for (let i of geoProperty.value) {
        if (res.has(i.Color)) {
            res.get(i.Color).push([i.idx]);
        } else {
            res.set(i.Color, [[i.idx]]);
        }
    }

    groupProperty.value = Array.from(res)
}

const confirm = () => {
    console.log(groupProperty.value)

    for (let [color, posArr] of groupProperty.value) {
        for (let a of posArr){
            if (a.length === 2) {
                nodeProperty.value[idxMapper[a[0]]][clr[a[1]]] = color
            } else {
                geoProperty.value[a[0]].Color = color
            }
        }
    }

    openDialog.value=false
}

</script>

<template>
    <div  v-if="nodeProperty">

        <el-radio-group v-model="pageSelect">
            <el-radio-button label="0"> 模型节点颜色管理 </el-radio-button>
            <el-radio-button label="1"> 多边形动画颜色管理 </el-radio-button>
        </el-radio-group>

        <el-table style="width: 100%" :data="nodeProperty" v-if="pageSelect==='0'">
            <el-table-column prop="Name" label="节点名称"/>
            <el-table-column prop="SegmentColor" label="颜色" >
                <template #default="scope">
                    <div class="box-container">
                        <el-color-picker v-model="scope.row.C0" color-format="rgb"/>
                        <el-color-picker v-model="scope.row.C1" color-format="rgb"/>
                        <el-color-picker v-model="scope.row.C2" color-format="rgb"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <el-table style="width: 100%" :data="geoProperty" v-else>
            <el-table-column prop="idx" label="序号"/>
            <el-table-column prop="Color" label="颜色">
                <template #default="scope">
                    <div class="box-container">
                        <el-color-picker v-model="scope.row.Color" color-format="rgb"/>
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
        <div v-for="(item, index) in groupProperty" :key="index">
            <el-badge :value="item[1].length">
                <el-color-picker color-format="rgb" v-model="item[0]" size="large"/>

            </el-badge>
        </div>

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