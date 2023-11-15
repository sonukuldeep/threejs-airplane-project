
let Colors = {
    red: 0xf25346,
    yellow: 0xedeb27,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
    green: 0x458248,
    purple: 0x551A8B,
    lightgreen: 0x629265,
};



let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;


function createScene() {
    // Get the width and height of the screen
    // and use them to setup the aspect ratio
    // of the camera and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene.
    scene = new THREE.Scene();

    // Add FOV Fog effect to the scene. Same colour as the BG int he stylesheet.
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    // Position the camera
    camera.position.x = 0;
    camera.position.y = 150;
    camera.position.z = 100;

    // Create the renderer

    renderer = new THREE.WebGLRenderer({
        // Alpha makes the background transparent, antialias is performant heavy
        alpha: true,
        antialias: true
    });

    //set the size of the renderer to fullscreen
    renderer.setSize(WIDTH, HEIGHT);
    //enable shadow rendering
    renderer.shadowMap.enabled = true;

    // Add the Renderer to the DOM, in the world div.
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    //RESPONSIVE LISTENER
    window.addEventListener('resize', handleWindowResize, false);
}

//RESPONSIVE FUNCTION
function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}


let hemispshereLight, shadowLight;

function createLights() {
    // Gradient coloured light - Sky, Ground, Intensity
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)
    // Parallel rays
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);



    shadowLight.position.set(0, 350, 350);
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -650;
    shadowLight.shadow.camera.right = 650;
    shadowLight.shadow.camera.top = 650;
    shadowLight.shadow.camera.bottom = -650;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // Shadow map size
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // Add the lights to the scene
    scene.add(hemisphereLight);

    scene.add(shadowLight);
}


Land = function () {
    let geom = new THREE.CylinderGeometry(600, 600, 1700, 40, 10);
    //rotate on the x axis
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    //create a material
    let mat = new THREE.MeshPhongMaterial({
        color: Colors.lightgreen,
        shading: THREE.FlatShading,
    });

    //create a mesh of the object
    this.mesh = new THREE.Mesh(geom, mat);
    //receive shadows
    this.mesh.receiveShadow = true;
}

Orbit = function () {

    let geom = new THREE.Object3D();

    this.mesh = geom;
    //this.mesh.add(sun);
}

Sun = function () {

    this.mesh = new THREE.Object3D();

    let sunGeom = new THREE.SphereGeometry(400, 20, 10);
    let sunMat = new THREE.MeshPhongMaterial({
        color: Colors.yellow,
        shading: THREE.FlatShading,
    });
    let sun = new THREE.Mesh(sunGeom, sunMat);
    //sun.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    sun.castShadow = false;
    sun.receiveShadow = false;
    this.mesh.add(sun);
}

Cloud = function () {
    // Create an empty container for the cloud
    this.mesh = new THREE.Object3D();
    // Cube geometry and material
    let geom = new THREE.DodecahedronGeometry(20, 0);
    let mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
    });

    let nBlocs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < nBlocs; i++) {
        //Clone mesh geometry
        let m = new THREE.Mesh(geom, mat);
        //Randomly position each cube
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        //Randomly scale the cubes
        let s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);
        this.mesh.add(m);
    }
}

Sky = function () {

    this.mesh = new THREE.Object3D();

    // Number of cloud groups
    this.nClouds = 25;

    // Space the consistenly
    let stepAngle = Math.PI * 2 / this.nClouds;

    // Create the Clouds

    for (let i = 0; i < this.nClouds; i++) {

        let c = new Cloud();

        //set rotation and position using trigonometry
        let a = stepAngle * i;
        // this is the distance between the center of the axis and the cloud itself
        let h = 800 + Math.random() * 200;
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;

        // rotate the cloud according to its position
        c.mesh.rotation.z = a + Math.PI / 2;

        // random depth for the clouds on the z-axis
        c.mesh.position.z = -400 - Math.random() * 400;

        // random scale for each cloud
        let s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        this.mesh.add(c.mesh);
    }
}

