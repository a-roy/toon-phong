function animate() {
    app.timeNow = new Date().getTime();
    app.elapsed = app.timeNow - app.lastTime;
    if (app.lastTime != 0) {
        if (!app.camera.disable) {
            cameraMove();
        }
    }
    app.lastTime = app.timeNow;
}


function tick() {
    requestAnimFrame(tick);
    app.drawScene();
    animate();
}


function webGLStart(meshes) {
    app.meshes = meshes;
    canvas = document.getElementById("demo-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    initPointerLock();
    initTextures();

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    document.onkeydown = cameraKeyDownHandler;
    document.onkeyup = cameraKeyUpHandler;

    tick();
}

window.onload = function() {
    OBJ.downloadMeshes({
        'teapot':'wt_teapot.obj',
        'mickey':'Mickey_Mouse.obj',
    },
    webGLStart
    );
};
