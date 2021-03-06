import {
    TeapotGeometry
} from "./lib/TeapotGeometry.js";

import {
    BoxLineGeometry
} from "./lib/BoxLineGeometry.js";

import {
    TransformControls
} from "./lib/TransformControls.js";

//Define basic scene objs
var scene, camera, renderer;
var cameraHelper;
var mesh, texture;
var material = getMaterial('standard', 'rgb(255, 255, 255)');

var pointMaterial = false;
var specialMaterial, preMaterial = false,
    isBuffer = false;
var backgroundTexture;
var planeMaterial;
var time = 0,
    delta = 0;

material.needsUpdate = true;

//Define gui and controls elements
//Basic params for TextGeometry


//Define params for points material
var positions = [],
    colors = [];


// var gui = new dat.GUI({autoPlace: false});
var gui = new dat.GUI();

var control, orbit, gridHelper;
var mouse = new THREE.Vector2();

var planeFolder, objectFolder, AMBLightFolder, PLightFolder, cameraFolder, SLightFolder, materialFolder;

//All about the lights
var raycaster, PointLightHelper, meshPlane, light, ambientLight, SpotLightHelper;

// sphereMaterial.envMap = reflectionCube;


// // Adding the stat panel
// var stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);


//Define basic Gemetry

var type_material;

var TextGeometry, BufferGeometry;
var PlaneGeometry = new THREE.PlaneGeometry(500, 500);

init();


function init() {
    // Scene
    scene = createScene();

    //Camera 
    camera = createCamera();

    renderer = createRenderer();
    document.body.appendChild(renderer.domElement);

    cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'x', -1000, 1000);
    cameraFolder.add(camera.position, 'y', -1000, 1000);
    cameraFolder.add(camera.position, 'z', -1000, 1000);


    cameraFolder.add(camera, 'fov', 0, 180)
        .onChange(function (value) {
            changeFOV(value);
        })

    cameraFolder.add(camera, 'near', 0.1, 450)
        .onChange(function (value) {
            changeNear(value);
        });

    cameraFolder.add(camera, 'far', 500, 20000)
        .onChange(function (value) {
            changeFar(value);
        });

    cameraFolder.open()

    //Orbit Controls
    orbit = new THREE.OrbitControls(camera, renderer.domElement);

    control = new TransformControls(camera, renderer.domElement);
    control.name = 'control';
    control.addEventListener('change', nothing);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    })
    update();

}

function nothing(){

}

function createCamera(x = 300, y = 400, z = 400) {
    // Create a Camera
    const fov = 25; // AKA Field of View
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1; // the near clipping plane
    const far = 1000; // the far clipping plane

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(x, y, z);
    // camera.lookAt(scene.position);

    return camera;
}

function createScene() {
    var scene = new THREE.Scene();
    scene.name = 'scene';
    scene.autoUpdate = true;
    scene.background = new THREE.Color('#787878');
    return scene;
}


function createRenderer() {
    // var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('rgb(120, 120, 120)');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;



    return renderer;
}

function update() {
    renderer.render(
        scene,
        camera
    );

    orbit.update();

    requestAnimationFrame(function () {
        update(renderer, scene, camera, orbit);
    })
}



window.changeFOV = function (value = false) {
    if (!value) {
        var value = document.getElementById("FOV").value;
        camera.fov = Number(value);
        camera.updateProjectionMatrix();
    } else {
        camera.fov = value;
        camera.updateProjectionMatrix();
    }
}

window.changeNear = function (value = false) {
    if (!value) {
        var value = document.getElementById("Near").value;
        camera.near = Number(value);
        camera.updateProjectionMatrix();
    } else {
        camera.near = value;
        camera.updateProjectionMatrix();
    }
}

window.changeFar = function (value = false) {
    if (!value) {
        var value = document.getElementById("Far").value;
        camera.far = Number(value);
        camera.updateProjectionMatrix();
    } else {
        camera.far = value;
        camera.updateProjectionMatrix();
    }
}


