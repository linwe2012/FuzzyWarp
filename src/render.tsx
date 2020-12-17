import React, { useEffect, useState } from 'react'
import { CanvasManager } from './canvas'
import * as THREE from 'three'
// import { TrackballControls } from './traceballctrl'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
// import { DragControls } from 'three/examples/jsm/controls/DragControls'

import {FuzzyWarp, getDefaultFuzzyParams, Test, FuzzyParams} from './algo'
import { Vector3 } from 'three'

interface RenderProps {
    onHandle?: (x:any)=>any
}

interface RenderSettingsProps {
    handle?: ReturnType<typeof RunAll>
}

export const RenderSettings : React.FC<RenderSettingsProps> = (props)=>{
    const [params, setParams] = useState(getDefaultFuzzyParams())
    const chParam = (k: keyof FuzzyParams)=>{
        return (e:React.ChangeEvent<HTMLInputElement>)=>{
            const res = parseFloat(e.target.value)
            const nparam = { ...params }
            if(k === 'sim_w1') {
                nparam.sim_w1 = res
                nparam.sim_w2 = 1 - res
            }
            if(k === 'smooth_w1') {
                nparam.smooth_w1 = res
                nparam.smooth_w2 = 1 - res
            }
            if(k === 'smooth_a' || k === 'smooth_b') {
                nparam[k] = res
                const c = nparam.smooth_a + nparam.smooth_b
                if(c > 1) {
                    return
                }

                else {
                    nparam.smooth_c = 1 - c;
                }
            }
            const rprams = {
                ...nparam,
                [k]: res
            }
            setParams(rprams)
            if(props.handle) {
                props.handle.setDefaultParameter(rprams)
            }
        }
    }

    return (
        <div>
        <h4>Fuzzy polygon similarity</h4>
        <p><span>&omega; <sub>1</sub> (match size) </span><input type="range" min="0" max="1" step="0.01" defaultValue={params.sim_w1} onChange={chParam('sim_w1')} ></input> {params.sim_w1} </p>
        <p><span>&omega; <sub>2</sub> (match shape)</span><input type="range" min="0" max="1" step="0.01" value={params.sim_w2} readOnly></input> {params.sim_w2} </p>
        
        <h4>Affine Transform Smooth Param</h4>
        <h5>Similarity Degree</h5>
        <p><span>&omega; <sub>1</sub> (match size) </span><input type="range" min="0" max="1" step="0.01" defaultValue={params.smooth_w1} onChange={chParam('smooth_w1')} ></input> {params.smooth_w1} </p>
        <p><span>&omega; <sub>2</sub> (match shape)</span><input type="range" min="0" max="1" step="0.01" value={params.smooth_w2} readOnly></input> {params.smooth_w2.toFixed(2)} </p>
        
        <h5>Smooth</h5>
        <p><span>smooth<sub>a</sub> (match similarity) </span><input type="range" min="0" max="1" step="0.01" value={params.smooth_a} onChange={chParam('smooth_a')} ></input> {params.smooth_a} </p>
        <p><span>smooth<sub>b</sub> (minimize rotation) </span><input type="range" min="0" max="1" step="0.01" value={params.smooth_b} onChange={chParam('smooth_b')}></input> {params.smooth_b} </p>
        <p><span>smooth<sub>c</sub> (minimize area) </span><input type="range" min="0" max="1" step="0.01" value={params.smooth_c} readOnly></input> {params.smooth_c.toFixed(2)} </p>
        <p><span>smooth<sub>d</sub> (adjust) </span><input type="range" min="0" max="20" step="0.1" value={params.smooth_d} onChange={chParam('smooth_d')}></input> {params.smooth_d} </p>
        </div>
    )
}

const Render : React.FC<RenderProps> = (props)=>{
    const [handle, setHandle] = useState<ReturnType<typeof RunAll>>()
    const [useWhat, setUseWhat] = useState('A')
    

    useEffect(()=>{
        const h = RunAll()
        setHandle(h)
        if(props.onHandle) {
            props.onHandle(h)
        }
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
renderer.setPixelRatio(window.devicePixelRatio)

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

let A_vertices = new Array<Vector3>()
let A_line = makeLineFromVertices(A_vertices)
let B_vertices = new Array<Vector3>()
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

const keyPoints = new THREE.Group()
scene.add(keyPoints)

const addDots = (vec : Vector3[]) => {
    [0xff0000, 0x00ff00, 0x0000ff].forEach((v, idx)=>{
        const mat = new THREE.MeshBasicMaterial({color: v});
        const geo = new THREE.CircleGeometry(0.06, 10)
        const c = new THREE.Mesh(geo, mat);
        c.position.set(vec[idx].x, vec[idx].y, vec[idx].z);
        keyPoints.add(c)
    })
}

let defaultFuzzyParams = getDefaultFuzzyParams()

const triggerTransform = (params?: FuzzyParams)=>{
    if(A_vertices.length > B_vertices.length) {
        const T = A_vertices;
        A_vertices = B_vertices;
        B_vertices = T;
    }
    keyPoints.clear()
    fuzzyWarper.init(A_vertices, B_vertices, params || defaultFuzzyParams)
    addDots(fuzzyWarper.keyPoints.map(v=>{
        return B_vertices[v]
    }))

    addDots(fuzzyWarper.keyPoints.map(v=>{
        return A_vertices[fuzzyWarper.lookup[v]]
    }))

    isTransforming = true
    time = 0

}

render();

Test()

return {
    next: ()=>{ useAorB = !useAorB; return useAorB? 'B' : 'A'  },
    transform: (params?: FuzzyParams)=>{ triggerTransform(params) },
    setDefaultParameter: (x:FuzzyParams) => { defaultFuzzyParams = x }
}


}