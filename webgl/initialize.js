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

function initAttribsAndUniforms(program) {
    gl.useProgram(program);

    var vertexPositionAttribute =
        gl.getAttribLocation(program, "aVertexPosition");
    if (vertexPositionAttribute >= 0) {
        program.vertexPositionAttribute = vertexPositionAttribute;
    }

    var vertexNormalAttribute =
        gl.getAttribLocation(program, "aVertexNormal");
    if (vertexNormalAttribute >= 0) {
        program.vertexNormalAttribute = vertexNormalAttribute;
    }

    var textureCoordAttribute =
        gl.getAttribLocation(program, "aTextureCoord");
    if (textureCoordAttribute >= 0) {
        program.textureCoordAttribute = textureCoordAttribute;
    }

    var pMatrixUniform =
        gl.getUniformLocation(program, "uPMatrix");
    if (pMatrixUniform != null) {
        program.pMatrixUniform = pMatrixUniform;
    }

    var mvMatrixUniform =
        gl.getUniformLocation(program, "uMVMatrix");
    if (mvMatrixUniform != null) {
        program.mvMatrixUniform = mvMatrixUniform;
    }

    var nMatrixUniform =
        gl.getUniformLocation(program, "uNMatrix");
    if (nMatrixUniform != null) {
        program.nMatrixUniform = nMatrixUniform;
    }

    var samplerUniform =
        gl.getUniformLocation(program, "uSampler");
    if (samplerUniform != null) {
        program.samplerUniform = samplerUniform;
    }
}

function initShader(frag, vert) {
    var fragmentShader = getShader(gl, frag);
    var vertexShader = getShader(gl, vert);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    initAttribsAndUniforms(program);
    return program;
}


function initShaders() {
    shaderProgram = initShader("toon-phong-fs", "toon-phong-vs");

    gl.useProgram(shaderProgram);

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

    outlineShaderProgram = initShader("outline-fs", "outline-vs");
    skyboxShaderProgram = initShader("skybox-fs", "skybox-vs");
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
    initTexture(app.models.bread, "Bread.png");
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
