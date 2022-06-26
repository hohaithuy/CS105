let configGeometry = {
    Sphere: {
        radius: [1, 30],
        widthSegments: [3, 64],
        heightSegments: [2, 32],
        phiStart: [0, 6],
        phiLength: [0, 6],
        thetaStart: [0, 6],
        thetaLength: [0, 6]
    },
    Sphere: {
        // radius: [1, 30],
        widthSegments: [3, 64],
        heightSegments: [2, 32],
        phiStart: [0, 6],
        phiLength: [0, 6],
        thetaStart: [0, 6],
        thetaLength: [0, 6]
    }
}


let geometry = configGeometry.Sphere;
for (var key of Object.keys(geometry)) {
    continue;
    console.log(key + " -> " + geometry[key][0] + "-" + geometry[key][1])
}