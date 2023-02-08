function bezier3Frame(startFrame, endFrame, t) {
    var totalT = endFrame.t - startFrame.t;
    t = t / totalT;
    var t2 = t * t;
    var t3 = t2 * t;
    var mt = (1 - t);
    var mt2 = mt * mt;
    var mt3 = mt2 * mt;
    var c = startFrame.outTangent * startFrame.outWidth;
    var d = endFrame.inTangent * endFrame.inWidth;
    return startFrame.val * mt3 + c * 3 * mt2 * t + d * 3 * mt * t2 + endFrame.val * t3;
}
function bezier(t, p0, p1) {
    var val = (1 - t) * p0 + t * p1;
    return val;
}
function getInWeight(p1x, p1cx, p0x) {
    return Math.abs((p1x - p1cx) / (p1x - p0x));
}
function getOutWeight(p0x, p0cx, p1x) {
    return Math.abs((p0cx - p0x) / (p1x - p0x));
}
function getCtrlPoint(startVal, endVal, outWeight, outTangent, inWeight, inTangent) {
    var p0x = startVal.x;
    var p3x = endVal.x;
    var p1x = outWeight * (p3x - p0x) + p0x;
    var p2x = p3x - inWeight * (p3x - p0x);
    var p0y = startVal.y;
    var p3y = endVal.y;
    var p1y = outTangent * (p1x - p0x) + p0y;
    var p2y = -inTangent * (p3x - p2x) + p3y;
    return { c0: { x: p1x, y: p1y }, c1: { x: p2x, y: p2y } };
}
function hermiteInterpolate(outTangent, inTangent, startValue, endValue, t, dur, outWeight, inWeight) {
    if (outWeight === void 0) { outWeight = NaN; }
    if (inWeight === void 0) { inWeight = NaN; }
    if (!isNaN(outWeight) && !isNaN(inWeight)) {
        return hermiteCurveSplineWeight(startValue, 0, outWeight, outTangent, endValue, dur, inWeight, inTangent, t);
    }
    if (Math.abs(outTangent) == Infinity || Math.abs(inTangent) == Infinity) {
        if (0 > outTangent || 0 < inTangent)
            return startValue;
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
    x = +x; // convert to a number
    if (x === 0 || isNaN(x))
        return x;
    return x > 0 ? 1 : -1;
}
function formatT(t, parr) {
    if (4 != parr.length)
        return t;
    var outWeight = getOutWeight(parr[0].x, parr[1].x, parr[3].x);
    var inWeight = getInWeight(parr[3].x, parr[2].x, parr[0].x);
    t = hermiteCurveSplineT(outWeight, inWeight, t);
    return t;
}
function hermiteCurveSplineT(outWeight, inWeight, t) {
    var Eps = 2.22e-16;
    var x = t;
    var x1 = 0;
    var wt1 = outWeight;
    var x2 = 1;
    var wt2 = inWeight;
    var dx = x2 - x1;
    x = (x - x1) / dx;
    var wt2s = 1 - wt2;
    t = 0.5;
    var t2 = 0;
    if (wt1 == 1 / 3.0 && wt2 == 1 / 3.0) {
        t = x;
        t2 = 1 - t;
    }
    else {
        while (true) {
            t2 = (1 - t);
            var fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
            if (Math.abs(fg) <= 2.5 * Eps) {
                break;
            }
            var fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
            var fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
            var fpppg = 18 * wt1 - 18 * wt2s + 6;
            t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
        }
    }
    return t;
}
function hermiteCurveSplineWeight(frameValue, frametime, frameOutWeight, frameOutTangent, nextframeValue, nextframetime, nextframeInweight, nextframeIntangent, t) {
    var Eps = 2.22e-16;
    var x = t;
    var x1 = frametime;
    var y1 = frameValue;
    var wt1 = frameOutWeight;
    var x2 = nextframetime;
    var y2 = nextframeValue;
    var wt2 = nextframeInweight;
    var dx = x2 - x1;
    var dy = y2 - y1;
    // let dy = Math.max(y2 - y1, Eps);
    dy = Math.max(Math.abs(dy), Eps) * (dy < 0 ? -1 : 1);
    x = (x - x1) / dx;
    var yp1 = frameOutTangent;
    var yp2 = nextframeIntangent;
    if (!isFinite(yp1) || !isFinite(yp2) || x == 1) {
        return frameValue;
    }
    yp1 = yp1 * dx / dy;
    yp2 = yp2 * dx / dy;
    var wt2s = 1 - wt2;
    t = 0.5;
    var t2 = 0;
    if (wt1 == 1 / 3.0 && wt2 == 1 / 3.0) {
        t = x;
        t2 = 1 - t;
    }
    else {
        while (true) {
            t2 = (1 - t);
            var fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
            if (Math.abs(fg) <= 2.5 * Eps) {
                //console.log("t: ", t);
                break;
            }
            // third order householder method
            var fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
            var fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
            var fpppg = 18 * wt1 - 18 * wt2s + 6;
            t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
        }
    }
    var y = 3 * t2 * t2 * t * wt1 * yp1 + 3 * t2 * t * t * (1 - wt2 * yp2) + t * t * t;
    return y * dy + y1;
}
function bezie3(t, dur, startNum, endNum, outTangent, inTangent, outWeight, inWeight) {
    return hermiteInterpolate(outTangent, inTangent, startNum, endNum, t, dur, outWeight, inWeight);
    /*var p0 = startNum;
    var p1 = 477;
    var p2 = 477;
    var p3 = endNum;
    var ret:any = insertBezier(t,p0,p1,p2,p3);
    return ret.val;*/
}
function bezier3XY(t, startVal, endVal, outWeight, outTangent, inWeight, inTangent) {
    var p0x = startVal.x;
    var p3x = endVal.x;
    var p0y = startVal.y;
    var p3y = endVal.y;
    var o = this.getCtrlPoint(startVal, endVal, outWeight, outTangent, inWeight, inTangent);
    var p1x = o.c0.x;
    var p1y = o.c0.y;
    var p2x = o.c1.x;
    var p2y = o.c1.y;
    var x = bezier3P(t, p0x, p1x, p2x, p3x);
    var y = bezier3P(t, p0y, p1y, p2y, p3y);
    return { x: x, y: y };
}
function bezier3P(t, p0, p1, p2, p3) {
    var ret = insertBezier(t, p0, p1, p2, p3);
    return ret.val;
}
function insertBezier(t, p0, p1, p2, p3) {
    p0 = bezier(t, p0, p1);
    p1 = bezier(t, p1, p2);
    p2 = bezier(t, p2, p3);
    var ret = {};
    ret.pc0 = p0;
    ret.nc1 = p2;
    p0 = bezier(t, p0, p1);
    p1 = bezier(t, p1, p2);
    ret.c0 = p0;
    ret.c1 = p1;
    ret.val = bezier(t, p0, p1);
    return ret;
}
