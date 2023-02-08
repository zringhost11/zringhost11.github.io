let svgNS="http://www.w3.org/2000/svg";

var maxTime = 5000;
var currTime = 0;
var pTime;
//var parr = [{x:100,y:100},{x:200,y:300},{x:300,y:100},{x:400,y:300},{x:500,y:100},{x:600,y:300}];
var parr = [{x:100,y:100},{x:200,y:319},{x:371,y:352},{x:522,y:100}];

var formatTime = true;


function addCSS(cssText){
    var style = document.createElement('style');
    head = document.head || document.getElementsByTagName('head')[0];
    
    var textNode = document.createTextNode(cssText);
    style.appendChild(textNode);
    head.appendChild(style); 
}

function resetPoint(){
    var len = parr.length;
    var pp = null;
    for(var i = 0;i<len;i++){
        var p = parr[i]
        drawPoint(p,"p"+i,g);
        if(null != pp){
            drawLine(pp,p,"l_0_"+i);
        }
        pp = p;
    }
    if(null != pnamearr){
        for(var i = pnamearr.length-1;i>=0;i--){
            initPath(pnamearr[i]);
        }
    }
    
    //currTime = maxTime*0.5;
    var num = Math.round(currTime/16);
    var bl = currTime/maxTime;
    if(1<bl)bl = 1;
    bl = bl/num;
    var t = 0;
    for(var i = 0;i<num;i++){
        drawLines(t,null,i == num);
        t += bl;
    }
    currT = NaN;
    setCurrT(currTime/maxTime);
    try{
        if(null != updateReferenceLine){
            updateReferenceLine(false);
        }
    }catch(err){}
}

document.body.style = "margin:0;padding:0;";
document.body.onmousedown = mouseHandle;
        addCSS(`.full{position:absolute;
            width:100%; 
			height:100%;}`);
        var osvg=createTag('svg',{'xmlns':svgNS,class:"full",id:"svg"});
        
        

        var g = createTag("g",{"font-size":15,font:"sans-serif",fill:"black","text-anchor":"middle"});
        osvg.appendChild(g);
        document.body.appendChild(osvg);

        resetPoint();





        function createTag(tag,obj){
            var oTag=document.createElementNS(svgNS,tag);
            for(var attr in obj){
                oTag.setAttribute(attr,obj[attr]);
            }

            return oTag;

        }
        function drawPoint(pobj,id,g){
            var p = document.getElementById(id+"_f");
            if(null == p){
                p = createTag("text",{x:pobj.x,y:pobj.y,dx:20,id:id+"_f"});
                g.appendChild(p);
            }else{
                p.setAttribute("x",pobj.x);
                p.setAttribute("y",pobj.y);
            }
            p.innerHTML = id+`(${Math.floor(pobj.x)},${Math.floor(pobj.y)})`;
            p = document.getElementById(id);
            if(null == p){
                p = createTag("circle",{cx:pobj.x,cy:pobj.y,r:5,fill:"#b9b9b9",style:"cursor:move",id:id});
                p.onmousedown = mouseHandle;
                g.appendChild(p);
            }else{
                p.setAttribute("cx",pobj.x);
                p.setAttribute("cy",pobj.y);
            }

            
        }
        var isHiddenLine;
        function drawLine(p0,p1,id,col = "#b9b9b9"){
            var oline = document.getElementById(id);

            if(null == oline){
                oline = createTag('line',{id:id,'x1':p0.x,'y1':p0.y,'x2':p1.x,'y2':p1.y,'stroke':col,'stroke-width':'2',"pointer-events":"none"});
                g.appendChild(oline);
            }else{
                oline.setAttribute("x1",p0.x);
                oline.setAttribute("y1",p0.y);
                oline.setAttribute("x2",p1.x);
                oline.setAttribute("y2",p1.y);
            }
            if(isHiddenLine){
                oline.style.display = "none";
            }else{
                oline.style.display = "";
            }
            
        }
        var mouseDownID;
        var pDownTime;
        function mouseHandle(e){
            if("mousedown" == e.type){
                mouseDownID = null;
                if("" == e.target.id || null == e.target.id){
                    var now = new Date().getTime();
                    if(200>now-pDownTime){
                        document.body.onselectstart = new Function("return false");
                        pDownTime = NaN;
                        var x = e.clientX;
                        var y = e.clientY;
                        parr.push({x:x,y:y});
                        resetPoint();
                    }else{
                        pDownTime = now;
                    }

                }else{
                    mouseDownID = e.target.id.substr(1);
                    document.body.onmousemove = mouseHandle;
                    document.body.onmouseup = mouseHandle;
                    document.body.onselectstart = new Function("return false"); 
                }
            }else if("mouseup" == e.type){
                document.body.onmousemove = null;
                document.body.onmouseup = null;
                document.body.onselectstart = null;
            }else if(null != mouseDownID){
                var x = e.clientX;
                var y = e.clientY;
                var p = parr[mouseDownID];
                if(null == p)return;
                p.x = x;
                p.y = y;
                resetPoint();
            }
        }


        function initMovePath(id,col = null){
            var path = document.getElementById(id+"_p");
            var mc = document.getElementById(id);
            if(null == col)col = "#0000ff";
            if(null == path){
                path = createTag("path",{id:id+"_p","stroke":col,'stroke-width':'2',fill:"none","pointer-events":"none"});
                g.appendChild(path);
            }
            if(null == mc){
                mc = createTag("circle",{id:id,r:3,fill:col,"pointer-events":"none"});
                g.appendChild(mc);
            }
        }

