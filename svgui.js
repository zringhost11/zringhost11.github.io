function ctrlTimeline(x,y,w,h){
    var osvg = document.getElementById("svg");
    if(null != osvg){
        //var g = createTag("g",{"font-size":15,font:"sans-serif",fill:"black","text-anchor":"middle"});
        var g = document.getElementById("ctrlTimeline");
        if(null == g){
            g = createCtrlTimeline();
            //osvg.insertBefore(g,osvg.childNodes[0]);
            osvg.appendChild(g);
        }
        //g.setAttribute("translate",`translate(${x},${y})`);
        g.setAttribute("x",x-5);
        g.setAttribute("y",y);
        g.setAttribute("width",w+10);
        g.setAttribute("height",h+100);
        g = document.getElementById("ctrlUI");
        g.setAttribute("y",h+20);

        g = document.getElementById("cursor2");
        g.setAttribute("y2",h+20);
        g = document.getElementById("cursor3");
        g.setAttribute("y",h+20);
    }
}
function createCtrlTimeline(){
    var g = createTag('svg',{'xmlns':svgNS,class:"full",id:"ctrlTimeline"});

    var ctrlUI = createTag('svg',{'xmlns':svgNS,id:"ctrlUI"});
    g.appendChild(ctrlUI);
    var rect = createTag("rect",{width:"100%",height:10,y:15,rx:5,ry:5,style:"stroke:#999999;stroke-width:2;fill:#cccccc"});
    ctrlUI.appendChild(rect);

    var cursor = createTag('svg',{'xmlns':svgNS,id:"cursor"});
    g.appendChild(cursor);

    var line = createTag("line",{id:"cursor2",x1:5,y1:"0",x2:5,y2:"100",style:"stroke:#ff0000;stroke-width:1;fill:#ff0000"});
    cursor.appendChild(line);

    var cursor3 = createTag('svg',{'xmlns':svgNS,id:"cursor3"});
    cursor.appendChild(cursor3);
    var polygon = createTag("polygon",{points:"5 0,0 10,0 30,10 30,10 10",style:"stroke:#999999;stroke-width:1;fill:#000000"});
    cursor3.appendChild(polygon);

    var t = createTag("text",{x:5,y:45,id:"cursorFont"});
    t.innerHTML = "0t";
    cursor3.appendChild(t);

    polygon.onmousedown = mouseHandle2;

    return g;
}

function setT(t){
    var g = document.getElementById("ctrlTimeline");
    document.getElementById("cursorFont").innerHTML = Number(t).toFixed(2)+"t";
    var w = Number(g.getAttribute("width"))-10;
    var setX = w*t;
    document.getElementById("cursor").setAttribute("x",setX);
}

var downX;
var startX;
function mouseHandle2(e){
    if("mousedown" == e.type){
        downX = e.clientX;
        try{
            uiStop();
        }catch(err){}
        startX = Number(document.getElementById("cursor").getAttribute("x"));
        document.body.onmousemove = mouseHandle2;
        document.body.onmouseup = mouseHandle2;
        document.body.onselectstart = new Function("return false"); 
    }else if("mousemove" == e.type){
        var mx = e.clientX-downX;
        var setX = startX+mx;
        if(0>setX)setX = 0;
        else{
            var g = document.getElementById("ctrlTimeline");
            var w = Number(g.getAttribute("width"));
            if(setX>w-10){
                setX = w-10;
            }
            var t = setX/(w-10);
            try{
                currTime = maxTime*t;
                resetPoint();
            }catch(err){
                setT(t);
            }
        }
        
    }else if("mouseup" == e.type){
        document.body.onmousemove = null;
        document.body.onmouseup = null;
        document.body.onselectstart = null;
    }
}