Tree = function () {

    this.mesh = new THREE.Object3D();

    let matTreeLeaves = new THREE.MeshPhongMaterial({ color: Colors.green, shading: THREE.FlatShading });

    let geonTreeBase = new THREE.BoxGeometry(10, 20, 10);
    let matTreeBase = new THREE.MeshBasicMaterial({ color: Colors.brown });
    let treeBase = new THREE.Mesh(geonTreeBase, matTreeBase);
    treeBase.castShadow = true;
    treeBase.receiveShadow = true;
    this.mesh.add(treeBase);

    let geomTreeLeaves1 = new THREE.CylinderGeometry(1, 12 * 3, 12 * 3, 4);
    let treeLeaves1 = new THREE.Mesh(geomTreeLeaves1, matTreeLeaves);
    treeLeaves1.castShadow = true;
    treeLeaves1.receiveShadow = true;
    treeLeaves1.position.y = 20
    this.mesh.add(treeLeaves1);

    let geomTreeLeaves2 = new THREE.CylinderGeometry(1, 9 * 3, 9 * 3, 4);
    let treeLeaves2 = new THREE.Mesh(geomTreeLeaves2, matTreeLeaves);
    treeLeaves2.castShadow = true;
    treeLeaves2.position.y = 40;
    treeLeaves2.receiveShadow = true;
    this.mesh.add(treeLeaves2);

    let geomTreeLeaves3 = new THREE.CylinderGeometry(1, 6 * 3, 6 * 3, 4);
    let treeLeaves3 = new THREE.Mesh(geomTreeLeaves3, matTreeLeaves);
    treeLeaves3.castShadow = true;
    treeLeaves3.position.y = 55;
    treeLeaves3.receiveShadow = true;
    this.mesh.add(treeLeaves3);

}

Flower = function () {

    this.mesh = new THREE.Object3D();

    let geomStem = new THREE.BoxGeometry(5, 50, 5, 1, 1, 1);
    let matStem = new THREE.MeshPhongMaterial({ color: Colors.green, shading: THREE.FlatShading });
    let stem = new THREE.Mesh(geomStem, matStem);
    stem.castShadow = false;
    stem.receiveShadow = true;
    this.mesh.add(stem);


    let geomPetalCore = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1);
    let matPetalCore = new THREE.MeshPhongMaterial({ color: Colors.yellow, shading: THREE.FlatShading });
    petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
    petalCore.castShadow = false;
    petalCore.receiveShadow = true;

    let petalColor = petalColors[Math.floor(Math.random() * 3)];

    let geomPetal = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    let matPetal = new THREE.MeshBasicMaterial({ color: petalColor });
    geomPetal.vertices[5].y -= 4;
    geomPetal.vertices[4].y -= 4;
    geomPetal.vertices[7].y += 4;
    geomPetal.vertices[6].y += 4;
    geomPetal.translate(12.5, 0, 3);

    let petals = [];
    for (let i = 0; i < 4; i++) {

        petals[i] = new THREE.Mesh(geomPetal, matPetal);
        petals[i].rotation.z = i * Math.PI / 2;
        petals[i].castShadow = true;
        petals[i].receiveShadow = true;
    }

    petalCore.add(petals[0], petals[1], petals[2], petals[3]);
    petalCore.position.y = 25;
    petalCore.position.z = 3;
    this.mesh.add(petalCore);

}

let petalColors = [Colors.red, Colors.yellow, Colors.blue];



Forest = function () {

    this.mesh = new THREE.Object3D();

    // Number of Trees
    this.nTrees = 300;

    // Space the consistenly
    let stepAngle = Math.PI * 2 / this.nTrees;

    // Create the Trees

    for (let i = 0; i < this.nTrees; i++) {

        let t = new Tree();

        //set rotation and position using trigonometry
        let a = stepAngle * i;
        // this is the distance between the center of the axis and the tree itself
        let h = 605;
        t.mesh.position.y = Math.sin(a) * h;
        t.mesh.position.x = Math.cos(a) * h;

        // rotate the tree according to its position
        t.mesh.rotation.z = a + (Math.PI / 2) * 3;

        //Andreas Trigo funtime
        //t.mesh.rotation.z = Math.atan2(t.mesh.position.y, t.mesh.position.x)-Math.PI/2;

        // random depth for the tree on the z-axis
        t.mesh.position.z = 0 - Math.random() * 600;

        // random scale for each tree
        let s = .3 + Math.random() * .75;
        t.mesh.scale.set(s, s, s);

        this.mesh.add(t.mesh);
    }

    // Number of Trees
    this.nFlowers = 350;

    stepAngle = Math.PI * 2 / this.nFlowers;


    for (let i = 0; i < this.nFlowers; i++) {

        let f = new Flower();
        let a = stepAngle * i;

        let h = 605;
        f.mesh.position.y = Math.sin(a) * h;
        f.mesh.position.x = Math.cos(a) * h;

        f.mesh.rotation.z = a + (Math.PI / 2) * 3;

        f.mesh.position.z = 0 - Math.random() * 600;

        let s = .1 + Math.random() * .3;
        f.mesh.scale.set(s, s, s);

        this.mesh.add(f.mesh);
    }

}

