var hasTouch = ('ontouchstart' in window);
var TOUCH_START = hasTouch ? "touchstart" : "mousedown";
var TOUCH_MOVE = hasTouch ? "touchmove" : "mousemove";
var TOUCH_END = hasTouch ? "touchend" : "mouseup";

var TILE_SIZE = 256;
var SPRITES_WORLD_SIZE = 2000;
var BACKGROUND_SPRITES_COUNT = 9;
var ENEMY_SPRITES_COUNT = 12;
var MIN_STYLE_SIZE = 750;

var renders = 0;

var monsterRoar;
var bgLoop;

var world = {
    $el:undefined,
    el:undefined,
    tiles:[],
    tileSize:TILE_SIZE
}

var backgroundSprites  = {
    $el:undefined,
    el:undefined,
    sprites:[]
}

var enemySprites  = {
    $el:undefined,
    el:undefined,
    sprites:[]
}

var hero = {
    heightTarget:0.15,
    $el:undefined,
    el:undefined,
    walk:0,
    w:72,
    h:96,
    x:0,
    y:0,
    scale:1,
    direction:0
};

var compass = {
    $el:undefined,
    el:undefined,
    w:100,
    h:100,
    visible: false
}

var touch = {
    $el:undefined,
    el:undefined,
    w:100,
    h:100
}

var touchSegment0 = {
    $el:undefined,
    el:undefined,
    w:100,
    h:100
}

var touchSegment1 = {
    $el:undefined,
    el:undefined,
    w:100,
    h:100
}

var input = {
    angle:0,
    distance:0,
    start:{x:0,y:0},
    current:{x:0,y:0}
}


var translate = {
    x:0,y:0
};

var $win;


window.onerror = function(error) {
//    alert(error.toString());
    console.log(error);
};


function generateWorld(){

    world.$el.empty();
    world.tiles = [];
    backgroundSprites.$el.empty();
    backgroundSprites.tiles = [];
    enemySprites.$el.empty();
    enemySprites.tiles = [];

    world.cols = Math.ceil($(window).width()/TILE_SIZE)+1;
    world.rows = Math.ceil($(window).height()/TILE_SIZE)+1;

    for (var x=0; x<world.cols; x++) {

        world.tiles[x] = [];

        for (var y=0; y<world.rows; y++) {
            world.tiles[x][y] = new Tile(x, y, "#background", getTile(), world);
        }

    }

    for (var x=0; x<BACKGROUND_SPRITES_COUNT; x++) {

        backgroundSprites.sprites.push( getBackgroundSprite(backgroundSprites.el) );

    }

    for (var x=0; x<ENEMY_SPRITES_COUNT; x++) {

        var sprite = getEnemySprite(enemySprites.el);
        enemySprites.sprites.push( sprite );
        sprite.direction = Math.random() * 2* Math.PI;


        var tapHandler =  function(event){
            //console.log ("tap")
            monsterRoar.play();
            event.preventDefault();
            event.stopPropagation();
            return false;
        };

        if ('ontouchstart' in window) {
            sprite.$el.tap( tapHandler );
        }
        else {
            sprite.$el.on( "mousedown", tapHandler );
        }

    }
}

function getBackgroundSprite(target){
    var x=Math.random() * SPRITES_WORLD_SIZE;
    var y=Math.random() * SPRITES_WORLD_SIZE;

    var style;
    var i = Math.floor(Math.random() * 5);
    switch (i) {
        case 1: style="tree"; break;
        case 2: style="bush1"; break;
        case 3: style="bush2"; break;
        case 4: style="bush3"; break;
        default: style="log"; break;
    }

    return new Sprite(backgroundSprites.$el, x, y, style);
}

