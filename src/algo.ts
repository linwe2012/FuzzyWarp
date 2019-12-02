import {Vector3, Matrix3, Vector2} from 'three'

type TriangleVec = [Vector3, Vector3, Vector3]

interface FuzzyParams {
    smooth_a: number
    smooth_b: number
    smooth_c: number
    smooth_w1: number
    smooth_w2: number

    // constraint: sim_w1 + sim_w2 = 1
    sim_w1: number
    sim_w2:number
}


function sim_t(w1:number, w2: number, 
    t0: TriangleVec, t1: TriangleVec) {
    
    let e_0_1 = t0[0].clone().sub(t0[1])
    let e_0_2 = t0[2].clone().sub(t0[1])

    let e_1_1 = t1[0].clone().sub(t1[1])
    let e_1_2 = t1[2].clone().sub(t1[1])

    const a_0_1 = e_0_1.angleTo(e_0_2)
    const a_1_1 = e_1_1.angleTo(e_1_2)

    const a = e_0_1.length() * e_1_2.length()
    const b = e_1_1.length() * e_0_2.length()
    const nom =  Math.abs(a-b)
    const denom = a+b

    const angle = Math.abs(a_0_1 - a_1_1) / 2.0 / Math.PI

    return w1*(1-nom/denom) + w2*(1-angle)
}

function sim_p(w1: number, w2:number, T0: Vector3[], T1: Vector3[]) {
    const end = T0.length - 2
    let sum = 0;

    for(let i = 0; i < end; ++i) {
        sum += sim_t(w1, w2, 
            [T0[i], T0[i+1], T0[i+2]],
            [T1[i], T1[i+1], T1[i+2]]
        )
    }

    // Now we tackle the boundries:
    sum += sim_t(w1, w2, 
        [T0[end], T0[end+1], T0[0]],
        [T1[end], T1[end+1], T1[0]]
    )

    //TODO: I really dont know which number to devide the sum,
    // but it won't effect the final result at all
    sum /= (T0.length)
    return sum;
}


// DP find Min path
// ------------------------------
enum DPDirection {
    Left,
    DownLeft,
    Start
}

interface DPInfo {
    dir: DPDirection
    cost: number
}

interface Position2D {
    x: number
    y: number
}

function dpMinPath(graph:number[][], from: Position2D, to: Position2D) : [number, DPDirection[]] {
    const m = to.x - from.x;
    const n = to.y - from.y;

    const dp = new Array<Array<DPInfo>>();
    // initialize values for DP
    dp[0] = new Array<DPInfo>();
    dp[0].push({
        dir: DPDirection.Start,
        cost: graph[from.x][from.y]
    })

    {
        let sum = dp[0][0].cost
        for(let j = 1; j < n; ++j) {
            sum += graph[from.x][from.y + j]
            dp[0].push({
                dir: DPDirection.Start,
                cost: sum
            })
        }
    }

    // compute all possible path
    for(let i = 1; i < m; ++i) {
        dp[i] = new Array<DPInfo>();
        dp[i].push({
            dir: DPDirection.Start,
            cost: Infinity
        })

        for(let j = 1; j < n; ++j) {
            const left = dp[i][j-1].cost
            const downLeft = dp[i-1][j-1].cost;
            const cur = graph[from.x+i][from.y+j]
            if(left < downLeft) {
                dp[i].push({
                    dir: DPDirection.Left,
                    cost: left + cur
                })
            }
            else {
                dp[i].push({
                    dir: DPDirection.DownLeft,
                    cost: downLeft + cur
                })
            }
        }
    }

    // reconstruct path
    const pathDir = new Array<DPDirection>();
    let pos: Position2D = {
        x: m - 1,
        y: n - 1
    }
    const min = dp[pos.x][pos.y].cost;

    while(pos.y || pos.x !== from.x) {
        pathDir.push(dp[pos.x][pos.y].dir)
        
        if(dp[pos.x][pos.y].dir === DPDirection.Left) {
            --pos.y
        }
        else {
            --pos.x;
            --pos.y;
        }
        if(dp[pos.x][pos.y].dir === DPDirection.Start) {
            break;
        }
        // console.assert(pos.x >=0 && pos.y <= 0, "DP failed: Out of Boundry")
    }
    return [min, pathDir]
}



