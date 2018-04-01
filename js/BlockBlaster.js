var fps = 40;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");          
var bgColor = "black"
var ready;
var enemyScore;
var renderTimer = setInterval(render,1 / fps * 100);
var difficultyTimer;
var spawnTimer;
var spawntime;
var gameTime;
var difficulty;
var score;
var highScore = 0;
var gameOver;
var entities = [];
var player;
var fader;
var image = new Image ();
    image.src = 'test_image.jpg'; 
/*****************************************************function**********************************************************/
function reset()
{
        if (score > highScore) highScore = score;
        ready = true;
        enemyScore = 0;
        gameTime = 0;
        difficulty = 1;
        score = 0;
        spawntime = 1500;
        gameOver = false;
        fader = 0;
        entities = [];
        player = null;
        clearTimers()
}
//清除所有的定时器
function clearTimers()
{
    clearInterval(difficultyTimer);
    clearInterval(spawnTimer);
}
//初始化所有定时器 
function initializeTimers()
{
    difficultyTimer = setInterval(increaseDifficulty, 2000); //每2s更新一次难度
    spawnTimer = setInterval(spawnEnemy,spawntime); //每隔1.5s产生一个方块
}
//初始化玩家信息/开始游戏 
function init()
{
        ready = false;
        clearTimers();
        initializeTimers();
        //Spawn player
        player = new Player();
        player.position.set(canvas.width / 2, canvas.height - player.size);
        player.render();
        entities.push(player);
}
//遍历更新方块信息,移除超出下边界方块
function updateEntities()
{
    entities.forEach(function(e){
        if (e.position.y > canvas.height + 20)
        {
            if (e.name == "Enemy")  //如果超出canvas边界的方块为敌对方块，逃逸敌对方块数量+1
            {
                enemyScore ++;
            }
            removeEntity(e);
        }
        e.update(1 / fps);
    })
}
//绘制游戏界面背景颜色
function drawBG()
{
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
//绘制4个成绩显示器 
function drawScore()
{
    ctx.fillStyle = "yellow";
    ctx.font = "30px consoal";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.font = "20px consoal";
    ctx.fillText("HighScore: " + highScore, 10, 50);
    var enemyScoreString = "";
    for (var i = 0; i < enemyScore; i++)
    {
        enemyScoreString += "x";
    }
        ctx.font = "20px consoal";
        ctx.fillStyle = "white";
        ctx.fillText("Miss: " + enemyScoreString, canvas.width - 125, 24);
        ctx.font = "20px consoal";
        ctx.fillText("Difficuity: " + difficulty,canvas.width / 2 - 50, 24);
    }
//绘制透明度为0~alpha范围的静态马赛克方块
function drawStatic(alpha)
{
    var s = 30 ;
    for (var x = 0; x < canvas.width; x+=s)
    {
        for (var y = 0; y < canvas.width; y+=s)
        {
            var n = Math.floor(Math.random() * 60);
            ctx.fillStyle = "rgba(" + n + "," + n + "," + n + "," + (Math.random() * alpha) + ")";
            ctx.fillRect(x, y, s, s);
        }
    }
}
//“Ready？”屏幕 
function drawReadyScreen()
{
    drawBG();
    drawScore();
    fader += 0.1 * 1 / fps;
    ctx.fillStyle = "yellow";
    ctx.font = "72px consoal";
    ctx.fillText("Ready?", canvas.width / 2 - 110, canvas.height / 2 + 10);
    drawScore();
}
//每一个方块的绘制
function drawEntities()
{
    entities.forEach(function(e){
        e.render();
    });
}   
//游戏结束界面
function drawGameOver()
{
    ctx.fillStyle = "rgba(0, 0, 100, "+ fader +")";     //设置后景色
    ctx.fillRect(0, 0, canvas.width, canvas.height);    //绘制后景色
    drawStatic(fader / 2);  //绘制马赛克
    drawScore();
    fader += 0.1 * 1 / fps
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.font = "72px consoal";
    ctx.fillText("Game Over!",canvas.width/2 - 160,canvas.height / 2 + 10);
}   
//Render 事件
function render()
{
    drawBG();
    drawEntities();
    drawScore();
    if (gameOver)   //若游戏结束
    {
        drawGameOver(); 
        return;
    }
    else if(ready)  //若游戏在准备阶段
    {
        drawReadyScreen(); 
        return;
    }
    updateEntities();
    gameTime = gameTime + 1 / fps;
    if (enemyScore >= 3) 
    {
        clearTimers();
        gameOver = true;
        fader = 0;
    }
}
//返回相对于画布的鼠标位置
function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return new Vector2(evt.clientX - rect.left, evt.clientY - rect.top)
}           
//界面鼠标点击事件函数
function canvasClick()
{
    if (gameOver)
    { 
        if (fader > 0.5)
        {
            reset();
        }
        return;
    }
    if (ready)
    {
        init(); 
        return;
    }
    var bullet = new Bullet();
    bullet.position.set(player.position.x + player.size / 2 - bullet.size / 2, 
                        player.position.y - player.size / 2 - bullet.size / 2); //子弹起始位置
    bullet.velocity.y = -40;    //子弹速度
    entities.push(bullet);      //将子弹加入方块数组
    if (score > 0) 
    {
        score --;
    }
}   
//增加难度,难度每增加n,每秒产生敌对方块速率变为: 1个/(1.5 - 0.02 * n)s
function increaseDifficulty()
{
    difficulty++;
    if (spawntime > 20) 
    {
        spawntime = spawntime - 20;
    }
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnEnemy,spawntime);
}   
//改变方块颜色
function setAlpha(color, alpha)
{
    if (color.indexOf('a') == -1)   //若没有找到字符'a'
    {
        return color.replace(")", "," + alpha + ")").replace("rgb", "rgba");
    }
}   
//敌对方块的消灭时的方块粒子动画效果
function death(entity)
{
    if (entity.name == "Enemy") 
    {
        var particleCount = Math.floor((Math.random() * 6) + 10);    //产生10~16范围的随机数
        for (var i = 0; i < particleCount; i++) 
        {
            var p = new Particle();
            p.color = entity.color; //方块粒子颜色与其母方块颜色相同
            p.size = Math.floor((Math.random() * entity.size / 2) + 5); //产生随机尺寸的方块粒子
            //每个方块粒子的位置由其size和母方块位置决定
            p.position.set(entity.position.x + entity.size / 2, entity.position.y + entity.size / 2);   
            entities.push(p);
        }
        score = score + 25; //游戏得分增加25分
    }
    removeEntity(entity);
} 
//消除方块
function removeEntity(entity)
{
    var idx = entities.indexOf(entity);
    if (idx > -1)
    {
        entities.splice(idx, 1);
    }
}  
//检查两个方块是否重叠
function overlaps(entityA, entityB)
{
    var sa = entityA.size;
    var x1a = entityA.position.x;
    var x2a = entityA.position.x + sa;
    var y1a = entityA.position.y;
    var y2a = entityA.position.y + sa;
    var sb = entityB.size;
    var x1b = entityB.position.x;
    var x2b = entityB.position.x + sb;
    var y1b = entityB.position.y;
    var y2b = entityB.position.y + sb;
    return (x1a < x2b && x2a > x1b && y1a < y2b && y2a > y1b);
}   
//产生以随机轨迹运动的新的方块
function spawnEnemy()
{
    var e = new Enemy();
    var px = Math.floor((Math.random() * canvas.width));    //产生初始x坐标为0~canvas.width范围的随机数
    var py = -e.size;
    var v = difficulty; //将当前难度作为方块运动的速度
    var a = Math.floor((Math.random() * (v + 15)) + v); //随机产生v~2v+15范围的随机数作为振动幅度
    var f = Math.floor((Math.random() * (v + 15)) + v); //随机产生v~2v+15范围的随机数作为频率
    e.position.set(px, py);
    var r = Math.random();
    if (r > 0.5)
    {
        straightDownMotion(e, v);
    }
    else if (r > 0.3)
    {
        sineMotion(e, a, f, v);
    }
    else if (r > 0.1)
    {
        triangularMotion(e, a, f,v );
    }
    else
    {
        sawtoothMotion(e, a, f,v );
    }
    entities.push(e);
}   
//直线向下运动 
function straightDownMotion(entity, speed)
{
    entity.update = function(deltatime)
    {
        this.velocity.x = 0;
        this.velocity.y = speed;
        Entity.prototype.update.call(this, deltatime);
    }
}   
//定义正弦波运动
function sineMotion(entity, amplitude, freq, speed)
{
    entity.update = function(deltatime)
    {
            this.velocity.x = amplitude * Math.cos(this.position.y / freq);
            this.velocity.y = speed;
            Entity.prototype.update.call(this,deltatime);
    }
}
//定义锯波运动
function sawtoothMotion(entity, amplitude, freq, speed)
{
    var modifier = 1;
    if (Math.random() > .5) 
    {
        modifier = -1;
    }
    entity.update = function(deltatime)
    {
        this.velocity.x = modifier * ((-2*amplitude) / Math.PI) * Math.atan(1/Math.tan(this.position.y / freq));
        this.velocity.y = speed;
        Entity.prototype.update.call(this, deltatime);
    }
}
//定义三角运动
function triangularMotion(entity, amplitude, freq, speed)
{
    entity.update = function(deltatime)
    {
        this.velocity.x = ((2 * amplitude) / Math.PI) * Math.asin(Math.sin(this.position.y / freq));
        this.velocity.y = speed;
        Entity.prototype.update.call(this,deltatime);
    }
}   
//定义颜色
function randomColor(min,max)
{
    var r = Math.floor((Math.random() * max) + min);
    var g = Math.floor((Math.random() * max) + min);
    var b = Math.floor((Math.random() * max) + min);
    var col = "rgb(" + r + "," + g + "," + b + ")";
    return col;
}   
//定义向量类型
var Vector2 = function(x1, y1)
{
    this.x = x1;
    this.y = y1;
}
//设置向量属性
Vector2.prototype.set = function(a, b)
{
    this.x = a;
    this.y = b;
}   
//定义方块类型
var Entity = function()
{
    this.name = "Entity";
    this.size = 25;
    this.position = new Vector2(0,0);
    this.velocity = new Vector2(0,0);
    this.color = "#FFFFFF";
}
Entity.prototype.sayName = function()
{
    console.log(this.name);
}

