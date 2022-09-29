"use strict";

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
    const tdBufferInfo = primitives.create3DFWithVertexColorsBufferInfo(gl, 1);
    var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);

    // Properties for each object
    var sphereUniforms = {
        u_colorMult: [0, 0, 0.5, 1],
        u_matrix: m4.identity(),
    };
    var tdUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_matrix: m4.identity(),
    };

    // Translation value to put objects in different places 
    var sphereTranslation = [0, 0, 0];
    var tdTranslation = [50, 0, 0];

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
        var matrix = m4.translate(viewProjectionMatrix,
            translation[0],
            translation[1],
            translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    requestAnimationFrame(drawScene);
    // Create scene
    function drawScene(time) {
        time *= 0.0005;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        var cameraPosition = [0, 0, 110];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var sphereXRotation = time;
        var sphereYRotation = time;
        var tdXRotation = time;
        var tdYRotation = time;

        gl.useProgram(programInfo.program);

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);

        sphereUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            sphereTranslation,
            sphereXRotation,
            sphereYRotation);
        webglUtils.setUniforms(programInfo, sphereUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);
        
        webglUtils.setBuffersAndAttributes(gl, programInfo, tdBufferInfo);
        tdUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            tdTranslation,
            tdYRotation,
            tdXRotation);
            
        webglUtils.setUniforms(programInfo, tdUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, tdBufferInfo.numElements);


        requestAnimationFrame(drawScene);
    }
}
main();