// Use sim graph to compute a onto (surjection) mapping from T1 to T0
// assumes: T0.len < T1.len
function fuzzySimGraph(w1: number, w2:number, T0: Vector3[], T1: Vector3[]) {
    // we extend (m + 2) x (n + 2) graphG to (m + 2) x (2 x (n + 2)-1) 
    // EG[i, j] = G[i, j mod(n + l)],
    //const m = T0.length + 1
    //const n = 2*(T1.length + 1)

    // Part I: Compute fuzzy Graph
    // ------------------------------
    const len0 = T0.length
    const len1 = T1.length

    //T0.push(T0[0])
    //T1.push(T1[0])

    const graph = new Array<Array<number>>();


    // Layout of the graph:
    //
    // 0 1 2 3 0 1 2 3
    // - - - - - - - - (3)
    // x x x x - - - - (2)
    // x x x x - - - - (1)
    // x x x x - - - - (0)
    
    // x is the part we need to compute, others are copied
    // (0) will be copied to (3)
    // the left x's will be copied to right

    for(let i = 0; i < len0; ++i) {
        graph[i] = new Array<number>()
        for(let j = 0; j < len1; ++j) {
            const a0 = (len0 + i - 1) % len0
            const b0 = (a0 + 1) % len0
            const c0 = (b0 + 1) % len0

            const a1 = (len1 + j - 1) % len1
            const b1 = (a1 + 1) % len1
            const c1 = (b1 + 1) % len1

            graph[i].push(1 - sim_t(w1, w2, 
                [T0[a0], T0[b0], T0[c0]],
                [T1[a1], T1[b1], T1[c1]]
                ))
        }

        graph[i].push(...graph[i])
    }
    graph.push(graph[0])
    
    let min = Infinity
    let pathDir = new Array<DPDirection>()
    let the_i = -1;

    for(let i = 0; i < len0; ++i) {
        const [this_min, this_pathDir] = dpMinPath(graph, {x:0, y:i}, {x:len0, y:i+len1});
        if(min > this_min) {
            the_i = i;
            pathDir = this_pathDir;
            min = this_min
        }
    }

    // lookup table mapping T1 index to T0 index
    const lookup = new Int32Array(len1)
    let mapped = len0 - 1;
    for(let i = 0; i < len1-1; ++i) {
        const index = the_i + (len1-1-i)
        lookup[index % len1] = mapped;
        if(pathDir[i] === DPDirection.DownLeft) {
            --mapped;
        }
    }
    lookup[the_i % len1] = 0

    return lookup;
}

type AnglesOfTriangle  = [number, number, number]
const getTriAngles = (t: TriangleVec) : AnglesOfTriangle => {
    const e0 = t[0].clone().sub(t[1])
    const e1 = t[2].clone().sub(t[1])
    const e2 = t[2].clone().sub(t[0])

    const a1 = e0.angleTo(e1)
    const a0 = e2.angleTo(e1)
    const a2 = Math.PI - a1 - a0;
    return [a0, a1, a2]
}

function smoothS(w1:number, w2: number, 
    t0: TriangleVec, t1: TriangleVec) {
    let e = 0;
    let a = 0;
    for(let i = 0; i < 3; ++i) {
         const e0 = t0[i].clone().sub(t0[(i+1)%3]).length()
         const e1 = t1[i].clone().sub(t1[(i+1)%3]).length()
         e += Math.abs(e0-e1) / (e0+e1)
    }

    const a0 = getTriAngles(t0)
    const a1 = getTriAngles(t1)
    for(let i = 0; i < 3; ++i) {
        a += Math.abs(a0[i] - a1[i])
    }
    a /= Math.PI

    return w1*(1-e)+w2*(1-a)
}

function bisect(t0:TriangleVec) {
    return t0[0].clone().sub(t0[1]).add(
        t0[2].clone().sub(t0[1])
    )
}

function area(t0:TriangleVec) {
    const v1 = t0[0].clone().sub(t0[1])
    const v2 = t0[2].clone().sub(t0[1])
    return Math.abs(0.5*v1.length() * v2.length() * Math.sin(v1.angleTo(v2)))
}

// see also: https://www.mathopenref.com/coordpolygonarea.html
function polygonArea(poly:Vector3[]) {
    let sum = 0
    const end = poly.length - 1
    for(let i = 0; i < end; ++i) {
        sum += poly[i].x*poly[i+1].y - poly[i].y*poly[i+1].x
    }
    sum += poly[end].x*poly[0].y - poly[end].y*poly[0].x
    sum /= 2
    return Math.abs(sum)
}

