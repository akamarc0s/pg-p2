"use strict";

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    //Criando os buffers dos objetos
    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
    const fBufferInfo = primitives.create3DFWithVertexColorsBufferInfo(gl, 1);
    const coneBufferInfo   = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

    var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);

    //Propriedade dos objetos
    //Esfera
    var sphereUniforms = {
        u_colorMult: [0, 0, 0.5, 1],
        u_matrix: m4.identity(),
    };

    //Letra F
    var fUniforms = {
        u_colorMult: [0.5, 0.5, 1, 1],
        u_matrix: m4.identity(),
    };

    //Cone
    var coneUniforms = {
        u_colorMult: [1, 1, 1, 1],
        u_matrix: m4.identity(),
    };

    //Posicionado os objetos na cena
    var sphereTranslation = [0, 0, 0];
    var fTranslation = [50, 0, 0];
    var coneTranslation = [-50, 20, 30]

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
        var matrix = m4.translate(viewProjectionMatrix,
            translation[0],
            translation[1],
            translation[2],
            translation[3]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    requestAnimationFrame(drawScene);

    //Criando a cena
    function drawScene(speed) {
        speed *= 0.0005;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        //Fala pro WebGl como converter de clip space para pixels 
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        //Limpa o canva e o depth buffer 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Computa a matrix de projeção 
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        //Criando e posicionando a câmera
        var cameraPosition = [0, 0, 110];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        //Velocidade dos eixos dos objetos
        var sphereXRotation = speed;
        var sphereYRotation = speed;
        var fXRotation = speed;
        var fYRotation = speed;
        var coneXRotation = speed;
        var coneYRotation = speed;

        gl.useProgram(programInfo.program);

        //Setando todos os atributos necessarios dos objetos
        //Esfera
        webglUtils.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);

        sphereUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            sphereTranslation,
            sphereXRotation,
            sphereYRotation);
        webglUtils.setUniforms(programInfo, sphereUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, sphereBufferInfo.numElements);

        //Letra F
        webglUtils.setBuffersAndAttributes(gl, programInfo, fBufferInfo);
        fUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            fTranslation,
            fYRotation,
            fXRotation);
            
        webglUtils.setUniforms(programInfo, fUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, fBufferInfo.numElements);

        //Cone
        webglUtils.setBuffersAndAttributes(gl, programInfo, coneBufferInfo);
        coneUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            coneTranslation,
            coneYRotation,
            coneXRotation);
            
        webglUtils.setUniforms(programInfo, coneUniforms);
        gl.drawArrays(gl.TRIANGLES, 0, coneBufferInfo.numElements);


        requestAnimationFrame(drawScene);
    }
}
main();