window.renderGeometry = function (id, fontName = 'Tahoma') {
    // Setting the main-obj geometry

    mesh = scene.getObjectByName('main-obj');
    scene.remove(mesh);
    if (mesh) {
        gui.removeFolder(objectFolder);
    }


    mesh_geometry = getGeo(id);
    mesh_geometry.name = id;
    if (pointMaterial)
        mesh = new THREE.Points(mesh_geometry, material);
    else
        mesh = new THREE.Mesh(mesh_geometry, material);

    scene.add(mesh);
    mesh.name = 'main-obj';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    control_transform(mesh);


    //Adding GUI for control 
    objectFolder = gui.addFolder('Object');

    // Change mesh color

    objectFolder.add(mesh, 'visible');
    if (mesh.geometry.parameters) {
        for (let i of Object.keys(mesh.geometry.parameters)) {
            objectFolder.add(obj_params, i)
                .onChange(function (value) {
                    renderGeometry(mesh_geometry.name)
                })
        }
    }

    if (id == 'tea-pot') {
        for (let i of Object.keys(teapot_params)) {
            objectFolder.add(obj_params, i)
                .onChange(function (value) {
                    renderGeometry(mesh_geometry.name)
                })
        }
    }


    if (id == 'boxline') {
        for (let i of Object.keys(boxline_params)) {
            objectFolder.add(obj_params, i)
                .onChange(function (value) {
                    renderGeometry(mesh_geometry.name)
                })
        }
    }


    objectFolder.open();

    // Adding controls on material type
    if (materialFolder) {
        gui.removeFolder(materialFolder);
    }
    materialFolder = gui.addFolder('Material');
    materialFolder.addColor(obj_material, 'color')
        .onChange(function (value) {
            mesh.material.color.set(new THREE.Color(obj_material.color));
            mesh.material.needsUpdate = true;
        });
    materialFolder.add(obj_material, 'metalness', 0, 1.0)
        .onChange(function (value) {
            material.metalness = value;
            mesh.material.metalness = value;
            mesh.material.needsUpdate = true;
        })
    materialFolder.add(obj_material, 'roughness', 0, 1.0)
        .onChange(function (value) {
            material.roughness = value;
            mesh.material.roughness = value;
            mesh.material.needsUpdate = true;
        })
    materialFolder.add(obj_material, 'wireframe')
        .onChange(function (value) {
            material.wireframe = value;
            mesh.material.wireframe = value;
            mesh.material.needsUpdate = true;
        });
    materialFolder.add(obj_material, 'refractionRatio', 0, 1.0)
        .onChange(function (value) {
            material.refractionRatio = value;
            mesh.material.refractionRatio = value;
            mesh.material.needsUpdate = true;

        });
    materialFolder.add(obj_material, 'metalTexture', ['metal', 'rock'])
        .onChange(function (value) {   
            setTexture(value, 'main-obj');
        })

    materialFolder.open();

}

function getGeo(id) {
    switch (id) {
        case 'box':
            return new THREE.BoxGeometry(obj_params['width'], obj_params['height'], obj_params['depth'], obj_params['widthSegments'], obj_params['heightSegments'], obj_params['depthSegments'])

        case 'sphere':
            return new THREE.SphereGeometry(obj_params['radius'], obj_params['widthSegments'], obj_params['heightSegments']);

        case 'cone':
            return new THREE.ConeGeometry(obj_params['radius'], obj_params['height'], obj_params['radialSegments'], obj_params['heightSegments']);

        case 'cylinder':
            return new THREE.CylinderGeometry(obj_params['radiusTop'], obj_params['radiusBottom'], obj_params['height'], obj_params['radialSegments'])

        case 'torus':
            return new THREE.TorusGeometry(obj_params['width'], obj_params['tube'], obj_params['radialSegments'], obj_params['tubularSegments'])

        case 'tea-pot':
            return new TeapotGeometry(obj_params['size'], obj_params['segments'])
        case 'octa':
            return new THREE.OctahedronGeometry(obj_params['radius'], obj_params['detail'])

        case 'tetra':
            return new THREE.TetrahedronGeometry(obj_params['radius'], obj_params['detail'])
        case 'boxline':
            return new BoxLineGeometry(obj_params['width'], obj_params['height'], obj_params['depth'], obj_params['widthSegments'], obj_params['heightSegments']);
    }
}