function smooth_a(a:number, b:number, c:number, w1:number, w2: number, 
    poly_area_sum: number, t0: TriangleVec, t1: TriangleVec) {
    const S = smoothS(w1, w2, t0, t1);
    const R = bisect(t0).angleTo(bisect(t1))
    const A = (area(t0) + area(t1)) / poly_area_sum
    return a * S + b * (1-R/Math.PI) + c * A
}



function smoothKeyPoints(T0:Vector3[], T1:Vector3[], lookup: Int32Array, params:FuzzyParams) {
    interface Smooth {
        val: number
        idx: number
    };

    const reverse_lookup = new Array<number>()
    for(let i = 0; i < T1.length; ++i) {
        reverse_lookup[lookup[i]] = i
    }

    const smooth = new Array<Smooth>();
    const { smooth_a: a, smooth_b:b, smooth_c:c, smooth_w1: w1, smooth_w2: w2 } = params;

    const area_sum = polygonArea(T0) + polygonArea(T1);

    for(let i = 0; i < T0.length; ++i) {
        const u0 = i;
        const v0 = (i + 1) % T0.length;
        const w0 = (i + 2) % T0.length;

        const u = reverse_lookup[u0]
        const v = reverse_lookup[v0]
        const w = reverse_lookup[w0]
        
        const s = smooth_a(a, b, c, w1, w2, area_sum, 
            [T1[u], T1[v], T1[w]],
            [T0[u0], T0[v0], T0[w0]]
            );
        smooth.push({
            val: s,
            idx: i
        })
    }

    // sort in descending order
    smooth.sort((a, b)=>(b.val - a.val))

    return [ smooth[0].idx, smooth[1].idx, smooth[2].idx  ]
}


class Mat2 {
    // column major, in accordance with threejs
    data = new Array<number>(4)
    fromMatrix3(m: Matrix3) {
        this.data[0] = m.elements[0]
        this.data[1] = m.elements[1]
        this.data[2] = m.elements[3]
        this.data[3] = m.elements[4]
        return this;
    }

    set(n11:number, n12:number, n21:number, n22:number) {
        this.data[0] = n11; this.data[2] = n12;
        this.data[1] = n21; this.data[3] = n22;
        return this;
    }

    scaledIndentity(t:number) {
        return this.set(
            t, 0,
            0, t
        )
    }

    det() {
        return (this.data[0] * this.data[3]) - (this.data[1] * this.data[2])
    }

    fromRotate(theta : number) {
        const a = this.data
        a[0] = Math.cos(theta)
        a[1] = Math.sin(theta)
        a[2] = -a[1]
        a[3] = a[0]
        return this;
    }

    apply2Vector3(v: Vector3) {
        const x = v.x
        const y = v.y
        const a = this.data
        v.x = a[0]*x + a[2]*y
        v.y = a[1]*x + a[3]*y
        return this;
    }

    // decompose to rotation theta & affine matrix
    decompose() : [number, Mat2] {
        const det = this.det();
        const sign = Math.sign(det)

        const B = new Mat2();
        const b = B.data;
        const a = this.data;

        b[0] = sign * a[3] + a[0];
        b[1] = - sign * a[2] + a[1];
        b[2] = - sign * a[1] + a[2];
        b[3] = sign * a[0] + a[3];
        
        const div = b[0]*b[0] + b[1]*b[1]
        B.mulScalar(1/Math.sqrt(div))

        const Bi = new Mat2().inv(B)
        const C = new Mat2().mul(Bi, this)

        
        const cos = b[0]
        const sin = b[1]
        //todo: this steps is possibly not needed
        const ref = Math.abs(Math.asin(sin))
        let theta = ref;
        if(cos > 0 && sin > 0) {
            theta = ref;
        }
        else if(sin > 0 && cos < 0) {
            theta = Math.PI - theta
        }
        else if(sin < 0 && cos < 0) {
            theta = Math.PI + theta
        }
        else if(sin < 0 && cos > 0) {
            theta = Math.PI * 2 - theta
        }
        if(theta > Math.PI) {
            theta -= 2*Math.PI
        }
        
        return [theta, C]
    }