let AirPlane = function () {

    this.mesh = new THREE.Object3D();

    // Create the cabin
    let geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    let matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    geomCockpit.vertices[4].y -= 10;
    geomCockpit.vertices[4].z += 20;
    geomCockpit.vertices[5].y -= 10;
    geomCockpit.vertices[5].z -= 20;
    geomCockpit.vertices[6].y += 30;
    geomCockpit.vertices[6].z += 20;
    geomCockpit.vertices[7].y += 30;
    geomCockpit.vertices[7].z -= 20;
    let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create the engine
    let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    let matEngine = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    let engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create the tail
    let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    let matTailPlane = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Create the wing
    let geomSideWing = new THREE.BoxGeometry(40, 4, 150, 1, 1, 1);
    let matSideWing = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });

    let sideWingTop = new THREE.Mesh(geomSideWing, matSideWing);
    let sideWingBottom = new THREE.Mesh(geomSideWing, matSideWing);
    sideWingTop.castShadow = true;
    sideWingTop.receiveShadow = true;
    sideWingBottom.castShadow = true;
    sideWingBottom.receiveShadow = true;

    sideWingTop.position.set(20, 12, 0);
    sideWingBottom.position.set(20, -3, 0);
    this.mesh.add(sideWingTop);
    this.mesh.add(sideWingBottom);

    let geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
    let matWindshield = new THREE.MeshPhongMaterial({ color: Colors.white, transparent: true, opacity: .3, shading: THREE.FlatShading });;
    let windshield = new THREE.Mesh(geomWindshield, matWindshield);
    windshield.position.set(5, 27, 0);

    windshield.castShadow = true;
    windshield.receiveShadow = true;

    this.mesh.add(windshield);

    let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    geomPropeller.vertices[4].y -= 5;
    geomPropeller.vertices[4].z += 5;
    geomPropeller.vertices[5].y -= 5;
    geomPropeller.vertices[5].z -= 5;
    geomPropeller.vertices[6].y += 5;
    geomPropeller.vertices[6].z += 5;
    geomPropeller.vertices[7].y += 5;
    geomPropeller.vertices[7].z -= 5;
    let matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;


    let geomBlade1 = new THREE.BoxGeometry(1, 100, 10, 1, 1, 1);
    let geomBlade2 = new THREE.BoxGeometry(1, 10, 100, 1, 1, 1);
    let matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, shading: THREE.FlatShading });

    let blade1 = new THREE.Mesh(geomBlade1, matBlade);
    blade1.position.set(8, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;

    let blade2 = new THREE.Mesh(geomBlade2, matBlade);
    blade2.position.set(8, 0, 0);
    blade2.castShadow = true;
    blade2.receiveShadow = true;
    this.propeller.add(blade1, blade2);
    this.propeller.position.set(50, 0, 0);
    this.mesh.add(this.propeller);

    let wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
    let wheelProtecMat = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    let wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
    wheelProtecR.position.set(25, -20, 25);
    this.mesh.add(wheelProtecR);

    let wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    let wheelTireMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, shading: THREE.FlatShading });
    let wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
    wheelTireR.position.set(25, -28, 25);

    let wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    let wheelAxisMat = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    let wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
    wheelTireR.add(wheelAxis);

    this.mesh.add(wheelTireR);

    let wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z;
    this.mesh.add(wheelProtecL);

    let wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL);

    let wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5, .5, .5);
    wheelTireB.position.set(-35, -5, 0);
    this.mesh.add(wheelTireB);

    let suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
    suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))
    let suspensionMat = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    let suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
    suspension.position.set(-35, -5, 0);
    suspension.rotation.z = -.3;
    this.mesh.add(suspension);
};