function getEnemySprite(target){
    var x=Math.random() * SPRITES_WORLD_SIZE;
    var y=Math.random() * SPRITES_WORLD_SIZE;

    var style;
    var i = Math.floor(Math.random() * 4);
    switch (i) {
        case 1: style="dragon1"; break;
        case 2: style="dragon2"; break;
        case 3: style="dragon3"; break;
        default: style="dragon4"; break;
    }

    return new Sprite(enemySprites.$el, x, y, style);
}

function getTile(x,y) {
    var rand = Math.floor(Math.random()*10);
    switch (rand) {
        case 0: return "tile_0"; break;
        case 1: return "tile_1"; break;
        case 2: return "tile_2"; break;
        case 3: return "tile_3"; break;
        default: return "tile_4"; break;
    }
}

function render(){
    //console.log("render")



    translate.x += Math.sin( input.angle ) * Math.floor(input.distance);
    translate.y += Math.cos( input.angle ) * Math.floor(input.distance);

    translate.x = Math.floor(translate.x);
    translate.y = Math.floor(translate.y);

    //console.log(translate.x, translate.y)

    for (var x=0; x<world.tiles.length; x++) {

        for (var y=0; y<world.tiles[x].length; y++) {
            world.tiles[x][y].updatePosition( translate.x, translate.y );
        }

    }



    for (var x=0; x<backgroundSprites.sprites.length; x++) {
        backgroundSprites.sprites[x].updatePosition( translate.x, translate.y );
    }

    for (var x=0; x<enemySprites.sprites.length; x++) {

        var sprite = enemySprites.sprites[x];

        var rand = Math.floor( Math.random() * 10 );
        if ( renders % (30+rand) == 0) {
            sprite.direction += (Math.random() * 2 > 1 ? 1 : -1 ) * Math.random() * Math.PI/3;
        }

        sprite.x += Math.sin(sprite.direction) * 2;
        sprite.y += Math.cos(sprite.direction) * 2;

        if ( sprite.scale > 1.15 || sprite.scale < .85){
            sprite.scaleModifier *= -1;
        }

        sprite.scale += sprite.scaleModifier;

        sprite.updatePosition( translate.x, translate.y );
    }

    if (input.distance > 0) {

        var MAX_WALK_FRAMES = 12;
        var max_dst = $win.width()/2;
        var dst = Math.min (input.distance, $win.width());


        var w = (dst / max_dst)*10;
        w = Math.round(MAX_WALK_FRAMES * (1-w));
        w = Math.max(1,w);
        //console.log(w)

        if ( renders % w == 0) {
            hero.walk++;
            hero.walk = (hero.walk%8)
        }
    }

    hero.x = ($win.width() - hero.w)/2;
    hero.y = ($win.height() - hero.h)/2;
    hero.el.style["-webkit-transform"]="translate3d("+ hero.x +'px,'+ hero.y +"px,0px) ";// scale("+hero.scale+")";
    hero.$el.removeClass().addClass("hero_" + (7-hero.walk) +"_"+hero.direction);


    if ( compass.visible ){
        //console.log( (input.start.x-(compass.w/2)), (input.start.y-(compass.h/2)))
        var style = "translate3d("+ (input.start.x-(compass.w/2)) +'px,'+ (input.start.y-(compass.h/2)) +"px,0px)";
        //console.log(style);
        compass.el.style["-webkit-transform"]= style;

        style = "translate3d("+ (input.current.x-(touch.w/2)) +'px,'+ (input.current.y-(touch.h/2)) +"px,0px)";
        touch.el.style["-webkit-transform"]= style;

        var segmentX = (input.current.x + Math.sin(input.angle)*(input.distance*10/3) )-(touch.w/2);
        var segmentY = (input.current.y + Math.cos(input.angle)*(input.distance*10/3) )-(touch.h/2);
        style = "translate3d("+ segmentX +'px,'+ segmentY +"px,0px)";
        touchSegment0.el.style["-webkit-transform"]= style;

         segmentX = (input.current.x + Math.sin(input.angle)*(input.distance*20/3) )-(touch.w/2);
         segmentY = (input.current.y + Math.cos(input.angle)*(input.distance*20/3) )-(touch.h/2);
         style = "translate3d("+ segmentX +'px,'+ segmentY +"px,0px)";
         touchSegment1.el.style["-webkit-transform"]= style;
    }
    else {
        //just render them offscreen
        compass.el.style["-webkit-transform"]="translate3d(-200px,-200px,0px)";
        touch.el.style["-webkit-transform"]="translate3d(-200px,-200px,0px)";
        touchSegment0.el.style["-webkit-transform"]="translate3d(-200px,-200px,0px)";
        touchSegment1.el.style["-webkit-transform"]="translate3d(-200px,-200px,0px)";
    }


    renders++;

    window.requestAnimationFrame(function() {
        render()
    } );
}

