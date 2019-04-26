
import  WebAR  from './libs/webar'
import $ from './libs/jquery-2.1.0'
import load from './libs/load'

import '../css/reset.css'
import '../css/main.css'

const webAR = new WebAR(1000, '/webar/recognize');
	
window.requestAnimationFrame = window.requestAnimationFrame || 
							   window.mozRequestAnimationFrame || 
							   window.webkitRequestAnimationFrame || 
							   window.msRequestAnimationFrame;

let cameraArr = [],deviceId; //设备摄像头参数
let video = document.getElementById("video");
const videoSetting = {'width': 480, 'height': 360};

let u = navigator.userAgent, app =  navigator.appVersion;
let browser = {
	versions: {     //移动终端浏览器版本信息
          trident: u.indexOf('Trident') > -1, //IE内核
          presto: u.indexOf('Presto') > -1, //opera内核
          webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
          gecko: u.indexOf('Gecko') > -1 &&  u.indexOf('KHTML') == -1, //火狐内核
          mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),  //ios终端
          android: u.indexOf('Android') > -1||u.indexOf('Linux') > -1, //android终端或uc浏览器
          iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
          iPad: u.indexOf('iPad') > -1, //是否iPad
          webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
	},

	language: (navigator.browserLanguage ||  navigator.language).toLowerCase()
};

let asset = {
	model: "./model/lu0424_A01.fbx",
	needPicFrame: false,
	picData: {
		path: "rain",
		num: 126,
		dom: "#picBox",
		speed: 5
	},
	size: {
		pic: 0.3,
		model: 0.7
	},
	tData: {
		needMove: true,
		cameraPos: {
			x: 0,
			y: 0,
			z: 9000
		},
		modPos: {
			x: 0,
			y: -2500,
			z: 0
		},
		modRotateY: 0,
		controls: {
			minDis: 6000,
			maxDis: 14000
		},
		speed: {
			move: 15,
			rotate: 180
		}
	}
}


let wHeight = $(window).height(),
	wWidth = $(window).width();
let mob = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);  //判断移动端还是PC端
let touch = mob ? "touchend" : "click";
let touchstart = mob ? "touchstart" : "mousedown";
let touchend = mob ? 'touchend' : 'mouseup';
let touchmove = mob ? 'touchmove' : 'mousemove';

let imgIndex = 0, //图片播放帧数
oldIndex,
interval = 0, //播放次数
playImg = false;

//播放图片
const update = () =>{
	interval += 1;
	if(interval >= asset.picData.speed){
		interval = 0;
    	if(oldIndex>=0){
    		$(asset.picData.dom+" img").eq(oldIndex).attr("class","hide");
    	}
    	if(oldIndex>=2){
    		$(asset.picData.dom+" img").eq(0).attr("class","ohide");
    	}
    	if(imgIndex<asset.picData.num-3){
    		$(asset.picData.dom+" img").eq(imgIndex+1).attr("class","ohide");
    		$(asset.picData.dom+" img").eq(imgIndex+2).attr("class","ohide");
    	}
    	
    	$(asset.picData.dom+" img").eq(imgIndex).attr("class","show");
    	oldIndex = imgIndex;
		if(imgIndex >= asset.picData.num-1){
			imgIndex = 0;
		}else{
			imgIndex++;
		}
	}
};

//加载图片
const render = (data) => {
	let val = 0,
		percent=asset.size.pic;
	let {path,num,dom} = data;
    for (let i=0;i<num;i++) {
    	let n = i+1;
		let pic = $('<img class="hide" src="resource/'+ path +'/yu ('+ n +').png" />')
		$(dom).append(pic);
		
    	pic.on("load",()=>{
			val += (n/ num)*percent;
			val = val > percent ? percent : val;
			load.setProgress(val);
			if(n == num){
				setTimeout(()=>{
					initThree();
				},500)
			}
		})
	}
}

const deteSys = (call) => {
	// 列出视频设备
    webAR.listCamera(cameraArr)
    .then(() => {
    	console.log("成功!");
    	if (browser.versions.ios) {//ios系统
			deviceId = cameraArr[0];
		}else{
			deviceId = cameraArr[cameraArr.length-1];
		}
		if(call){
			call()
		}
    })
    .catch((err) => {
        console.info(err);
        alert('没有可使用的视频设备');
    });
}

