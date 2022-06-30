import {
    TeapotGeometry
} from "../lib/TeapotGeometry.js";

import {
    BoxLineGeometry
} from "../lib/BoxLineGeometry.js";
import {
    LatheGeometry
} from "../lib/three.module.js";
//Define basic scene objs
var scene, camera, renderer;
var cameraHelper;
var mesh, texture;
var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});
var defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});
var pointMaterial = false;
var specialMaterial, preMaterial = false,
    isBuffer = false;
var backgroundTexture;
var planeMaterial;
var time = 0,
    delta = 0;
var metalColor = new THREE.Color('#BBA14F');
var setMetalColor = false;

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


// // Adding the stat panel
// var stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);


//Define basic Gemetry

var type_material;

var TextGeometry, BufferGeometry;
var PlaneGeometry = new THREE.PlaneGeometry(2000, 2000);

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

    update();

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

// function createRenderer() {
//     var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//     return renderer;
// }

function createRenderer() {
    // var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('rgb(120, 120, 120)');


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
    // control_transform(mesh);


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
        .onChange(function () {
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
    // materialFolder.add(obj_material, 'metalTexture', ['rose gold', 'gold', 'alu'])
    //     .onChange(function (value) {
    //         var url = metalTextureDic[value][0];
    //         metalColor = metalTextureDic[value][1];
    //         setMetalColor = true;
    //         setTexture(url, 'main-obj', true);
    //     })

    materialFolder.open();

    // render();
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

window.setMaterial = function (mat = 'point', obj = 'main-obj', color = 0xffffff, size = 3, wireframe = true, transparent = true) {
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

                case 'phong':
                    material = new THREE.MeshPhongMaterial({
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

                case 'lambert':
                    if (!light)
                        material = new THREE.MeshBasicMaterial({
                            map: texture,
                            color: obj_material['color'],
                            side: obj_material['side']
                        });
                    else
                        material = new THREE.MeshLambertMaterial({
                            map: texture,
                            color: obj_material['color'],
                            side: obj_material['side']
                        });
                    pointMaterial = false;
                    break;
                case 'metal':
                    if (!setMetalColor) {
                        material = new THREE.MeshPhysicalMaterial({
                            color: obj_material['color'],
                            roughness: 0,
                            metalness: 1,
                            side: obj_material['side']
                        });
                    } else {
                        material = new THREE.MeshPhysicalMaterial({
                            color: metalColor,
                            roughness: 0,
                            metalness: 1,
                            side: obj_material['side']
                        });
                        setMetalColor = false;
                    }

                    material.metalnessMap = texture;
                    material.roughnessMap = texture;
                    material.envMap = envMap;
                    material.envMapIntensity = 1;
                    break;
                default:
                    material = new THREE.MeshPhongMaterial({
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
                        color: color,
                        side: THREE.DoubleSide
                    });
                    break;
                default:
                    planeMaterial = new THREE.MeshPhongMaterial({
                        color: color,
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
    // control_transform(obj);
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
    // control_transform(light);

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
    // render();

}

window.removeLight = function () {


    // Remove light folder
    for (let [key, value] of Object.entries(gui.__folders)) {
        if (value.name == 'PointLight' || value.name == 'SpotLight') {
            gui.removeFolder(value);
        }
    }

    // Remove helper from scene
    for (let i of scene.children) {
        if (i.name == 'spotlight-helper' || i.name == 'pointlight-helper') {
            scene.remove(i)
        }
    }

    // Remove light
    scene.remove(light);

    // render();
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
    // control_transform(light);

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
    // render();

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