function resetHero() {
    hero.walk = 0;
    hero.direction = 0;
}

function Tile(col, row, target, css, model) {
    this.model = model;
    this.col = col;
    this.row = row;
    this.css = css;
    this.$el = $("<div></div>", {class: "tile " + css});
    this.el = this.$el.get(0);

    $(target).append( this.$el );
}

Tile.prototype.updatePosition = function ( _x, _y ) {

    var size = this.model.tileSize;
    var x = ((this.col) * size + _x);
    var y = ((this.row) * size + _y);

    var world_cols_size = (this.model.cols)*size;
    var world_rows_size = (this.model.rows)*size;

    x = (x.mod(world_cols_size))-size;
    y = (y.mod(world_rows_size))-size;

    if (this.lastX != x || this.lastY != y) {
        this.el.style["-webkit-transform"]="translate3d("+ x +'px,'+ y +"px,0px)";
        this.lastX = x;
        this.lastY = y;
    }

}



function Sprite(target, x, y, css) {
    this.target = target;
    this.x = x;
    this.y = y;
    this.css = css;
    this.$el = $("<div></div>", {class: "sprite " + css});
    this.el = this.$el.get(0);
    this.scale = 1;
    this.scaleModifier = .01;

    $(target).append( this.$el );
}

Sprite.prototype.updatePosition = function ( _x, _y ) {

    var size = SPRITES_WORLD_SIZE;
    var x = this.x + _x;
    var y = this.y + _y;

    x = (x.mod(size)) - 500;
    y = (y.mod(size)) - 500;

    if (this.lastX != x || this.lastY != y || this.scale != this.lastScale) {
        this.el.style["-webkit-transform"]="translate3d("+ x +'px,'+ y +"px,0px) " + (this.scale != 1 ? "scale("+this.scale+")" : "");
        this.lastX = x;
        this.lastY = y;
        this.lastScale = this.scale;
    }
}


function onTouchStart( event ) {

    event.preventDefault();
    event.stopPropagation();
    if (event.touches != undefined) {
        event = event.touches[0];
    }

    input.start = {
        x: event.pageX,
        y: event.pageY
    }
    input.current = {
        x: event.pageX,
        y: event.pageY
    }
    calculateInputTransform();
    compass.visible = true;

    document.removeEventListener( TOUCH_START, onTouchStart );
    document.addEventListener( TOUCH_MOVE, onTouchMove );
    document.addEventListener( TOUCH_END, onTouchEnd );

    return false;
}

function onTouchMove( event ) {

    event.preventDefault();
    event.stopPropagation();
    if (event.touches != undefined) {
        event = event.touches[0];
    }

    input.current = {
        x: event.pageX,
        y: event.pageY
    }
    calculateInputTransform();

    return false;
}

function onTouchEnd( event ) {

    event.preventDefault();
    event.stopPropagation();
    if (event.touches != undefined) {
        event = event.touches[0];
    }

    input.start = {
        x: 0,
        y: 0
    }
    input.current = {
        x: 0,
        y: 0
    }
    calculateInputTransform();
    resetHero();
    compass.visible = false;

    document.addEventListener( TOUCH_START, onTouchStart );
    document.removeEventListener( TOUCH_MOVE, onTouchMove );
    document.removeEventListener( TOUCH_END, onTouchEnd );

    return false;
}

