function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(app.mvMatrix, copy);
    app.mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (app.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    app.mvMatrix = app.mvMatrixStack.pop();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function Array2Buffer(array, iSize, nSize) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
  buffer.itemSize = iSize;
  buffer.numItems = nSize;
  return buffer;
}

function Array2EBuffer(array, iSize, nSize) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
  buffer.itemSize = iSize;
  buffer.numItems = nSize;
  return buffer;
}

function drawHelper(program, model) {
    gl.useProgram(program);
    if ('vertexPositionAttribute' in program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
        gl.vertexAttribPointer(
                program.vertexPositionAttribute,
                model.mesh.vertexBuffer.itemSize,
                gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.vertexPositionAttribute);
    }
    if ('textureCoordAttribute' in program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.textureBuffer);
        gl.vertexAttribPointer(
                program.textureCoordAttribute,
                model.mesh.textureBuffer.itemSize,
                gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.textureCoordAttribute);
    }
    if ('vertexNormalAttribute' in program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
        gl.vertexAttribPointer(
                program.vertexNormalAttribute,
                model.mesh.normalBuffer.itemSize,
                gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.vertexNormalAttribute);
    }
    if ('texture' in model) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.texture);
        gl.uniform1i(program.samplerUniform, 0);
    }
    if ('useTexturesUniform' in program) {
        gl.uniform1i(program.useTexturesUniform, 'texture' in model);
    }
    if ('cubemap' in model) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, model.cubemap);
        gl.uniform1i(program.samplerUniform, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, app.mvMatrix);

    if ('nMatrixUniform' in program) {
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(app.mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(program.nMatrixUniform, false, normalMatrix);
    }
    gl.drawElements(
            gl.TRIANGLES,
            model.mesh.indexBuffer.numItems,
            gl.UNSIGNED_SHORT, 0);
    if ('vertexPositionAttribute' in program) {
        gl.disableVertexAttribArray(program.vertexPositionAttribute);
    }
    if ('textureCoordAttribute' in program) {
        gl.disableVertexAttribArray(program.textureCoordAttribute);
    }
    if ('vertexNormalAttribute' in program) {
        gl.disableVertexAttribArray(program.vertexNormalAttribute);
    }
}

function setupVertices(program, model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
    gl.vertexAttribPointer(
            program.vertexPositionAttribute,
            model.mesh.vertexBuffer.itemSize,
            gl.FLOAT, false, 0, 0);
}

function setupNormals(program, model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
    gl.vertexAttribPointer(
            program.vertexNormalAttribute,
            model.mesh.normalBuffer.itemSize,
            gl.FLOAT, false, 0, 0);
}

function drawFirstPass(model) {
    gl.useProgram(shaderProgram);
    gl.cullFace(gl.BACK);

    var specularHighlights = document.getElementById("specular").checked;
    gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);
    var split = document.getElementById("split").value * 2.0 / 100.0 - 1.0;
    gl.uniform1f(shaderProgram.splitUniform, split);

    gl.uniform3f(
        shaderProgram.ambientColorUniform,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
    );

    gl.uniform3fv(shaderProgram.pointLightingLocationUniform, lightPos);

    gl.uniform3f(
        shaderProgram.pointLightingSpecularColorUniform,
        parseFloat(document.getElementById("specularR").value),
        parseFloat(document.getElementById("specularG").value),
        parseFloat(document.getElementById("specularB").value)
    );

    gl.uniform3f(
        shaderProgram.pointLightingDiffuseColorUniform,
        parseFloat(document.getElementById("diffuseR").value),
        parseFloat(document.getElementById("diffuseG").value),
        parseFloat(document.getElementById("diffuseB").value)
    );

    gl.uniform1f(
            shaderProgram.materialShininessUniform,
            parseFloat(document.getElementById("shininess").value));

    drawHelper(shaderProgram, model);
}

function drawOutlines(model) {
    var split = document.getElementById("split").value;
    gl.scissor(gl.viewportWidth * split / 100, 0, gl.viewportWidth, gl.viewportHeight);
    gl.useProgram(outlineShaderProgram);
    gl.cullFace(gl.FRONT);
    gl.enable(gl.SCISSOR_TEST);
    drawHelper(outlineShaderProgram, model);
    gl.disable(gl.SCISSOR_TEST);
}

function drawSkybox() {
    gl.cullFace(gl.FRONT);
    drawHelper(skyboxShaderProgram, app.models.skybox);
}

function drawObject(model) {
    drawFirstPass(model);
    var outlineEnabled = document.getElementById("outline").checked;
    if (outlineEnabled) {
        drawOutlines(model);
    }
}
