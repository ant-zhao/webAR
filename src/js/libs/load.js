var showSplash = function () {
    // splash wrapper
    var wrapper = document.createElement('div');
    wrapper.id = 'layer';
    document.body.appendChild(wrapper);

    // logo
    /*var logo = document.createElement('div');
    logo.id = 'logo';
    wrapper.appendChild(logo);*/

    // splash
    var splash = document.createElement('div');
    splash.setAttribute("class", "load-box");
    wrapper.appendChild(splash);

    // ball1
    var rond = document.createElement('div');
    rond.setAttribute("class", "load-one");
    splash.appendChild(rond);


    //ball2
    var ball = document.createElement('div');
    ball.setAttribute("class", "load-two");
    splash.appendChild(ball);

    //apeed
    var apeed = document.createElement('p');
    apeed.id =  "load-apeed";
    apeed.innerHTML = "0%";
    splash.appendChild(apeed);


};

var hideSplash = function () {
    var splash = document.getElementById('layer');
    splash.parentElement.removeChild(splash);
};

var setProgress = function (value) {
    var apeed = document.getElementById('load-apeed');
    apeed.innerHTML = parseInt(value * 100) + "%";
};

var createCss = function () {
    var css = [
        '#layer{',
        '	position: absolute;',
        '	top: 0;',
        '	left: 0;',
        '	width: 100%;',
        '	height: 100%;',
        '	z-index: 999',
        '}',
        '#layer .load-box{',
        '	height: 33vw;',
        '	width: 33%;',
        '	position: absolute;',
        '	top: 33%;',
        '	left: 50%;',
        '	transform: translate(-50%);',
        '	transform: translate(-50%);',
        '   -webkit-transform: translate(-50%);',
        '   -moz-transform: translate(-50%);',
        '   -o-transform: translate(-50%);',
        '   -ms-transform: translate(-50%);',
        '}',
        '#layer .load-box .load-one{',
        '	height: 100%;',
        '	width: 100%;',
        '	position: absolute;',
        '	top: 0;',
        '	left: 0;',
        '	background: url(./resource/loadOut.png) no-repeat top left;',
        '	background-size: 100% 100%;',
        '	animation:rerond 3s linear infinite;',
        '    -webkit-animation:rerond 3s linear infinite;',
        '}',
        '#layer .load-box .load-two{',
        '	height: 80%;',
        '	width: 80%;',
        '	position: absolute;',
        '	top: 0;',
        '	left: 0;',
        '	right: 0;',
        '	bottom: 0;',
        '	margin: auto;',
        '	background: url(./resource/loadIng.png) no-repeat top right;',
        '	background-size: 100% 100%;',
        '	animation:rond 3s infinite;',
        '	-webkit-animation:rond 3s infinite;',
        '}',
        '#load-apeed{',
        '	width: 100%;',
        '	height: 0.5rem;',
        '	position: absolute;',
        '	top: 0;',
        '	left: 0;',
        '	right: 0;',
        '	bottom: 0;',
        '	margin: auto;',
        '   color: #009EFF;',
        '   font: 900  0.3rem/0.5rem "PingFangSC-Regular";',
        '	text-align: center;',
        '}',
        '#layer #logo{',
        '	position: absolute;',
        '	top: 0.32rem;',
        '	right: 0.34rem;',
        '	width: 3rem;',
        '	height: 1rem;',
        '	background: url(./resource/logo.png) no-repeat center;',
        '	background-size: 100%;',
        '}',
        '@keyframes rond',
        '{',
        '    0% {transform:rotate(0deg);}',
        '    100% {transform:rotate(360deg);}',
        '}',
        '@-webkit-keyframes rond',
        '{',
        '    0% {-webkit-transform:rotate(0deg);}',
        '    100% {-webkit-transform:rotate(360deg);}',
        '}',
        '@keyframes rerond',
        '{',
        '    0% {transform:rotate(0deg);}',
        '    100% {transform:rotate(-360deg);}',
        '}',
        '@-webkit-keyframes rerond',
        '{',
        '    0% {-webkit-transform:rotate(0deg);}',
        '    100% {-webkit-transform:rotate(-360deg);}',
        '}'
    ].join('\n');

    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
};

export default {
    "showSplash":showSplash,
    "hideSplash":hideSplash,
    "createLoadStyle":createCss,
    "setProgress":setProgress
}