function calculateInputTransform() {

    input.angle = angle(input.start, input.current);
    input.distance = distance(input.start, input.current)/10;

    var pi_4 = Math.PI/4;
    var pi2 = Math.PI * 2;

    var a = input.angle % pi2;

    while ( a < 0 ) {
        a += pi2;
    }

    if ( a > pi_4 && a <= 3*pi_4 ) {
        hero.direction = 2;
    }
    else if ( a > 3*pi_4 && a <= 5*pi_4 ) {
        hero.direction = 0;
    }
    else if ( a > 5*pi_4 && a <= 7*pi_4 ) {
        hero.direction = 1;
    }
    else {
        hero.direction = 3;
    }

}

function distance( a, b ) {

    var _x = Math.pow(b.x - a.x, 2);
    var _y = Math.pow(b.y - a.y, 2);

    var result = Math.sqrt( _x + _y );
    return result;
}

function angle( a, b ) {

    var _x = -(b.x - a.x);
    var _y = -(b.y - a.y);

    var result = Math.atan2( _x, _y );
    return result;
}


Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}


//detect if web or phonegap ( via http://stackoverflow.com/questions/8068052/phonegap-detect-if-running-on-desktop-browser)
function isPhoneGap() {
    return ((cordova || PhoneGap || phonegap)
        && /^file:\/{3}[^\/]/i.test(window.location.href)
        && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)) ||
        window.tinyHippos; //this is to cover phonegap emulator
}

function initAudio() {
    if ( isPhoneGap() ) {
        if (device.platform == "Android") {
            monsterRoar = new Media("/android_asset/www/assets/sounds/167890__erdie__monster.wav");
            //bgLoop = new Media( "/android_asset/www/assets/sounds/115261__rap2h__1mi.wav", onSoundSuccess, onSoundError, onSoundStatus);
        } else {
            monsterRoar = new Media("assets/sounds/167890__erdie__monster.wav");
            //bgLoop = new Media( "assets/sounds/115261__rap2h__1mi.wav", onSoundSuccess, onSoundError, onSoundStatus);
        }
    }
    else {
        monsterRoar = $('<audio src="assets/sounds/167890__erdie__monster.wav" preload="true"></a>').get(0);
    }
}

function init(event) {

    initAudio();

    $win = $(window);


    world.$el = $("#background");
    world.el = world.$el.get(0);

    backgroundSprites.$el = $("#backgroundSprites");
    backgroundSprites.el = backgroundSprites.$el.get(0);

    enemySprites.$el = $("#enemySprites");
    enemySprites.el = enemySprites.$el.get(0);

    generateWorld();

    hero.scale = ($win.height() * hero.heightTarget)/hero.h;
    hero.$el = $("#hero");
    hero.el = hero.$el.get(0);

    compass.$el = $("#compass");
    compass.el = compass.$el.get(0);
    touch.$el = $("#touch");
    touch.el = touch.$el.get(0);
    touchSegment0.$el = $("#touchSegment0");
    touchSegment0.el = touchSegment0.$el.get(0);
    touchSegment1.$el = $("#touchSegment1");
    touchSegment1.el = touchSegment1.$el.get(0);

    if ($win.width() > MIN_STYLE_SIZE || $win.height() > MIN_STYLE_SIZE) {
        $(".overlayContainer").addClass("large");
    }

    document.addEventListener( TOUCH_START, onTouchStart );

    render();
    $("body").css("display", "block");
};

window.addEventListener( "resize", function() {
    generateWorld();
});



if ( isPhoneGap() ) {
    document.addEventListener( "deviceready", init );
}
else {
    window.addEventListener( "load", init );
}