let Fox = function () {

    this.mesh = new THREE.Object3D();

    let redFurMat = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });

    // Create the Body
    let geomBody = new THREE.BoxGeometry(100, 50, 50, 1, 1, 1);
    let body = new THREE.Mesh(geomBody, redFurMat);
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Create the Chest
    let geomChest = new THREE.BoxGeometry(50, 60, 70, 1, 1, 1);
    let chest = new THREE.Mesh(geomChest, redFurMat);
    chest.position.x = 60;
    chest.castShadow = true;
    chest.receiveShadow = true;
    this.mesh.add(chest);

    // Create the Head
    let geomHead = new THREE.BoxGeometry(40, 55, 50, 1, 1, 1);
    this.head = new THREE.Mesh(geomHead, redFurMat);
    this.head.position.set(80, 35, 0);
    this.head.castShadow = true;
    this.head.receiveShadow = true;

    // Create the Snout
    let geomSnout = new THREE.BoxGeometry(40, 30, 30, 1, 1, 1);
    let snout = new THREE.Mesh(geomSnout, redFurMat);
    geomSnout.vertices[0].y -= 5;
    geomSnout.vertices[0].z += 5;
    geomSnout.vertices[1].y -= 5;
    geomSnout.vertices[1].z -= 5;
    geomSnout.vertices[2].y += 5;
    geomSnout.vertices[2].z += 5;
    geomSnout.vertices[3].y += 5;
    geomSnout.vertices[3].z -= 5;
    snout.castShadow = true;
    snout.receiveShadow = true;
    snout.position.set(30, 0, 0);
    this.head.add(snout);

    // Create the Nose
    let geomNose = new THREE.BoxGeometry(10, 15, 20, 1, 1, 1);
    let matNose = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    let nose = new THREE.Mesh(geomNose, matNose);
    nose.position.set(55, 0, 0);
    this.head.add(nose);

    // Create the Ears
    let geomEar = new THREE.BoxGeometry(10, 40, 30, 1, 1, 1);
    let earL = new THREE.Mesh(geomEar, redFurMat);
    earL.position.set(-10, 40, -18);
    this.head.add(earL);
    earL.rotation.x = -Math.PI / 10;
    geomEar.vertices[1].z += 5;
    geomEar.vertices[4].z += 5;
    geomEar.vertices[0].z -= 5;
    geomEar.vertices[5].z -= 5;

    // Create the Ear Tips
    let geomEarTipL = new THREE.BoxGeometry(10, 10, 20, 1, 1, 1);
    let matEarTip = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    let earTipL = new THREE.Mesh(geomEarTipL, matEarTip);
    earTipL.position.set(0, 25, 0);
    earL.add(earTipL);

    let earR = earL.clone();
    earR.position.z = -earL.position.z;
    earR.rotation.x = -	earL.rotation.x;
    this.head.add(earR);

    this.mesh.add(this.head);


    // Create the tail
    let geomTail = new THREE.BoxGeometry(80, 40, 40, 2, 1, 1);
    geomTail.vertices[4].y -= 10;
    geomTail.vertices[4].z += 10;
    geomTail.vertices[5].y -= 10;
    geomTail.vertices[5].z -= 10;
    geomTail.vertices[6].y += 10;
    geomTail.vertices[6].z += 10;
    geomTail.vertices[7].y += 10;
    geomTail.vertices[7].z -= 10;
    this.tail = new THREE.Mesh(geomTail, redFurMat);
    this.tail.castShadow = true;
    this.tail.receiveShadow = true;

    // Create the tail Tip
    let geomTailTip = new THREE.BoxGeometry(20, 40, 40, 1, 1, 1);
    let matTailTip = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    let tailTip = new THREE.Mesh(geomTailTip, matTailTip);
    tailTip.position.set(80, 0, 0);
    tailTip.castShadow = true;
    tailTip.receiveShadow = true;
    this.tail.add(tailTip);
    this.tail.position.set(-40, 10, 0);
    geomTail.translate(40, 0, 0);
    geomTailTip.translate(10, 0, 0);
    this.tail.rotation.z = Math.PI / 1.5;
    this.mesh.add(this.tail);


    // Create the Legs
    let geomLeg = new THREE.BoxGeometry(20, 60, 20, 1, 1, 1);
    this.legFR = new THREE.Mesh(geomLeg, redFurMat);
    this.legFR.castShadow = true;
    this.legFR.receiveShadow = true;

    // Create the feet
    let geomFeet = new THREE.BoxGeometry(20, 20, 20, 1, 1, 1);
    let matFeet = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    let feet = new THREE.Mesh(geomFeet, matFeet);
    feet.position.set(0, 0, 0);
    feet.castShadow = true;
    feet.receiveShadow = true;
    this.legFR.add(feet);
    this.legFR.position.set(70, -12, 25);
    geomLeg.translate(0, 40, 0);
    geomFeet.translate(0, 80, 0);
    this.legFR.rotation.z = 16;
    this.mesh.add(this.legFR);

    this.legFL = this.legFR.clone();
    this.legFL.position.z = -this.legFR.position.z;
    this.legFL.rotation.z = -this.legFR.rotation.z;
    this.mesh.add(this.legFL);

    this.legBR = this.legFR.clone();
    this.legBR.position.x = -(this.legFR.position.x) + 50;
    this.legBR.rotation.z = -this.legFR.rotation.z;
    this.mesh.add(this.legBR);

    this.legBL = this.legFL.clone();
    this.legBL.position.x = -(this.legFL.position.x) + 50;
    this.legBL.rotation.z = -this.legFL.rotation.z;
    this.mesh.add(this.legBL);

};


