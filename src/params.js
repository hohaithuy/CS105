var obj_params = {
    color: 0xffffff,
    font: 'Tahoma',
    size: 100,
    height: 100,
    width: 100,
    depth: 100,
    radius: 80,
    radiusTop: 100,
    radiusBottom: 100,
    tube: 25,
    heightSegments: 20,
    widthSegments: 20,
    depthSegments: 20,
    radialSegments: 20,
    tubularSegments: 20,
    segments: 20,
    detail: 0,
    size: 100,
    curveSegments: 20,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0,
    bevelSegments: 1,
    phiStart: 0,
    phiLength: 0,
    thetaStart: 0,
    thetaEnd: 0,
    thetaLength: 0,
    openEnded: 0,
    arc: 20,
    p: 2,
    q: 3,
}

var obj_material = {
    color: 0xffffff,
    size: 3,
    wireframe: false,
    transparent: false,
    emissive: 0xffffff,
    emissiveIntensity: 1,
    lightMapIntensity: 1,
    metalness: 0,
    roughness: 1.0,
    wireframeLinejoin: 'round',
    wireframeLinewidth: 1,
    side: THREE.DoubleSide,
    vertexColors: true,
    normalMapType: THREE.TangentSpaceNormalMap,
    refractionRatio: 0.98,
    metalTexture: 'rose gold'
}

var teapot_params = {
    size: 50,
    segments: 10,
    // bottom: true,
    // lid: true,
    // body: true,
    // fitLid: true,
    // blinn: true
}

var boxline_params = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1
}

var mesh_geometry;