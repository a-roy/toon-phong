function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, app.pMatrix);
    vec3.negate(app.camera.position, app.camera.inversePosition);

    mat4.identity(app.mvMatrix);

    mat4.rotate(app.mvMatrix, degToRad(app.camera.pitch), [1, 0, 0]);
    mat4.rotate(app.mvMatrix, degToRad(app.camera.heading), [0, 1, 0]);
    mvPushMatrix();
      mat4.scale(app.mvMatrix, [200, 200, 200]);
      drawSkybox();
    mvPopMatrix();
    mat4.translate(app.mvMatrix, app.camera.inversePosition);

    mvPushMatrix();
      mat4.translate(app.mvMatrix, [5, 0, -1]);
      drawObject(app.models.teapot);
    mvPopMatrix();
    mvPushMatrix();
      mat4.translate(app.mvMatrix, [-1, 2.7, -1]);
      drawObject(app.models.mickey);
    mvPopMatrix();
    mvPushMatrix();
      mat4.translate(app.mvMatrix, [0, -4, 0]);
      drawObject(app.models.palms);
    mvPopMatrix();
}

app.drawScene = drawScene;