let sky;
let forest;
let land;
let orbit;
let airplane;
let sun;
let fox;

let mousePos = { x: 0, y: 0 };
let offSet = -600;


function createSky() {
    sky = new Sky();
    sky.mesh.position.y = offSet;
    scene.add(sky.mesh);
}

function createLand() {
    land = new Land();
    land.mesh.position.y = offSet;
    scene.add(land.mesh);
}

function createOrbit() {
    orbit = new Orbit();
    orbit.mesh.position.y = offSet;
    orbit.mesh.rotation.z = -Math.PI / 6;
    scene.add(orbit.mesh);
}

function createForest() {
    forest = new Forest();
    forest.mesh.position.y = offSet;
    scene.add(forest.mesh);
}

function createSun() {
    sun = new Sun();
    sun.mesh.scale.set(1, 1, .3);
    sun.mesh.position.set(0, -30, -850);
    scene.add(sun.mesh);
}


function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.35, .35, .35);
    airplane.mesh.position.set(-40, 110, -250);
    // airplane.mesh.rotation.z = Math.PI/15;
    scene.add(airplane.mesh);
}

function createFox() {
    fox = new Fox();
    fox.mesh.scale.set(.35, .35, .35);
    fox.mesh.position.set(-40, 110, -250);
    scene.add(fox.mesh);
}


function updatePlane() {

    let targetY = normalize(mousePos.y, -.75, .75, 50, 190);
    let targetX = normalize(mousePos.x, -.75, .75, -100, -20);

    // Move the plane at each frame by adding a fraction of the remaining distance
    airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;

    airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.1;

    // Rotate the plane proportionally to the remaining distance
    airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
    airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.0064;
    airplane.mesh.rotation.y = (airplane.mesh.position.x - targetX) * 0.0064;

    airplane.propeller.rotation.x += 0.3;
}

function normalize(v, vmin, vmax, tmin, tmax) {

    let nv = Math.max(Math.min(v, vmax), vmin);
    let dv = vmax - vmin;
    let pc = (nv - vmin) / dv;
    let dt = tmax - tmin;
    let tv = tmin + (pc * dt);
    return tv;

}


function loop() {
    land.mesh.rotation.z += .005;
    orbit.mesh.rotation.z += .001;
    sky.mesh.rotation.z += .003;
    forest.mesh.rotation.z += .005;
    updatePlane();

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function handleMouseMove(event) {
    let tx = -1 + (event.clientX / WIDTH) * 2;
    let ty = 1 - (event.clientY / HEIGHT) * 2;
    mousePos = { x: tx, y: ty };
}


function init(event) {
    createScene();
    createLights();
    createPlane();
    createOrbit();
    createSun();
    createLand();
    createForest();
    createSky();
    //createFox();

    document.addEventListener('mousemove', handleMouseMove, false);

    loop();
}

window.addEventListener('load', init, false);

// cursor

const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");

const cursor = document.querySelector(".cursor");

circles.forEach(function (circle, index) {
    circle.x = 0;
    circle.y = 0;
    circle.style.backgroundColor = "white";
});

window.addEventListener("mousemove", function (e) {
    coords.x = e.clientX;
    coords.y = e.clientY;
});

function animateCircles() {
    let x = coords.x;
    let y = coords.y;

    cursor.style.top = x;
    cursor.style.left = y;

    circles.forEach(function (circle, index) {
        circle.style.left = x - 12 + "px";
        circle.style.top = y - 12 + "px";

        circle.style.scale = (circles.length - index) / circles.length;

        circle.x = x;
        circle.y = y;

        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.5;
        y += (nextCircle.y - y) * 0.5;
    });

    requestAnimationFrame(animateCircles);
}

animateCircles();