    inv(M: Mat2) {
        const det_ = 1 / M.det();
        const a = this.data;
        const m = M.data
        a[0] = det_ * m[3]
        a[1] = -det_ * m[1]
        a[2] = -det_ * m[2]
        a[3] = det_ * m[0]
        return this;
    }

    // C = A x B
    mul(A:Mat2, B:Mat2) {
        const a = A.data
        const b = B.data
        const m = this.data

        m[0] = a[0]*b[0] + a[2] * b[1]
        m[1] = a[1]*b[0] + a[3]*b[1]
        m[2] = a[0]*b[2] + a[2]*b[3]
        m[3] = a[1]*b[2] + a[3]*b[3]
        return this;
    }

    add(A:Mat2) {
        const a = A.data
        const m = this.data
        m[0] += a[0];
        m[1] += a[1];
        m[2] += a[2];
        m[3] += a[3];
        return this;
    }

    clone() {
        const m = new Mat2()
        m.data = [...this.data]
        return m
    }

    mulScalar(t : number) {
        this.data[0] *= t;
        this.data[1] *= t;
        this.data[2] *= t;
        this.data[3] *= t;
        return this
    }
}

interface Trans {
    translate: Vector2
    theta: number
    affine: Mat2
    begin: Vector3
}

function computeTransform(from:TriangleVec, to: TriangleVec) : Trans {
    const t2m = (t:TriangleVec) =>{
        const mt = new Matrix3()
        mt.set(
            t[0].x, t[1].x, t[2].x,
            t[0].y, t[1].y, t[2].y,
            1,      1,      1
        )
        return mt;
    }

    let mFrom = t2m(from)
    let mTo = t2m(to);
    
    const inverse = new Matrix3().getInverse(mFrom)
    const transform = new Matrix3().multiplyMatrices(mTo, inverse);
    
    const translate = new Vector2(transform.elements[6], transform.elements[7])
    const complex = new Mat2().fromMatrix3(transform)
    const [theta, affine] = complex.decompose();
    
    return {
        translate: translate,
        theta: theta,
        affine: affine,
        begin: from[1].clone()
    }
}


function global2LocalCoords(t: TriangleVec, vecs: Vector3[]) {
    const B = t[1].clone()
    const U = t[2].clone().sub(B)
    const V = t[0].clone().sub(B)

    const M = new Mat2().set(
        U.x, V.x,
        U.y, V.y
    )
    const Mi = new Mat2().inv(M)

    B.z = 0
    return vecs.map(i=>{
        const v = i.clone().sub(B);
        Mi.apply2Vector3(v)
        return v;
    });
}

function local2GlobalCoords(t: TriangleVec, vecs: Vector3[]) {
    const B = t[1].clone()
    const U = t[2].clone().sub(B)
    const V = t[0].clone().sub(B)

    const M = new Mat2().set(
        U.x, V.x,
        U.y, V.y
    )

    B.z = 0;
    return vecs.map(i=>{
        const v = i.clone()
        M.apply2Vector3(v)
        v.add(B)
        return v
    })
}


export class FuzzyWarp {
    // onto mapping from T1 to T0
    lookup = new Int32Array()
    keyPoints = new Array<number>()
    T0_local = new Array<Vector3>()
    T1_local = new Array<Vector3>()

    //T1_to_T0 = new Array<Trans>()
    //T0_to_T1 = new Array<Trans>()

    Trans_T1_to_T0: Trans = {
        translate: new Vector2(),
        theta: 0,
        affine: new Mat2(),
        begin: new Vector3()
    }

    // for debug purpose
    T0 = new Array<Vector3>()
    T1 = new Array<Vector3>()

    referenceLocal: any = null