var isStop = true;
function stop(){
    isStop = true;
    clearInterval(timeid);
}

var timeid;
var currT;

function intervalFun(){
    if(0 == currTime){
        if(null != pnamearr){
            for(var i = pnamearr.length-1;i>=0;i--){
                initPath(pnamearr[i]);
            }
        }
    }

    var now = new Date().getTime();
    if(isNaN(pTime)){
        pTime = now;
        return;
    }
    if(!isStop){
        currTime += now-pTime;
        pTime = now;
    }


    //currT = currTime/maxTime;
    setCurrT(currTime/maxTime);
    
}

function setCurrT(t){
    if(t == currT)return;
    if(1<t){
        t = 1;
        currTime = 0;
    }else{
        currTime = maxTime*t;
    }
    currT = t;
    try{
        setT(currT);
    }catch(err){}

    drawLines(currT);
}

function play(){
    if(isStop){
        pTime = NaN;
        isStop = false;
    }
    clearInterval(timeid);
    timeid = setInterval(intervalFun,16);
}
play();
var pnamearr;
function drawLines(t,arr = null,isDrawLine = true,pnum = 0){
    if(null == arr){
        arr = parr;
        pnamearr = [];
    }

    if(0 == pnum && formatTime){
        try{
            t = formatT(t,arr);
        }catch(err){}
    }


    var pp = null;
    var ppname = null;
    var len = arr.length;
    var nparr = null;
    var col = null;
    var isDrawCurves = false;
    if(2 == len){
        isDrawCurves = true;
        col = "#ff0000";
    }
    for(var i = 0;i<len;i++){
        p = arr[i];
        if(null != pp){

            pobj = getPathPoint(t,pp,p);
            var pname = "p_"+pnum+"_"+i;
            if(isDrawCurves){
                pname = "curvesPath";
            }
            if(isDrawLine || isDrawCurves){
                updatePath(pp,pobj.x,pobj.y,pname,col,isDrawCurves);
            }
            pnamearr.push(pname);
            if(null == nparr)nparr = [];
            nparr.push(pobj);
            if(null != ppname){
                if(isDrawLine){
                    darwNewLine(ppname,pname,ppname+"::"+pname);
                }
            }
            ppname = pname;
        }
        pp = p;
    }
    if(null != nparr && 1<nparr.length){
        drawLines(t,nparr,isDrawLine,pnum+1);
    }


}


function initPath(id){
    var path = document.getElementById(id+"_p");
    if(null == path)return null;
    path.setAttribute("d","");
}

function darwNewLine(id1,id2,id3,col){
    var mc1 = document.getElementById(id1);
    var mc2 = document.getElementById(id2);
    if(null == mc1.getAttribute("cx") || null == mc2.getAttribute("cx"))return;
    var p0 = {x:mc1.getAttribute("cx"),y:mc1.getAttribute("cy")};
    var p1 = {x:mc2.getAttribute("cx"),y:mc2.getAttribute("cy")};

    drawLine(p0,p1,id3,col);

}

function getPathPoint(t,p0,p1){
    var x = b(t,p0.x,p1.x);
    var y = b(t,p0.y,p1.y);
    return {x,y};
}

function updatePath(p0,x,y,id,col = null,isDrawCurves = false){

    var mc = document.getElementById(id);
    if(null != mc){
        mc.setAttribute("cx",x);
        mc.setAttribute("cy",y);
    }


    var path = document.getElementById(id+"_p");
    if(null == path){
        initMovePath(id,col);
        path = document.getElementById(id+"_p");
    }

    if(!isDrawCurves){
        if(isHiddenLine){
            if(null != mc)mc.style.display = "none";
            path.style.display = "none";
        }else{
            if(null != mc)mc.style.display = "";
            path.style.display = "";
        }
    }


    var dstr = path.getAttribute("d");
    if("" == dstr || null == dstr || !isDrawCurves){
        dstr = "M"+p0.x+" "+p0.y;
    }
    
    dstr += "L"+x+" "+y;
    path.setAttribute("d",dstr);
    if(isDrawCurves){
        path.parentElement.appendChild(path);
    }
}


function b(t,p0,p1){
    var val = (1-t)*p0+t*p1;
    return val;
}