const openCamera = (video, deviceId, videoSetting,callback) => {
    webAR.openCamera(video, deviceId, videoSetting)
    .then((msg) => {
        // 打开摄像头成功
        // 将视频铺满全屏(简单处理)
        let videoWidth = video.offsetWidth;
        let videoHeight = video.offsetHeight;

        if (window.innerWidth < window.innerHeight) {
            // 竖屏
            if (videoHeight < window.innerHeight) {
                video.setAttribute('height', window.innerHeight.toString() +'px');
            }
        }  else {
            // 横屏
            if (videoWidth < window.innerWidth) {
                video.setAttribute('width', window.innerWidth.toString() +'px');
            }
        }
        callback();
	})
    .catch((err) => {
        alert(err);
        alert('抱歉，您的设备暂不支持该功能！');
    });
};

   
let start = () => {
	if (!browser.versions.ios) {
		let success = () => {
	    	$("#hint").attr("class","");
		}
		openCamera(video, deviceId, videoSetting,success)
	} else {
		$("#hint").attr("class","");
	}
}

let scene,renderer,camera,controls,
stop, // 渲染函数
mascot, // 模型
cubeMap,
comeFlag = true,
actions=[], // 模型动画
prevIndex, // 当前播放的模型动画
ControlDom, // 监听的dom元素
dragMesh, // 点击的mesh
gTimer = null,
gTime = 0,
mouseDown = false, // 手指按下
drag = false, // 是否点击模型
touchFlag = false, // 是否禁用touch
isCamera = false,
titFlag = true, // 是否展示提示
mouseX,mouseY; // 手指位置

let clock = new THREE.Clock();
let mixers = [];

function initThree(){
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({  //渲染器
		alpha: true,  //透明
		antialias:true,//抗锯齿
		preserveDrawingBuffer:true, //preserveDrawingBuffer:true/false是否保存绘图缓冲
		logarithmicDepthBuffer:true, //是采用对数深度检测的内容，场景中物体离视野的距离不一，一般情况下在物体重叠时显示近的物体，特殊情况有可能深度判定有问题，前后材料有重叠破损的表现，此时就需要设置为true
		setPixelRatio:window.devicePixelRatio  //根据设备设置设备像素比
	});
	renderer.shadowMap.enabled = true;
	renderer.setSize(wWidth,wHeight);
	renderer.setClearColor(0xffffff,0);
	renderer.domElement.setAttribute("id","model");
	$("#container").append($(renderer.domElement));
	
	camera = new THREE.PerspectiveCamera(60,wWidth/wHeight,1,30000);
	camera.position.set(asset.tData.cameraPos.x, asset.tData.cameraPos.y, asset.tData.cameraPos.z);
	camera.lookAt(0,0,0);
	if(browser.versions.ios) {
		creatSky()
	} else{
		initControl()
	}
}

function creatSky() {
	var urls =['./textures/px.png','./textures/nx.png','./textures/py.png',
				'./textures/ny.png', './textures/pz.png', './textures/nz.png' ]

	//CubeTextureLoader加载纹理图
	cubeMap = new THREE.CubeTextureLoader().load( urls )
	
	scene.background = cubeMap
	initControl()
}

function initControl(){
	controls = new THREE.OrbitControls(camera,$("#container").get(0));
	controls.enableRotate = false; //禁止相机旋转
	controls.autoRotate = false; //自动旋转
	controls.enablePan = false; //拖拽平移
	controls.enableDamping = true; //惯性
	controls.dampingFactor = 0.5;  //阻尼系数
	controls.minDistance = asset.tData.controls.minDis; //最小距离
	controls.maxDistance = asset.tData.controls.maxDis; //最大距离
	controls.maxPolarAngle = Math.PI*0.5; //限制竖直方向上最大旋转角度 y轴正向为0度
	controls.minPolarAngle = Math.PI*0.5; //限制竖直方向上最小旋转角度 
	controls.minAzimuthAngle = 0; // 限制相机的水平方向视角
	controls.maxAzimuthAngle = 0; // radians
	
	controls.target.set( 0, 0, 0 );
	controls.update();
	initLight();
}

