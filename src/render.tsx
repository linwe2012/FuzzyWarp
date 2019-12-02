import React, { useEffect, useState } from 'react'
import { CanvasManager } from './canvas'
import * as THREE from 'three'
// import { TrackballControls } from './traceballctrl'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
// import { DragControls } from 'three/examples/jsm/controls/DragControls'

import {FuzzyWarp, getDefaultFuzzyParams, Test} from './algo'
import { Vector3 } from 'three'

interface RenderProps {
}


const Render : React.FC<RenderProps> = (props)=>{
    const [handle, setHandle] = useState<ReturnType<typeof RunAll>>()
    const [useWhat, setUseWhat] = useState('A')
    useEffect(()=>{
        setHandle(RunAll())
    }, [])
    
    const next = () =>{
        if(handle) {
            setUseWhat(handle.next());
        }
    }

    const transform = () =>{
        if(handle) {
            handle.transform();
        }
    }

    return (<div>
        using: {useWhat}
        <button onClick={next}>
        Toggle
      </button>
      <button onClick={transform}>
        Transform
      </button>
    </div>)
}

export default Render;



function RunAll () {
const HandleResize = ()=>{Resize()}
const frame = document.getElementById('canvas-frame'); if(frame === null) return;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias : true, powerPreference:'high-performance'});
const canvas = new CanvasManager(frame, renderer.domElement, renderer, HandleResize);
const camera = new THREE.PerspectiveCamera(75, canvas.Aspect(), 0.1, 1000);

renderer.setSize(canvas.w, canvas.h);
renderer.setClearColor(0x444444, 1.0);

camera.position.z = 5;
var Resize=() => {
    console.log(canvas.w, canvas.h)
    // camera.aspect = canvas.Aspect()
    // camera.updateMatrix()
}
const control = new TrackballControls(camera, frame)
// const fpControl = new KeyControls(camera, frame)
control.target.set(0, 0, 0)
control.rotateSpeed = 8.0;
control.noPan = false
control.maxDistance = 60
control.keys = []
const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );
var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 10, 10, 10 );
scene.add( light );

var plight = new THREE.PointLight( 0xffffff, 1, 200 );
plight.position.set( -40, 20, 20 );
scene.add( plight );

var light1 = new THREE.PointLight( 0xffffff, 1, 200 );
light1.position.set( -40, -20, -20 );
scene.add( light1 );

var light2 = new THREE.PointLight( 0xffffff, 1, 200 );
light2.position.set( -20, 10, -10 );
scene.add( light2 );


const fuzzyWarper = new FuzzyWarp();

const planegeo = new THREE.PlaneGeometry( 1000, 1000, 10, 10 );
const planeMesh = new THREE.Mesh(planegeo, new THREE.MeshBasicMaterial());
planeMesh.position.set(0, 0, 0)
const click_raycaster = new THREE.Raycaster();

const GetMouseOnPlane = () => {
    let point = new THREE.Vector3(canvas.pickPosition.x, canvas.pickPosition.y, 5);
    click_raycaster.setFromCamera(point, camera);
    let hits = click_raycaster.intersectObject(planeMesh,true);
    return hits[0].point;
}

const dotsGroup = new THREE.Group();
scene.add(dotsGroup)


const makeLineFromVertices = (v : Vector3[]) => {
    const A_lineGeo = new THREE.Geometry();
    A_lineGeo.vertices = v;
    const A_lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff,  linewidth: 1})
    return new THREE.Line(A_lineGeo, A_lineMaterial);
}

const A_vertices = new Array<Vector3>()
let A_line = makeLineFromVertices(A_vertices)
const B_vertices = new Array<Vector3>()
let B_line = makeLineFromVertices(B_vertices)

scene.add(A_line)

let useAorB = false

canvas.onclick = (event : any)=>{
    canvas.setPickPosition(event);
    const pointOnPlane = GetMouseOnPlane();
    pointOnPlane.z = 0
    
    if(Math.abs(pointOnPlane.y) > 3.71) {
        return;
    }

    // console.log(pointOnPlane)
    if(!useAorB) {
        A_vertices.push(pointOnPlane)
        scene.remove(A_line)
        A_line = makeLineFromVertices(A_vertices)
        scene.add(A_line)
    }
    else {
        B_vertices.push(pointOnPlane)
        scene.remove(B_line)
        B_line = makeLineFromVertices(B_vertices)
        scene.add(B_line)
    }
    
    /*
    let pointGeo = new THREE.CircleGeometry( 0.05, 12 );
    let dotMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    let dot = new THREE.Mesh( pointGeo, dotMaterial );
    dot.position.set(pointOnPlane.x, pointOnPlane.y, pointOnPlane.z)
    dot.userData = { id: dotsGroup.children.length }
    dotsGroup.add( dot );*/
}


let isTransforming = false
let time = 0
const deltaTime = 0.01
// const deltaTime = 0.25
let middle = makeLineFromVertices(new Array<Vector3>())
scene.add(middle)

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if(isTransforming) {
        if(time > 1) {
            isTransforming = false
        }
        else {
            time += deltaTime
            scene.remove(middle)
            const inted = fuzzyWarper.interp(time)
            inted.push(inted[0])
            middle = makeLineFromVertices(inted)
            scene.add(middle)
        }

    }
}

const triggerTransform = ()=>{
    fuzzyWarper.init(A_vertices, B_vertices, getDefaultFuzzyParams())
    isTransforming = true
    time = 0
}

render();

Test()

return {
    next: ()=>{ useAorB = !useAorB; return useAorB? 'B' : 'A'  },
    transform: ()=>{ triggerTransform() }
}


}