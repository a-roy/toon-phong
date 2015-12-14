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

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, app.mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(app.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// not sure if I need these 3
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

function drawBuffer(vpbuf, vcbuf, start, nitems, gltype) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vpbuf);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vpbuf.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vcbuf);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vcbuf.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gltype, start, nitems);
}

function drawFirstPass(model) {
    gl.useProgram(shaderProgram);

    var specularHighlights = document.getElementById("specular").checked;
    gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);

    gl.uniform3f(
        shaderProgram.ambientColorUniform,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
    );

    gl.uniform3f(
        shaderProgram.pointLightingLocationUniform,
        parseFloat(document.getElementById("lightPositionX").value),
        parseFloat(document.getElementById("lightPositionY").value),
        parseFloat(document.getElementById("lightPositionZ").value)
    );

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

    var texture = document.getElementById("texture").value;
    gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

    gl.activeTexture(gl.TEXTURE0);
    if (texture == "earth") {
        gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    } else if (texture == "galvanized") {
        gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
    }
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform1f(
            shaderProgram.materialShininessUniform,
            parseFloat(document.getElementById("shininess").value));

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
    gl.vertexAttribPointer(
            shaderProgram.vertexPositionAttribute,
            model.mesh.vertexBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.textureBuffer);
    gl.vertexAttribPointer(
            shaderProgram.textureCoordAttribute,
            model.mesh.textureBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
    gl.vertexAttribPointer(
            shaderProgram.vertexNormalAttribute,
            model.mesh.normalBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
    setMatrixUniforms();
    gl.cullFace(gl.BACK);
    gl.drawElements(
            gl.TRIANGLES,
            model.mesh.indexBuffer.numItems,
            gl.UNSIGNED_SHORT, 0);
}

function drawOutlines(model) {
    gl.scissor(canvas.offsetWidth / 2, 0, canvas.offsetWidth, canvas.offsetHeight);
    gl.useProgram(outlineShaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
    gl.vertexAttribPointer(
            outlineShaderProgram.vertexPositionAttribute,
            model.mesh.vertexBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
    gl.vertexAttribPointer(
            outlineShaderProgram.vertexNormalAttribute,
            model.mesh.normalBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
    gl.uniformMatrix4fv(outlineShaderProgram.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(outlineShaderProgram.mvMatrixUniform, false, app.mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(app.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(outlineShaderProgram.nMatrixUniform, false, normalMatrix);

    gl.cullFace(gl.FRONT);
    gl.enable(gl.SCISSOR_TEST);
    gl.drawElements(
            gl.TRIANGLES,
            model.mesh.indexBuffer.numItems,
            gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.SCISSOR_TEST);
}

function drawObject(model) {
    drawFirstPass(model);
    var outlineEnabled = document.getElementById("outline").checked;
    if (outlineEnabled) {
        drawOutlines(model);
    }
}