window.setMaterial = function (mat = 'point', obj = 'main-obj', color = '#B6371C', size = 3, wireframe = true, transparent = true) {
    // Getting the current main-obj on screen and setting it with the chosen material 
    type_material = mat;
    light = scene.getObjectByName('light');
    color = new THREE.Color(color);

    if (obj == 'main-obj') {
        // If this is setMaterial for main-obj
        mesh = scene.getObjectByName('main-obj');

        if (mesh) {
            var dummy_mesh = mesh.clone();
            scene.remove(mesh);
            console.log(type_material);

            switch (type_material) {
                case 'standard':
                    material = new THREE.MeshStandardMaterial({
                        color: obj_material['color'],
                        side: obj_material['side']
                    });
                    pointMaterial = false;
                    break;
                case 'point':
                    material = new THREE.PointsMaterial({
                        size: obj_material['size'],
                        vertexColors: true,
                        side: obj_material['side'],
                        color: obj_material['color']
                    });
                    pointMaterial = true;
                    break;

                case 'wireframe':
                    material = new THREE.MeshStandardMaterial({
                        color: obj_material['color'],
                        wireframe: true,
                        side: obj_material['side']
                    });
                    obj_material['wireframe'] = true;
                    pointMaterial = false;
                    break;

                case 'normal':
                    material = new THREE.MeshNormalMaterial({
                        color: obj_material['color'],
                        side: obj_material['side']
                    });
                    pointMaterial = false;
                    break;
                case 'basic':
                    material = new THREE.MeshBasicMaterial({
                        color: obj_material['color'],
                        side: obj_material['side']
                    });
                    pointMaterial = false;
                    break;
                default:
                    material = new THREE.MeshStandardMaterial({
                        color: obj_material['color'],
                        side: obj_material['side']
                    });

            }

            if (mat == 'point') {
                mesh = new THREE.Points(dummy_mesh.geometry, material);
            } else {
                mesh = new THREE.Mesh(dummy_mesh.geometry, material);
            }
            CloneMesh(dummy_mesh);
            update();

        }
    } else if (obj == 'plane') {
        meshPlane = scene.getObjectByName('plane');
        if (plane) {
            var dummy_plane = meshPlane.clone();
            scene.remove(meshPlane);

            switch (type_material) {
                case 'lambert':
                    planeMaterial = new THREE.MeshLambertMaterial({
                        map: texture,
                        color: params.color,
                        side: THREE.DoubleSide
                    });
                    break;
                default:
                    planeMaterial = new THREE.MeshStandardMaterial({
                        color: params.color,
                        side: THREE.DoubleSide
                    });
            }
            meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);
            CloneMesh(dummy_plane, meshPlane);
        }
    }
}



function CloneMesh(dummy_mesh, obj = mesh) {
    // Inherit all name, position and animation that is currently on the old mesh 
    // Put it on the new one
    obj.name = dummy_mesh.name;
    obj.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
    obj.rotation.set(dummy_mesh.rotation.x, dummy_mesh.rotation.y, dummy_mesh.rotation.z);
    obj.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
    obj.castShadow = true;
    obj.receiveShadow = true;
    scene.add(obj);
    control_transform(obj);
}


//Point Lights

function createPointLight(color = 0xffffff, intensity = 2, name = 'light') {
    var light = new THREE.PointLight(new THREE.Color(color), intensity);
    light.castShadow = true;
    light.position.set(0, 250, 0);

    light.name = name;

    return light
}

var pLight_params = {
    color: 0xffffff,
    decay: 1,
    intensity: 2
}

window.setPointLight = function () {
    light = scene.getObjectByName('light');

    if (light)
        removeLight();

    light = createPointLight();
    scene.add(light);
    control_transform(light);

    PointLightHelper = new THREE.PointLightHelper(light);
    PointLightHelper.name = 'pointlight-helper';
    scene.add(PointLightHelper);

    PLightFolder = gui.addFolder('PointLight');
    PLightFolder.addColor(pLight_params, 'color')
        .onChange(function () {
            light.color.set(new THREE.Color(pLight_params.color))
        })
    PLightFolder.add(light, 'intensity', 0, 10)
        .onChange(function (value) {
            light.intensity = value;
        })
        PLightFolder.add(light.position, 'x', 0, 200)
        PLightFolder.add(light.position, 'y', 0, 200)
        PLightFolder.add(light.position, 'z', 0, 200)
        PLightFolder.add(light, 'castShadow');

    // render();

}

