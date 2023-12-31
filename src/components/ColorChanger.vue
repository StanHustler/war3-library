<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX, generateMDX} from 'war3-model';


import {defineComponent, onMounted, onUpdated, ref, watch} from "vue";
    import * as fs from "fs";
import {ValueLib} from "../lib/valueLib";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";

const props = defineProps(['fileDir','fileName'])

let model
let nodeProperty = ref();
let geoProperty = ref();

let idxMapper = new Map()
let pageSelect = ref("0")

let openDialog = ref(false)

let groupProperty = ref()
let color = ref()

const clr = ['C0', 'C1', 'C2']
function readMDX(){
    console.log("reading")
    fs.readFile(props.fileDir + props.fileName, (err, data) => {
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

onMounted(()=>{
    readMDX()
})

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
    fs.writeFile(props.fileDir + 'res.mdx', Buffer.from(res), (err) => {
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

const organizeMaterial = ()=>{

    if (new RegExp('[\u4e00-\u9fa5]').test(props.fileName)) {
        ElMessage({
            message: "文件名包含中文",
            type: 'error',
        })
        
        return
    }

    let idx = 0

    const checkTexture = (m) => {
        if (typeof m.s === "string" && m.s.length>0 && m.s.indexOf('.')!==-1) return true
        return m.ReplaceableId !== 0;
    }

    model.Textures.map((m, i) => {
        let path, name
        if (m.Image.indexOf('Textures') == 0 || checkTexture(m)) return
        if (m.Image.indexOf('\\') == -1) {
            [path, name] = ['',m.Image]
        }else {
            [path, name] = m.Image.split('\\')
        }

        const newName = props.fileName.split('.')[0] + '-' + ++idx + '.' + name.split('.')[1]

        const pathStat = fs.statSync(props.fileDir + m.Image)
        fs.renameSync(props.fileDir + m.Image, props.fileDir + newName)

        model.Textures[i].Image = newName
        console.log(model.Textures[i].Image)

        let p = fs.readdirSync(props.fileDir + path);
        if (p && p.length == 0) fs.rmdirSync(props.fileDir + path)
    })

    fs.writeFileSync(props.fileDir + props.fileName, Buffer.from(generateMDX(model)))
    readMDX()

    ElMessage({
        message: "整理完成",
        type: 'success',
    })
}

watch(props,(e)=>{
    readMDX()
})

</script>

<template>
    <div>
        {{props.fileName}}

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

        <el-button @click="organizeMaterial" type="warning">整理贴图</el-button>
        <el-button @click="batchEdit">批量修改</el-button>
        <el-button @click="onClick">导出模型</el-button>
    </div>

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