    init(T0:Vector3[], T1:Vector3[], params: FuzzyParams) {
        this.T0 = [...T0]
        this.T1 = [...T1]

        this.lookup = fuzzySimGraph(params.sim_w1, params.sim_w2, T0, T1);
        this.keyPoints = smoothKeyPoints(T0, T1, this.lookup, params)

        let k = this.keyPoints
        this.T1_local = global2LocalCoords(
            [T1[k[0]], T1[k[1]], T1[k[2]]],
            T1
        )

        k = this.keyPoints.map(v=>this.lookup[v])
        this.T0_local = global2LocalCoords(
            [T0[k[0]], T0[k[1]], T0[k[2]]],
            T0
        )
        
        this.referenceLocal = [T0[k[0]], T0[k[1]], T0[k[2]]]
        const debug_T0_Global = local2GlobalCoords(
            [T0[k[0]], T0[k[1]], T0[k[2]]],
            this.T0_local
        )
        
        const k1 = this.keyPoints
        this.Trans_T1_to_T0 = computeTransform(
            [T1[k1[0]], T1[k1[1]], T1[k1[2]]],
            [T0[k[0]], T0[k[1]], T0[k[2]]]
        )
        
        /*
        this.T0_to_T1 = []
        this.T1_to_T0 = []

        for(let i = 0; i < this.keyPoints.length; ++i) {
            const a = i;
            const b = (i+1) % this.keyPoints.length
            const c = (i+2) % this.keyPoints.length

            const a0 = this.lookup[a]
            const b0 = this.lookup[b]
            const c0 = this.lookup[c]
            this.T0_to_T1.push(computeTransform(
                [T0[a0], T0[b0], T0[c0]],
                [T1[a], T1[b], T1[c]]
            ))
            
            this.T1_to_T0.push(computeTransform(
                [T1[a], T1[b], T1[c]],
                [T0[a0], T0[b0], T0[c0]]
            ))
        }*/
    }

    private _interpLocal(t:number) {
        return this.T1_local.map((v, idx)=>{
            const v0 = v.clone().multiplyScalar(1-t).add(
                this.T0_local[this.lookup[idx]].clone().multiplyScalar(t)
            )
            v0.z = v.z
            return v0
        })
    }

    interp(t: number) {
        const trans = this.Trans_T1_to_T0 // this.T1_to_T0[1]

        const A0 = new Mat2().scaledIndentity(1-t)
        const B0 = new Mat2().fromRotate(t * trans.theta)
        const C0 = trans.affine.clone().mulScalar(t)
        const D0 = new Mat2().mul(B0, C0)
        A0.add(D0)
        /*
        const newGlobalCoords = this.T1_to_T0.map((v, idx)=>{
            const r = v.begin.clone()
            A0.apply2Vector3(r);
            return r;
        });
        */
        const newGlobalCoords = this.keyPoints.map(v=>{
            const i = this.T1[v].clone()
            A0.apply2Vector3(i)
            return i
        })

        for(let v of newGlobalCoords) {
            v.add(new Vector3(trans.translate.x*t, trans.translate.y*t))
        }

        //return local2GlobalCoords(
        //    newGlobalCoords as TriangleVec,
        //    this.T0_local
        //)

        return local2GlobalCoords(
            newGlobalCoords as TriangleVec,
            this._interpLocal(t)
        )
    }
}

export function getDefaultFuzzyParams() : FuzzyParams {
    return{
        smooth_a: 1.0/3,
        smooth_b: 1.0/3,
        smooth_c: 1.0/3,
        smooth_w1: 0.5,
        smooth_w2: 0.5,

        sim_w1: 0.5,
        sim_w2: 0.5
    }
}

function AssertArrayEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>) {
    if(a.length !== b.length) {
        throw "Length no match"
    }
    for(let i = 0; i < a.length; ++i) {
        if(a[i] !== b[i]) {
            throw `Mismatch at: ${i}`
        }
    }
}

const TestFuzzyGraph = ()=>{
    const data = [
        [-1.0, -1.0, 0],
        [0, -0.9, 0],
        [0, 0, 0],
        [-1, 1, 0]
    ]

    const vdata = data.map(v=>new Vector3(...v))
    const arr = new Array<number>()
    const vdata2 = vdata.map(v=>{
        const x = v.clone()
        x.x += 2;
        return x;
    })
    for(let i = 0; i < vdata.length; ++i) {
        arr.push(i)
    }

    vdata2.push(vdata2.shift() as Vector3);
    arr.push(arr.shift() as number);


    const lookup = fuzzySimGraph(0.5, 0.5, vdata, vdata2)
    AssertArrayEqual(lookup, arr)

    const params = getDefaultFuzzyParams()
    const keyPoints = smoothKeyPoints(vdata, vdata2, lookup, params)

    const fuzzy = new FuzzyWarp();
    fuzzy.init(vdata, vdata2, params)
    fuzzy.interp(0.1);
    fuzzy.interp(1);
}

const Test = () => {
    //TestFuzzyGraph()
}
export { Test }