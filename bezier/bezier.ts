function bezier3Frame(startFrame:{val:number,t:number,outWidth:number,outTangent:number},endFrame:{val:number,t:number,inWidth:number,inTangent:number},t:number):number{
    var totalT:number = endFrame.t-startFrame.t;
    t = t/totalT;
    var t2 = t*t;
    var t3 = t2*t;
    var mt:number = (1-t);
    var mt2 = mt*mt;
    var mt3 = mt2*mt;

    var c:number = startFrame.outTangent*startFrame.outWidth;
    var d:number = endFrame.inTangent*endFrame.inWidth;
    
    return startFrame.val*mt3+c*3*mt2*t+d*3*mt*t2+endFrame.val*t3;
}

function bezier(t:number,p0:number,p1:number):number{
    var val:number = (1-t)*p0+t*p1;
    return val;
}

function getInWeight(p1x:number,p1cx:number,p0x:number){
    return Math.abs((p1x-p1cx)/(p1x-p0x));
}
function getOutWeight(p0x:number,p0cx:number,p1x:number){
    return Math.abs((p0cx-p0x)/(p1x-p0x));
}


function getCtrlPoint(startVal:{x:number,y:number},endVal:{x:number,y:number},outWeight:number,outTangent:number,inWeight:number,inTangent:number):{c0:{x:number,y:number},c1:{x:number,y:number}}{
    var p0x:number = startVal.x;
    var p3x:number = endVal.x;
    var p1x:number = outWeight*(p3x-p0x)+p0x;
    var p2x:number = p3x-inWeight*(p3x-p0x);
    var p0y:number = startVal.y;
    var p3y:number = endVal.y;
    var p1y:number = outTangent*(p1x-p0x)+p0y;
    var p2y:number = -inTangent*(p3x-p2x)+p3y;
    return {c0:{x:p1x,y:p1y},c1:{x:p2x,y:p2y}};
}

function hermiteInterpolate(outTangent:number, inTangent:number, startValue:number,endValue:number,t: number, dur: number,outWeight:number = NaN,inWeight:number = NaN): number {
    
    if(!isNaN(outWeight) && !isNaN(inWeight)){
        return hermiteCurveSplineWeight(startValue,0,outWeight,outTangent,endValue,dur,inWeight,inTangent,t);
    }
    
    
    if(Math.abs(outTangent) == Infinity || Math.abs(inTangent) == Infinity){
        if(0>outTangent || 0<inTangent)return startValue;
        return startValue;
    }
    var t2 = t * t;
    var t3 = t2 * t;
    var a = 2.0 * t3 - 3.0 * t2 + 1.0;
    var b = t3 - 2.0 * t2 + t;
    var c = t3 - t2;
    var d = -2.0 * t3 + 3.0 * t2;
    return a * startValue + b * outTangent * dur + c * inTangent * dur + d * endValue;
}

function sign(x) {
    x = +x ;// convert to a number
    if (x === 0 || isNaN(x))
        return x;
    return x > 0 ? 1 : -1;
}

function formatT(t:number,parr:{x:number,y:number}[]):number{
    if(4 != parr.length)return t;

    var outWeight = getOutWeight(parr[0].x,parr[1].x,parr[3].x);
    var inWeight = getInWeight(parr[3].x,parr[2].x,parr[0].x);
    t = hermiteCurveSplineT(outWeight,inWeight,t);

    return t;
}


function hermiteCurveSplineT(outWeight: number, inWeight: number, t: number):number{
    let Eps = 2.22e-16;

    let x = t;
    let x1 = 0;
    let wt1 = outWeight;
    let x2 = 1;
    let wt2 = inWeight;

    let dx = x2 - x1;
    

    x = (x - x1) / dx;



    let wt2s = 1 - wt2;

    t = 0.5;
    let t2 = 0;

    if (wt1 == 1 / 3.0 && wt2 == 1 / 3.0) {
        t = x;
        t2 = 1 - t;
    }
    else {
        while (true) {
            t2 = (1 - t);
            let fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
            if (Math.abs(fg) <= 2.5 * Eps) {
                
                break;
            }

            let fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
            let fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
            let fpppg = 18 * wt1 - 18 * wt2s + 6;

            t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
        }
    }
    return t;
}