function initLight(){
	let light = new THREE.AmbientLight(0xffffff,0.96);
	scene.add(light);
	initMascot();
}

function initMascot(){
	var loader = new THREE.FBXLoader();
    loader.load(asset.model,
        function(obj){ //引入回调
        	mascot = obj;
        	console.log(obj);
            mascot.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.material.needsUpdate = true;  //允许更新
                    child.castShadow = true; //投射阴影   
                }
            })
			mascot.position.set(asset.tData.modPos.x, asset.tData.modPos.y, asset.tData.modPos.z);
			mascot.rotation.y = asset.tData.modRotateY
            scene.add( mascot );
            $("#help").attr("class","");
            
			cutAnimate()
        },function(data){  //加载等待回调
            var val = (data.loaded / data.total)*asset.size.model+asset.size.pic;
            load.setProgress(val);
            if(val == 1){
            	load.hideSplash();
            	if(asset.needPicFrame){
            		$("#picBox").attr("class","");
            		playImg = true;
            	}
            }
        }
    )
}

//用于生成uuid
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function cutAnimate(){
	mascot.mixer = new THREE.AnimationMixer( mascot );
    mixers.push( mascot.mixer );
	for(let i=0; i<mascot.animations.length;i++){
		let frames = mascot.animations[ i ].tracks,state='',t = 0, ani={},n=0;
		if (mascot.animations[i].name == "Take 001") {
			t = 2.067
			state = "come"
			n = 0
		} else if (mascot.animations[i].name == "Take 002") {
			t = 1.2
			state = "wava"
			n = 1
		} else if (mascot.animations[i].name == "Take 003") {
			t = 1.01
			state = "stage"
			n = 4
		} else if (mascot.animations[i].name == "Take 004") {
			t = 1.733
			state = "jump"
			n = 3
		} else if (mascot.animations[i].name == "Take 005") {
			t = 1.467
			state = "run"
			n = 2
		}
		ani = {
	        duration : t,
	        name : state,
	        tracks : frames,
	        uuid : guid()
	    }
		actions[n] = mascot.mixer.clipAction( ani )
	}
    
	$("#photoBtns").attr('class','show');
	if (!browser.versions.ios) {
		$("#cutBtn").attr('class','');
	}
	playAction ()
    initAdd()
}

function playAction () {
	prevIndex = 0
	actions[prevIndex].play()
	actions[4].setEffectiveTimeScale(0.6)
	actions[0].setLoop(THREE.LoopOnce)
	actions[1].setLoop(THREE.LoopRepeat,1)
	actions[2].setLoop(THREE.LoopRepeat,1)
	actions[3].setLoop(THREE.LoopRepeat,1)
//	mascot.mixer.addEventListener('loop', (e) => {
//		console.log('loop=>',e)
//	})
	mascot.mixer.addEventListener('finished',(e) => {
		actions[prevIndex].stop()
		if(comeFlag){
			prevIndex += 1
			actions[prevIndex].play()
			if (prevIndex >= actions.length - 1){
				comeFlag = false
				touchFlag = true
				actions[1].setLoop(THREE.LoopRepeat,2)
				actions[2].setLoop(THREE.LoopRepeat,2)
				actions[3].setLoop(THREE.LoopRepeat,2)
			}
		} else {
			prevIndex = 4
			actions[prevIndex].play()
		}
	})
}

function initAdd(){
	ControlDom = $("#container").get(0)
    ControlDom.addEventListener(touchstart, onMouseDown, { passive: true })
    animate()
}

//窗口改变更新
function winResize(){
    wHeight = window.innerHeight;
    wWidth = window.innerWidth;
    camera.aspect = wWidth/wHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( wWidth, wHeight );
}
//实时加载
function animate(){
	if(playImg){
		update()
	}
	if ( mixers.length > 0) {
        mixers[ 0 ].update( clock.getDelta() )
    }
	renderer.render(scene,camera)
	stop = requestAnimationFrame(animate)
}