Entity.prototype.update = function(deltaTime)
{
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    //保持界限
    if (this.position.x - this.size < 0) 
    {
        this.position.x = this.size;
    }
    if (this.position.x + this.size > canvas.width) 
    {
        this.position.x = canvas.width - this.size;
    }
}

Entity.prototype.render = function()
{
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x,this.position.y,this.size,this.size);
}   
//定义敌对方块
var Enemy = function()
{
    Entity.call(this);
    this.name = "Enemy";
    this.size = Math.floor((Math.random() * 50) + 20);  //敌对方块的尺寸大小为20~70范围的随即数
    this.color = randomColor(40,160);
}
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Entity;
//定义玩家方块
var Player = function()
{
    Entity.call(this);
    this.name = "Player";
    this.color = "#4747FF"
}
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Entity;
//定义粒子方块
var Particle = function()
{
    Entity.call(this);
    this.name = "Particle";
    this.size = 10;
    this.time = 0;
    this.maxTime = Math.floor((Math.random() * 10) + 3);        //3~13
    this.velocity.x = Math.floor((Math.random() * 20) - 10);    //-10~10
    this.velocity.y = Math.floor((Math.random() * 20) - 10);    //-10~10
}
Particle.prototype = Object.create(Entity.prototype);
Particle.prototype.constructor = Entity;
Particle.prototype.update = function(deltatime)
{
        Entity.prototype.update.call(this,deltatime);
        this.time += deltatime;
        if (this.time >= this.maxTime) removeEntity(this);
}
//定义子弹方块
var Bullet = function()
{
    Entity.call(this);
    this.name = "Bullet";
    this.size = 10;
    this.time = 0;
    this.color = "white";
    this.particlesDelay = 0.5;  //子弹方块分解动画效果重复时间间隔
}
Bullet.prototype = Object.create(Entity.prototype);
Bullet.prototype.constructor = Entity;
Bullet.prototype.update = function(deltatime)
{
    Entity.prototype.update.call(this,deltatime);   
    //检查碰撞
    var me = this;
    entities.forEach(function(e){
        if (e !== me && e.name != "Particle")
        {
            if (overlaps(me, e))    //若重叠
            {
                death(e);
                removeEntity(me);
            }
        }
    })
    //从游戏中删除如果外部界限
    if (this.position.y < 0) 
    {
        removeEntity(this); 
    }
    //创建粒子
    this.time = this.time + deltatime;
    if (this.time >= this.particlesDelay)
    {
        this.time = 0;
        var p = new Particle();
        p.size = Math.floor((Math.random() * 5)+2);
        //p.color = setAlpha("rgb(125,125,125)",Math.random()); //白色颗粒
        p.color = setAlpha(randomColor(100,255),Math.random()); //彩色颗粒
        p.velocity.x = p.velocity.x / 2;
        p.position.x = this.position.x + this.size / 2 - p.size / 2;
        p.position.y = this.position.y - p.size/2;
        entities.push(p);
    }
}
//HTML加载事件
document.addEventListener('DOMContentLoaded', reset());
canvas.addEventListener("click",canvasClick);
//鼠标移动事件
canvas.addEventListener('mousemove', function(evt){
        var mousePos = getMousePos(canvas, evt);
        if (player && !gameOver) player.position.x = mousePos.x;
}, false);