window.removeLight = function() {
    if(control.object) {
        if(control.object.name == 'light')
            // What if there is not mesh there
            var len = scene.children.length;
            for (var i of scene.children) {
                len--;
                if(i.name == 'main-obj' || i.name == 'plane') {
                    control.object = i;
                    break;
                } 
                if(len == 0) 
                    control.detach();
            }
    }
    
    // Remove light folder
    for(let [key, value] of Object.entries(gui.__folders)) {
        if(value.name == 'PointLight' || value.name == 'SpotLight') {
            gui.removeFolder(value);
        }
    }

    // Remove helper from scene
    for(let i of scene.children) {
        if(i.name == 'spotlight-helper' || i.name == 'pointlight-helper') {
            scene.remove(i)
        }
    }

    // Remove light
    scene.remove(light);

}

// SpotLightHelper Light
var sLight_params = {
    color: 0xffffff,
    intensity: 2
}

function createSpotLight(color = 0xffffff, intensity = 2, decay = 1, name = 'light') {
    var light = new THREE.SpotLight(new THREE.Color(color), intensity = intensity);
    light.castShadow = true;
    light.position.set(0, 250, 0);
    light.name = name;

    return light;
}

window.setSpotLight = function () {
    light = scene.getObjectByName('light');

    if (light)
        removeLight();

    console.log(gui);

    light = createSpotLight();
    scene.add(light);
    control_transform(light);

    SpotLightHelper = new THREE.SpotLightHelper(light);
    SpotLightHelper.name = 'spotlight-helper';
    scene.add(SpotLightHelper);

    SLightFolder = gui.addFolder('SpotLight');
    SLightFolder.addColor(sLight_params, 'color')
        .onChange(function () {
            light.color.set(new THREE.Color(sLight_params.color))
        })
    SLightFolder.add(light, 'intensity', 0, 10)
        .onChange(function (value) {
            light.intensity = value;
        });

    SLightFolder.add(light.position, 'x', 0, 200)
    SLightFolder.add(light.position, 'y', 0, 200)
    SLightFolder.add(light.position, 'z', 0, 200)
    SLightFolder.add(light, 'castShadow');
    SLightFolder.open();

}

//Ambient Light
var AMBDefault = {
    color: 0x404040,
}

function createAmbientLight(color = 0x404040, intensity = 5) {
    var name = 'ambient-light';
    ambientLight = new THREE.AmbientLight(color, intensity);
    ambientLight.name = name;
    return ambientLight
}

window.setAmbientLight = function () {
    ambientLight = createAmbientLight();
    scene.add(ambientLight);

    AMBLightFolder = gui.addFolder('Ambient Light');
    AMBLightFolder.addColor(AMBDefault, 'color')
        .onChange(function () {
            ambientLight.color.set(new THREE.Color(AMBDefault.color));
        })

    AMBLightFolder.add(ambientLight, 'intensity', 0, 10, 0.1);
}

window.removeAmbientLight = function () {
    gui.removeFolder(AMBLightFolder);
    scene.remove(ambientLight);
}

window.displayAmbient = function () {
    var checked = document.querySelector('input[id="ambient"]:checked');
    if (checked) {
        console.log('Turn on ambient');
        setAmbientLight();
    } else {
        console.log("Turn off ambient");
        removeAmbientLight();
    }
}

// Why it's not change anything?

var params = {
    color: 0xffffff,
}

window.displayPlane = function() {
    var checked = document.querySelector('input[id="plane"]:checked');
    if(checked) {
        //console.log('checked');
        //Adding Plane to current env
        planeMaterial = new THREE.MeshPhongMaterial(params);
        planeMaterial.side = THREE.DoubleSide;
        meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);

        meshPlane.receiveShadow = true;
        meshPlane.castShadow = true;

        meshPlane.rotation.x -= Math.PI / 2;
        meshPlane.position.y = -150
        meshPlane.name = 'plane'
        scene.add(meshPlane);
        control_transform(meshPlane);


        planeFolder = gui.addFolder('Plane');
        planeFolder.addColor( params, 'color')
            .onChange( function() { 
                meshPlane.material.color.set( new THREE.Color(params.color) );
                meshPlane.material.needsUpdate = true;
            });
        ;
        planeFolder.add(obj_material, 'metalTexture', ['lava'])
        .onChange(function (value) {   
            setTexture(value, 'plane');
            meshPlane.material.needsUpdate = true;
        })
    }
    else {
        meshPlane = scene.getObjectByName('plane');
        if (meshPlane) {
            gui.removeFolder(planeFolder);
            control.detach();
            scene.remove(meshPlane);
        }
    }
}

