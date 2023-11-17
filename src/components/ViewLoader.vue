<script setup lang="ts">
import {parseMDL, generateMDL, ModelRenderer, parseMDX} from 'war3-model';
import { vec3, mat4, quat } from 'gl-matrix';
    import {onMounted} from "vue";
    import * as fs from "fs";

let model
let modelRenderer: ModelRenderer;
let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
const pMatrix = mat4.create();
const mvMatrix = mat4.create();
const CLEANUP_NAME_REGEXP = /.*?([^\\/]+)\.\w+$/;
let ddsExt: WEBGL_compressed_texture_s3tc | null = null;
let rgtcExt: EXT_texture_compression_rgtc | null = null;

let start;


function tick(timestamp: number) {
    requestAnimationFrame(tick);
    updateModel(timestamp);
    function updateModel(timestamp: number) {
        if (!start) {
            start = timestamp;
        }
        const delta = timestamp - start;
        // delta /= 10;
        start = timestamp;

        modelRenderer.update(delta);
    }
    // drawScene();
}



onMounted(()=> {
    init();
});


function init() {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    // initControls();
    // initCameraMove();
    // initDragDrop();
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    readModel();
}

function updateCanvasSize() {
    const width = (canvas.parentElement as HTMLElement).offsetWidth;
    const height = (canvas.parentElement as HTMLElement).offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
}

function readModel(){

    const filePath = '/Users/stan/Desktop/暗影/暗影 暗影尖刺/[TX][JN]AY-AYJC.mdx';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        model = parseMDX(data.buffer)

        processModelLoading();
        function processModelLoading() {
            console.log(model);

            modelRenderer = new ModelRenderer(model);
            // modelRenderer.setTeamColor(parseColor(inputColor.value));

            function initGL() {
                if (gl) {
                    return;
                }

                try {
                    const opts: WebGLContextAttributes = {
                        antialias: true,
                        alpha: false
                    };

                    gl = canvas.getContext('webgl2', opts) ||
                        canvas.getContext('webgl', opts) ||
                        canvas.getContext('experimental-webgl', opts) as
                            (WebGL2RenderingContext | WebGLRenderingContext);

                    ddsExt = (
                        gl.getExtension('WEBGL_compressed_texture_s3tc') ||
                        gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                        gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc')
                    );

                    rgtcExt = (
                        gl.getExtension('EXT_texture_compression_rgtc')
                    );

                    gl.clearColor(0.15, 0.15, 0.15, 1.0);
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(gl.LEQUAL);
                } catch (err) {
                    alert(err);
                }
            }
            initGL();
            modelRenderer.initGL(gl);

            function setAnimationList() {
                let list: string[] = model.Sequences.map(seq => seq.Name);

                if (list.length === 0) {
                    list = ['None'];
                }

                const select = document.getElementById('select') as HTMLSelectElement;
                select.innerHTML = '';
                list.forEach((item, index) => {
                    const option = document.createElement('option');
                    option.textContent = item;
                    option.value = String(index);
                    select.appendChild(option);
                });

                const skeleton = document.getElementById('skeleton') as HTMLSelectElement;
                for (const node of model.Nodes) {
                    if (node) {
                        const option = document.createElement('option');
                        option.textContent = node.Name;
                        option.value = node.Name;
                        skeleton.appendChild(option);
                    }
                }
            }
            setAnimationList();

        }


    })


}



</script>

<template>
    <canvas id="canvas" width="300" height="300"></canvas>
    <select id="select"><option>None</option></select>
    <fieldset class="skeleton-group">
        <label>Show skeleton <input type="checkbox" id="show_skeleton"></label>
        <label>Skeleton nodes <select id="skeleton" disabled><option value="*">All</option></select></label>
    </fieldset>
</template>

<style scoped>
canvas {
    width: 300px;
    height: 300px;
}
</style>