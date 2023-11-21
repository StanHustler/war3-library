<script setup lang="ts">
    import fs from "fs";
    import {ModelRenderer, parseMDX} from "war3-model";
    import { vec3, mat4, quat } from 'gl-matrix';

    let model;
    let modelRenderer: ModelRenderer;

    let canvas: HTMLCanvasElement;
    let gl: WebGLRenderingContext;

    const pMatrix = mat4.create();
    const mvMatrix = mat4.create();

    let cameraTheta = Math.PI / 4;
    let cameraPhi = 0;
    let cameraDistance = 500;
    let cameraTargetZ = 50;
    let wireframe = false;
    let showSkeleton = false;
    let skeletonNodes: string[] | null = null;
    const cameraBasePos: vec3 = vec3.create();
    const cameraPos: vec3 = vec3.create();
    const cameraPosTemp: vec3 = vec3.create();
    const cameraTarget: vec3 = vec3.create();
    const cameraUp: vec3 = vec3.fromValues(0, 0, 1);
    const cameraQuat: quat = quat.create();

    fs.readFile("/Users/stan/Desktop/暗影/test/[TX][JN]AY-SWXW.mdx", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        model = parseMDX(data.buffer)
        console.log(model)

        canvas = document.querySelector('canvas');
        gl = canvas.getContext('webgl');

        modelRenderer = new ModelRenderer(model);
        console.log(modelRenderer)
        modelRenderer.setTeamColor(parseColor('#FF0000'));
        initGL()
        modelRenderer.initGL(gl);

        for (let i of model.Textures){
            if (i.Image){
                loadTexture("/src/assets/empty.png", i.Image, 0)
            }
        }

        modelRenderer.setCamera(cameraPos, cameraQuat);
        modelRenderer.render(mvMatrix, pMatrix, {wireframe: false});
    })



    let ddsExt: WEBGL_compressed_texture_s3tc | null = null;
    let rgtcExt: EXT_texture_compression_rgtc | null = null;
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

    function loadTexture(src: string, textureName: string, flags) {
        const img = new Image();

        img.onload = () => {
            modelRenderer.setTextureImage(textureName, img, flags);

            handleLoadedTexture();
        };
        img.src = src;
    }

    function parseColor(value: string): vec3 {
        const val = value.slice(1);

        return vec3.fromValues(
            parseInt(val.slice(0, 2), 16) / 255,
            parseInt(val.slice(2, 4), 16) / 255,
            parseInt(val.slice(4, 6), 16) / 255
        );
    }


    let started = false;
    function handleLoadedTexture(): void {
        if (!started) {
            started = true;
            requestAnimationFrame(tick);
        }
    }
    function tick(timestamp: number) {
        requestAnimationFrame(tick);
        updateModel(timestamp);
        drawScene();
    }
    let start;
    function updateModel(timestamp: number) {
        if (!start) {
            start = timestamp;
        }
        const delta = timestamp - start;
        // delta /= 10;
        start = timestamp;

        modelRenderer.update(delta);
    }
    function drawScene() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 10000.0);

        vec3.set(
            cameraBasePos,
            Math.cos(cameraTheta) * Math.cos(cameraPhi) * cameraDistance,
            Math.cos(cameraTheta) * Math.sin(cameraPhi) * cameraDistance,
            Math.sin(cameraTheta) * cameraDistance
        );
        cameraTarget[2] = cameraTargetZ;

        vec3RotateZ(cameraPos, cameraBasePos, window['angle'] || 0);
        mat4.lookAt(mvMatrix, cameraPos, cameraTarget, cameraUp);

        calcCameraQuat();

        modelRenderer.setCamera(cameraPos, cameraQuat);
        modelRenderer.render(mvMatrix, pMatrix, {
            wireframe
        });

        if (showSkeleton) {
            modelRenderer.renderSkeleton(mvMatrix, pMatrix, skeletonNodes);
        }
    }

    function vec3RotateZ (out: vec3, a: vec3, c: number): vec3 {
        out[0] = a[0] * Math.cos(c) - a[1] * Math.sin(c);
        out[1] = a[0] * Math.sin(c) + a[1] * Math.cos(c);
        out[2] = a[2];

        return out;
    }

    const cameraPosProjected: vec3 = vec3.create();
    const verticalQuat: quat = quat.create();
    const fromCameraBaseVec: vec3 = vec3.fromValues(1, 0, 0);
    function calcCameraQuat() {
        vec3.set(cameraPosProjected, cameraPos[0], cameraPos[1], 0);
        vec3.subtract(cameraPosTemp, cameraPos, cameraTarget);
        vec3.normalize(cameraPosProjected, cameraPosProjected);
        vec3.normalize(cameraPosTemp, cameraPosTemp);

        quat.rotationTo(cameraQuat, fromCameraBaseVec, cameraPosProjected);
        quat.rotationTo(verticalQuat, cameraPosProjected, cameraPosTemp);
        quat.mul(cameraQuat, verticalQuat, cameraQuat);
    }



</script>

<template>
    <canvas width="200" height="200" />
</template>

<style scoped>

</style>