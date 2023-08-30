import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import GUI from 'lil-gui';
import gsap from 'gsap';

var colors = require('nice-color-palettes'); 

let palette = colors[Math.floor(Math.random() * colors.length)];

palette = palette.map((color) => new THREE.Color(color))

console.log(palette);

// init

export default class Sketch{ 
    constructor(options){

        this.scene = new THREE.Scene();
        
        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        //Renderer

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height );
        this.renderer.setClearColor(0xeeeeee,1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);        
       
        this.camera = new THREE.PerspectiveCamera(
             70,
            this.width / 
            this.height, 
            0.001,
            1000 
            );
        
        
        this.camera.position.set(0, 0, 1);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0; 
        this.gltf = new GLTFLoader();

        this.isPlaying = true;

        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
 
    } 

    settings() {
        let that = this;
        this.settings ={
            progress: 0
        };
        this.gui = new GUI();
        this.gui.add(this.settings, "progress", 0, 1, 0.01);
    }

    setupResize(){

    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

  //update the camera's frustum 

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
             extensions: {
            derivatives: "extensions GL_OES_standard_derivatives : enabled"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                uColor: { value: palette }, 
                resolution: { value: new THREE.Vector4() }, 
            },
            // wireframe: true,
            vertexShader : vertex, 
            fragmentShader: fragment
            })

        this.geometry = new THREE.PlaneGeometry(1, 1, 300, 300)
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(0.5, 0, 0.866);
        this.scene.add(light2)
    }

    stop(){
        this.isPlaying = false;

    }

    play() {
        if(!this.isPlaying){
            this.isPlaying = true;
            this.render()
        }
    }

    render() {
        if(!this.isPlaying) return;
        this.time += 0.0004;
        this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

}

new Sketch({
    dom : document.getElementById("container")
});