//点击3d场景
function onMouseDown ( e ) {
	if(!touchFlag){
		return false;
	}
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();
    e = e || event;
    ControlDom.addEventListener( touchmove, onMouseMove, { passive: true });
    ControlDom.addEventListener(touchend, onMouseup, { passive: true });
    
    if(e.touches.length==1){
    	mouseX = e.touches ? e.touches[0].pageX : e.clientX;
        mouseY = e.touches ? e.touches[0].pageY : e.clientY;
        
        mouseDown = true;
        //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
        mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( mouseY / window.innerHeight ) * 2 + 1;
        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera( mouse, camera );
        // 获取raycaster直线和所有模型相交的数组集合
        let intersects = raycaster.intersectObjects( scene.children,true );
        //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
        let btn = intersects[0];
		if(btn){
			drag = true;
			dragMesh = btn.object;
			gTimer = setInterval(()=>{
				gTime += 1;
			},20)
		}
    }
}

function doAnimate(){
	let n = Math.floor(Math.random()*3)+1
	actions[prevIndex].stop()
	prevIndex = n
	actions[prevIndex].play()
}

function onMouseMove(e){
    e=e||event;
    if(e.touches.length==1&&mouseDown){ //单指
    	let newMouseX = e.touches ? e.touches[0].pageX : e.clientX,
        newMouseY = e.touches ? e.touches[0].pageY : e.clientY,
        deltaX = newMouseX - mouseX,
	    deltaY = newMouseY - mouseY;
        if(drag && asset.tData.needMove){
        	let dit = new THREE.Vector2();
        	//通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
	        dit.x = ( newMouseX / window.innerWidth ) * 2 - 1;
	        dit.y = - ( newMouseY / window.innerHeight ) * 2 + 1;
	        
	        //通过调用Vector3的unproject()方法(只有vector3能使用)
			//注:pX, pY介于 -1 到1之间
	        let set = new THREE.Vector3(dit.x, dit.y, -1).unproject(camera);
	        //mascot.position.set(set.x,set.y,set.z);
	        mascot.position.x += (deltaX*asset.tData.speed.move);
	        mascot.position.y -= (deltaY*asset.tData.speed.move);
	        
        }else{
	        rotateScene(deltaY,deltaX);
	    }
        mouseX = newMouseX;
	    mouseY = newMouseY;
    }
}

//设置模型旋转速度，可以根据自己的需要调整
function rotateScene(deltaX,deltaY){
    //设置旋转方向和移动方向相反，所以加了个负号
    //let degY = deltaX/200;
    let degX = deltaY/asset.tData.speed.rotate;
    //deg 设置模型旋转的弧度
    mascot.rotation.y += degX;
    
    /*var a = camera.position.x;
    var b = camera.position.z;
    var angle = -Math.PI/288;
    camera.position.x = Math.cos(degX)*a - Math.sin(degX)*b;
    camera.position.z = Math.cos(degX)*b + Math.sin(degX)*a;
    camera.lookAt(0,0,0);*/
}

function onMouseup(e){
	if(gTime<=20 && drag){
    	doAnimate()
    	dragMesh = '';
    }
	drag = false;
	touchFlag = true;
    mouseDown = false;
    ControlDom.removeEventListener(touchmove, onMouseMove);
    ControlDom.removeEventListener(touchend, onMouseup);
	
    clearInterval(gTimer)
    gTimer = null;
    gTime = 0;
    console.log('全部结束')
}

