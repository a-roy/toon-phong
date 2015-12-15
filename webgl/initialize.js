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
    var fragmentShader_s = getShader(gl, "skybox-fs");
    var vertexShader_s = getShader(gl, "skybox-vs");

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

    // skybox shader
    skyboxShaderProgram = gl.createProgram();
    gl.attachShader(skyboxShaderProgram, vertexShader_s);
    gl.attachShader(skyboxShaderProgram, fragmentShader_s);
    gl.linkProgram(skyboxShaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    else if (!gl.getProgramParameter(outlineShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    else if (!gl.getProgramParameter(skyboxShaderProgram, gl.LINK_STATUS)) {
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
    shaderProgram.splitUniform =
        gl.getUniformLocation(shaderProgram, "uSplit");
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

    // skybox shader
    gl.useProgram(skyboxShaderProgram);

    skyboxShaderProgram.vertexPositionAttribute =
        gl.getAttribLocation(skyboxShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(skyboxShaderProgram.vertexPositionAttribute);
    skyboxShaderProgram.pMatrixUniform =
        gl.getUniformLocation(skyboxShaderProgram, "uPMatrix");
    skyboxShaderProgram.mvMatrixUniform =
        gl.getUniformLocation(skyboxShaderProgram, "uMVMatrix");
    skyboxShaderProgram.samplerUniform =
        gl.getUniformLocation(skyboxShaderProgram, "uSampler");
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

function initCubeMap(object, urls) {
    var ct = 0;
    var img = new Array(6);
    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function() {
            ct++;
            if (ct == 6) {
                object.cubemap = gl.createTexture();
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, object.cubemap);
                var targets = [
                   gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ];
                for (var j = 0; j < 6; j++) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
        }
        img[i].src = urls[i];
    }
}

function initTextures() {
    initTexture(app.models.mickey, "Mickey_Mouse_D.png");
    initTexture(app.models.palms, "Palms.png");
    initCubeMap(app.models.skybox, [
            "sb_strato/stratosphere_ft.png", "sb_strato/stratosphere_bk.png",
            "sb_strato/stratosphere_dn.png", "sb_strato/stratosphere_up.png",
            "sb_strato/stratosphere_rt.png", "sb_strato/stratosphere_lf.png"
            ]);
}

function loadSkybox() {
    var coords = [];
    var normals = [];
    var texCoords = [];
    var indices = [];
    function face(xyz, nrm) {
       var start = coords.length/3;
       var i;
       for (i = 0; i < 12; i++) {
          coords.push(xyz[i]);
       }
       for (i = 0; i < 4; i++) {
          normals.push(nrm[0],nrm[1],nrm[2]);
       }
       texCoords.push(0,0,1,0,1,1,0,1);
       indices.push(start,start+1,start+2,start,start+2,start+3);
    }
    face( [-1,-1,1, 1,-1,1, 1,1,1, -1,1,1], [0,0,1] );
    face( [-1,-1,-1, -1,1,-1, 1,1,-1, 1,-1,-1], [0,0,-1] );
    face( [-1,1,-1, -1,1,1, 1,1,1, 1,1,-1], [0,1,0] );
    face( [-1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,1], [0,-1,0] );
    face( [1,-1,-1, 1,1,-1, 1,1,1, 1,-1,1], [1,0,0] );
    face( [-1,-1,-1, -1,-1,1, -1,1,1, -1,1,-1], [-1,0,0] );
    app.meshes['skybox'] = {
       vertices: coords,
       vertexNormals: normals,
       textures: texCoords,
       indices: indices
    };
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