// Animation and controls

function control_transform(mesh) {
    control.attach(mesh);
    scene.add(control);

    text = 'T for translate, R for rotate, S for scale, L for Point Light ON, press spacebar for turn Point/Spot Light OFF, right click on object to move control.'
    addTexttoHeader(text);

    document.addEventListener('keydown', function (event) {
        console.log(event.key)
        switch (event.key) {
            case 't': // T
                control.setMode("translate")
                break;
            case 'r': // R
                control.setMode("rotate")
                break;
            case 's': // S
                control.setMode("scale")
                break;
            case 'l': // L
                setPointLight(); 
                break;
            case ' ': // spacebar
                removeLight(); 
                break;
        }
    });
}

//Define text on header;
var text = 'Project'
addTexttoHeader(text, 'auxiliary');

// Auxiliary function
function addTexttoHeader(text = 'Hello Word', id='auxiliary'){
    var already = document.getElementById(id);
    if (already.innerHTML) 
        already.textContent = text
    else
        {
            var element = document.createElement('a');
            element.href = './index.html'
            element.className = 'title';
            element.innerText = text;
            already.appendChild(element)
        }
}

var metalTextureDic = {
    "metal": { map: './docs/assets/Metal_006_SD-20220630T113315Z-001/Metal_006_SD/Metal_006_ambientOcclusion.jpg', 
    roughnessMap: './docs/assets/Metal_006_SD-20220630T113315Z-001/Metal_006_SD/Metal_006_roughness.jpg'},
    "rock": { map: './docs/assets/Rock_047_SD-20220630T113312Z-001/Rock_047_SD/Rock_047_Height.png', 
    roughnessMap: './docs/assets/Rock_047_SD-20220630T113312Z-001/Rock_047_SD/Rock_047_Roughness.jpg'},
}

window.setTexture = function(value, obj='main-obj') {
    mesh = scene.getObjectByName('main-obj');
    meshPlane = scene.getObjectByName('plane');
    var loader = new THREE.TextureLoader();

    if(obj == 'main-obj') {  
        if(mesh) {
            material.map = loader.load(metalTextureDic[value].map);
            // material.bumpMap = loader.load('./docs/assets/conce.jpg');
            material.roughnessMap = loader.load(metalTextureDic[value].roughnessMap);
            material.metalness = 0.1;
            material.bumScale = 0.01;
            material.roughness = 0.7;
            mesh.material.needsUpdate = true;
        }
    }
    if(obj == 'plane') {
        if(meshPlane) {
            planeMaterial.map = loader.load('./docs/assets/Lava_005_COLOR.jpg');
            // material.bumpMap = loader.load('./docs/assets/conce.jpg');
            planeMaterial.metalness = 0.1;
            planeMaterial.bumScale = 0.01;
            planeMaterial.roughness = 0.7;
            meshPlane.material.needsUpdate = true;
        }
    }
    if(obj == 'background') {
        backgroundTexture = new THREE.TextureLoader();
        backgroundTexture.load(url, function(texture) {
            scene.background = texture;
        })
    }

}


function getMaterial(type, color) {
    var selectedMaterial;
    var materialOptions = {
        color: color === undefined ? 'rgb(7, 12, 212)' : color,
        side: THREE.DoubleSide,
    }
    switch (type) {
        case 'basic':
            selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
            break;
    }
    return selectedMaterial;
}



var ax = 0.01, ay=0.01, az=0.01;

window.initBasicAnimation = function() {
    // See if any box of animation has been checked
    var ani1 = document.querySelector('input[id="ani1"]:checked');
    var ani2 = document.querySelector('input[id="ani2"]:checked');
    var ani3 = document.querySelector('input[id="ani3"]:checked');

    var mesh = scene.getObjectByName('main-obj');
    if(mesh) {
        if(ani1) {
            mesh.rotation.x += ax;
        }
        else{
            mesh.rotation.x = 0;
        }

        if(ani2){
            mesh.rotation.y += ay;
        }
        else {
            mesh.rotation.y = 0;
        }

        if(ani3){
            mesh.rotation.z += az;
        }
        else {
            mesh.rotation.z = 0;
        }
        

    }
    requestAnimationFrame(initBasicAnimation)
}