function hermiteCurveSplineWeight(frameValue: number, frametime: number, frameOutWeight: number, frameOutTangent: number, nextframeValue: number, nextframetime: number, nextframeInweight: number, nextframeIntangent: number, t: number) {
    let Eps = 2.22e-16;

    let x = t;
    let x1 = frametime;
    let y1 = frameValue;
    let wt1 = frameOutWeight;
    let x2 = nextframetime;
    let y2 = nextframeValue;
    let wt2 = nextframeInweight;

    let dx = x2 - x1;
    let dy = y2 - y1;
    // let dy = Math.max(y2 - y1, Eps);
    dy  = Math.max(Math.abs(dy), Eps) * (dy < 0 ? -1 : 1);

    x = (x - x1) / dx;

    let yp1 = frameOutTangent;
    let yp2 = nextframeIntangent;

    if (!isFinite(yp1) || !isFinite(yp2) || x == 1) {
        return frameValue;
    }

    yp1 = yp1 * dx / dy;
    yp2 = yp2 * dx / dy;

    let wt2s = 1 - wt2;

    t = 0.5;
    let t2 = 0;

    if (wt1 == 1 / 3.0 && wt2 == 1 / 3.0) {
        t = x;
        t2 = 1 - t;
    }
    else {
        while (true) {
            t2 = (1 - t);
            let fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
            if (Math.abs(fg) <= 2.5 * Eps) {
                //console.log("t: ", t);
                
                break;
            }

            // third order householder method
            let fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
            let fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
            let fpppg = 18 * wt1 - 18 * wt2s + 6;

            t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
        }
    }

    let y = 3 * t2 * t2 * t * wt1 * yp1 + 3 * t2 * t * t * (1 - wt2 * yp2) + t * t * t;

    return y * dy + y1;
}



function bezie3(t:number,dur:number,startNum:number,endNum:number,outTangent:number,inTangent:number,outWeight:number,inWeight:number){
    return hermiteInterpolate(outTangent,inTangent,startNum,endNum,t,dur,outWeight,inWeight);
    /*var p0 = startNum;
    var p1 = 477;
    var p2 = 477;
    var p3 = endNum;
    var ret:any = insertBezier(t,p0,p1,p2,p3);
    return ret.val;*/
}
function bezier3XY(t:number,startVal:{x:number,y:number},endVal:{x:number,y:number},outWeight:number,outTangent:number,inWeight:number,inTangent:number):{x:number,y:number}{
    var p0x:number = startVal.x;
    var p3x:number = endVal.x;
    var p0y:number = startVal.y;
    var p3y:number = endVal.y;
    var o = this.getCtrlPoint(startVal,endVal,outWeight,outTangent,inWeight,inTangent);
    var p1x:number = o.c0.x;
    var p1y:number = o.c0.y;
    var p2x:number = o.c1.x;
    var p2y:number = o.c1.y;
   
    var x:number = bezier3P(t,p0x,p1x,p2x,p3x);
    var y:number = bezier3P(t,p0y,p1y,p2y,p3y);
    return {x:x,y:y};
}

function bezier3P(t:number,p0:number,p1:number,p2:number,p3:number):number{
    var ret:any = insertBezier(t,p0,p1,p2,p3);
    return ret.val;
}

function insertBezier(t:number,p0:number,p1:number,p2:number,p3:number){
    p0 = bezier(t,p0,p1);
    p1 = bezier(t,p1,p2);
    p2 = bezier(t,p2,p3);


    var ret:any = {};
    ret.pc0 = p0;
    ret.nc1 = p2;

    p0 = bezier(t,p0,p1);
    p1 = bezier(t,p1,p2);

    ret.c0 = p0;
    ret.c1 = p1;

    ret.val = bezier(t,p0,p1);

    return ret;

}