function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


function initShaders() {
    var fragmentShader = getShader(gl, "toon-phong-fs");
    var vertexShader = getShader(gl, "toon-phong-vs");
    var fragmentShader_o = getShader(gl, "outline-fs");
    var vertexShader_o = getShader(gl, "outline-vs");

    // main shader
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // outline shader
    outlineShaderProgram = gl.createProgram();
    gl.attachShader(outlineShaderProgram, vertexShader_o);
    gl.attachShader(outlineShaderProgram, fragmentShader_o);
    gl.linkProgram(outlineShaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    else if (!gl.getProgramParameter(outlineShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    // main shader
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute =
        gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.materialShininessUniform =
        gl.getUniformLocation(shaderProgram, "uMaterialShininess");
    shaderProgram.showSpecularHighlightsUniform =
        gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
    shaderProgram.useTexturesUniform =
        gl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.ambientColorUniform =
        gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform =
        gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingSpecularColorUniform =
        gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
    shaderProgram.pointLightingDiffuseColorUniform =
        gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");

    // outline shader
    gl.useProgram(outlineShaderProgram);

    outlineShaderProgram.vertexPositionAttribute =
        gl.getAttribLocation(outlineShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(outlineShaderProgram.vertexPositionAttribute);
    outlineShaderProgram.vertexNormalAttribute =
        gl.getAttribLocation(outlineShaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(outlineShaderProgram.vertexNormalAttribute);
    outlineShaderProgram.pMatrixUniform =
        gl.getUniformLocation(outlineShaderProgram, "uPMatrix");
    outlineShaderProgram.mvMatrixUniform =
        gl.getUniformLocation(outlineShaderProgram, "uMVMatrix");
    outlineShaderProgram.nMatrixUniform =
        gl.getUniformLocation(outlineShaderProgram, "uNMatrix");
}


function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture(object, url) {
    object.texture = gl.createTexture();
    object.texture.image = new Image();
    object.texture.image.crossOrigin = "anonymous";
    object.texture.image.onload = function() {
        handleLoadedTexture(object.texture);
    }
    object.texture.image.src = url;
}

function initTextures() {
    initTexture(app.models.mickey, "Mickey_Mouse_D.png");
    initTexture(app.models.palms, "Palms.png");
}

function initBuffers() {
  // initialize the mesh's buffers
  for (mesh in app.meshes) {
    OBJ.initMeshBuffers(gl, app.meshes[mesh]);
    // this loops through the mesh names and creates new
    // model objects and setting their mesh to the current mesh
    app.models[mesh] = {};
    app.models[mesh].mesh = app.meshes[mesh];
  }
  //app.models.skylight = {};
  //app.models.skylight.mesh = app.models.room_floor.mesh;
}