function stopDefault(){
	// 阻止双击放大
    var lastTouchEnd = 0;
    document.addEventListener('touchstart', function(event) {
        event.preventDefault();
    });
    document.addEventListener('touchend', function(event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // 阻止双指放大
    document.addEventListener('gesturestart', function(event) {
        event.preventDefault();
    });
}

document.addEventListener('DOMContentLoaded', () => {
	
//	if (browser.versions.ios) {//ios系统
//      if (u.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {  //是否在微信浏览器打开
//          $("#zg").attr("class","show");
//          return false;
//      }
//  }
	
	//stopDefault()
	if (!browser.versions.ios) {
		deteSys(start); //检测设备
	} else {
		start()
	}
	
	
	$("#know").on(touch, () => {
		$("#hint").attr("class","hide");
		if(titFlag){
			titFlag = false;
			load.createLoadStyle()
	    	load.showSplash()
	    	if(asset.needPicFrame){
	    		render(asset.picData)
	    	}else{
	    		initThree()
	    	}
		}
	})
	
	
	$("#help").on(touch,() => {
		$("#hint").attr("class","");
	})
	
	$("#cutBtn").on(touch,() => {
		$("#model").attr("class","hide");
		$("#photoBtns").attr("class","hide");
		if(asset.needPicFrame && playImg){
			$("#picBox").attr("class","hide");
		}
		let cameraKey = "pre";
		if($("#cutBtn").attr('value') == 'pre'){
			deviceId = cameraArr[0];
			cameraKey = "pos";
		}else{
			deviceId = cameraArr[cameraArr.length-1];
			cameraKey = "pre";
		}
		const cutSuc = () => {
			$("#model").attr("class","");
			$("#photoBtns").attr("class","");
			$("#cutBtn").attr("value",cameraKey);
			if(playImg && asset.needPicFrame){
				$("#picBox").attr("class","");
			}
		}
		openCamera(video, deviceId, videoSetting,cutSuc);
	});
	
	$("#photoBtns").on(touch,() => {
		isCamera = true;
		if(!$("#picBox").is(":hidden") && asset.needPicFrame){
			playImg = false;
		}
		if(prevIndex != 4){
			actions[prevIndex].setEffectiveTimeScale(0);
		}
		$("#help").attr("class","hide");
		if(actions[prevIndex]._clip.name != 'stage'){
			touchFlag = false;
		}
		$("#cutBtn").attr('class','hide');
		$("#photoBtns").attr('class','hide');
		$("#imgBox").attr("class",'');
		$("#spinner").attr('class','center');
	    let vheights = video.offsetHeight,
	    vwidths = video.offsetWidth,
	    hpro = wHeight/vheights,
	    wpro = wWidth/vwidths;
	    let canCut = document.createElement('canvas'),
		cut = canCut.getContext('2d'),
		imgData;
		canCut.height = wHeight*4;
	    canCut.width = wWidth*4;
	    canCut.style.zoom = 0.25;
	    cut.scale(4,4);
	    cut.drawImage(video,0, 0, wWidth, wHeight);  //第一次获取视频流生成图片
		var faData = canCut.toDataURL('image/png', 0.7); //base格式图片数据    第二个参数保存图片质量
	    $("#photo").attr('src',faData);
	    let imgFlag = true;
	    $("#photo").on('load',() => {
	    	if(imgFlag){
	    		imgFlag = false;
	    		cut.clearRect(0,0,canCut.width,canCut.height);
	    		cut.drawImage($("#photo").get(0),0,0,$("#photo").width()*4*wpro,$("#photo").height()*4*hpro,0, 0, wWidth, wHeight);  //抓取视频流图片
	    		if(!$("#picBox").is(":hidden")){
	    			cut.drawImage($("#picBox .show").get(0),0, 0, wWidth, wHeight);  //序列帧
	    		}
	    		cut.drawImage($("#model").get(0),0, 0, wWidth, wHeight);  //模型
	    		
				imgData = canCut.toDataURL('image/png', 1); //base格式图片数据
	        	$("#photo").attr('src',imgData);
	    	}else{
	    		$("#spinner").attr('class','hide');
	    		$("#imgBox").css('z-index','999');
	    		$("#photoBtns").attr('class','show');
	    	}
	    })
	    
	    $("#closeImg").on(touch, () => {
	    	if(!$("#picBox").is(":hidden") && asset.needPicFrame){
				playImg = true;
			}
	    	if(prevIndex != 4){
				actions[prevIndex].setEffectiveTimeScale(1)
			}
			if(actions[prevIndex]._clip.name != 'stage'){
				touchFlag = true;
			}
        	cut.clearRect(0,0,canCut.width,canCut.height);
        	$("#imgBox").attr('class','hide');
        	$("#imgBox").css('z-index','-99');
        	$("#photo").attr('src','');
        	$("#help").attr("class","");
	    	if (!browser.versions.ios) {//ios系统
				$("#cutBtn").attr('class','');
			}
			isCamera = false;
		})
	})	
})