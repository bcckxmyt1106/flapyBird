
var bird = {
    birdTop: 235,
    birdPosition: 0,
    fontColor: 'bule',
    skyPosition: 0,
    skyStep: 2,
    flag: false,
    birdStepY: 0,
    minTop: 0,
    maxTop: 570,//小鸟的最大top值，减去自身的高度
    pipeNum: 7,//柱子数量
    pipeLastIndex: 6,//最后一根柱子的索引
    pipeArr: [],
    score: 0,
    pipeX: 0,
    store: [],//缓存
    // num:4,
    init: function () {
        this.initData()
        this.anime()
        this.handle()
        if (sessionStorage.getItem('play')) {
            this.start()
        }
        if (getLocal('store')) {
            this.getStore()
        }
    },
    anime: function () {
        var self = this
        var count = 0
        var num = 0
        self.timer = setInterval(() => {
            this.skeyMove()
            if (self.flag) {
                self.birdDrop()
                self.pipeMove()
            }
            if (++count % 10 === 0) {
                if (!self.flag) {
                    self.birdJump()
                    self.startScale()
                }
                self.birdFly(num)
                num++
                if (num === 4) {
                    num = 0
                }
            }
        }, 30);
    },
    initData: function () {
        this.el = document.getElementById('game')
        this.oBird = this.el.getElementsByClassName('bird')[0]
        this.oStart = this.el.getElementsByClassName('start')[0]
        this.oScore = this.el.getElementsByClassName('score')[0]
        this.oMask = this.el.getElementsByClassName('mask')[0]
        this.oEnd = this.el.getElementsByClassName('end')[0]
        this.finalScore = this.el.getElementsByClassName('final-score')[0]
        this.oRestart = this.el.getElementsByClassName('restart')[0]
        this.oRankList = this.el.getElementsByClassName('rank-list')[0]
    },
    // 小鸟蹦
    birdJump: function () {
        this.birdTop = this.birdTop === 220 ? 260 : 220
        this.oBird.style.top = this.birdTop + 'px'
    },
    // 小鸟飞
    birdFly: function (num) {
        this.birdPosition = num % 4 * -30
        this.oBird.style.backgroundPositionX = this.birdPosition + 'px'
        // console.log(this.oBird.style.backgroundPositionX)
    },
    // 开始文字放大缩小
    startScale: function () {
        // console.log(Array.from(this.oStart.classList).includes('start-blue'))
        // if(Array.from(this.oStart.classList).includes('start-blue')){
        //     this.oStart.classList.remove('start-blue')
        //     this.oStart.classList.add('start-white')
        // }else if(Array.from(this.oStart.classList).includes('start-white')){
        //     this.oStart.classList.remove('start-white')
        //     this.oStart.classList.add('start-blue')
        // }
        var nowColor = this.fontColor
        this.fontColor = nowColor === 'blue' ? 'white' : 'blue'
        this.oStart.classList.remove('start-' + nowColor)
        this.oStart.classList.add('start-' + this.fontColor)

    },
    // 背景移动
    skeyMove: function () {
        this.skyPosition -= this.skyStep
        this.el.style.backgroundPositionX = this.skyPosition + 'px'
    },
    // 处理函数
    handle: function () {
        this.handleStart()
        this.handleClick()
        this.handleRestart()
    },
    handleStart: function () {
        this.oStart.onclick = this.start.bind(this)
    },
    start: function () {
        var self = this
        self.flag = true
        self.oBird.style.transition = "none"
        self.oBird.style.left = "80px"
        self.oStart.style.display = "none"
        self.oScore.style.display = "block"
        self.skyStep = 5

        /* 点击开始游戏生成柱子 */
        for (let i = 0; i < self.pipeNum; i++) {
            self.createPipe(i)
        }


    },
    // 点击屏幕小鸟向上飞
    handleClick: function () {
        var self = this
        this.el.onclick = (e) => {
            if (!e.target.classList.contains('start')) {//由于事件捕获会触发到start事件
                // self.birdStepY -= 10//本质还是在下落
                self.birdStepY = -10
            }
        }
    },
    // 小鸟下落 不能放在start里面执行的原因是下落是一个过程，this.birdStepY需要不断的加1操作，需要定时器的作用，而放在
    // start里面只能加一次
    birdDrop: function () {
        this.birdTop += ++this.birdStepY//模拟一种重力下落的效果，越来越快
        this.oBird.style.top = this.birdTop + 'px'
        this.judeKnock()
        this.addScore()
    },
    addScore: function () {
        if (this.pipeX < 13) {
            this.score++
        }
        this.oScore.innerText = this.score
    },
    getDate: function () {
        var date = new Date()
        var year = date.getFullYear()
        var month = formatTime(date.getMonth() + 1)
        var day = formatTime(date.getDate())
        var hour = formatTime(date.getHours())
        var minutes = formatTime(date.getMinutes())
        var seconds = formatTime(date.getSeconds())
        return year + ':' + month + ':' + day + ' ' + hour + ':' + minutes + ':' + seconds
    },
    // 柱子移动的频率和天空是一样的，所以和天空移动的变量使用同一个
    pipeMove: function () {
        for (var k = 0; k < this.pipeArr.length; k++) {
            var pipeUp = this.pipeArr[k].pipeUp
            var pipeDown = this.pipeArr[k].pipeDown
            var moveLeft = pipeUp.offsetLeft - this.skyStep
            if (moveLeft <= -52) {
                var pipeLastLeft = this.pipeArr[this.pipeLastIndex].pipeUp.offsetLeft
                pipeUp.style.left = pipeLastLeft + 300 + 'px'
                pipeDown.style.left = pipeLastLeft + 300 + 'px'
                this.pipeLastIndex = ++this.pipeLastIndex % this.pipeNum
                continue;
            }
            pipeUp.style.left = moveLeft + 'px'
            pipeDown.style.left = moveLeft + 'px'
        }
    },
    //碰撞检测
    judeKnock: function () {
        this.judeBounday()
        this.judePipe()
    },
    /*  上下边界碰撞检测*/
    judeBounday: function () {
        if (this.birdTop < this.minTop || this.birdTop > this.maxTop) {
            this.failGame()
        }
    },
    /*  柱子碰撞检测*/
    judePipe: function () {
        // 小鸟和柱子的水平距离，临界值：柱子left 13~95，小鸟在垂直方向的位置是否会碰柱子
        // 垂直距离始终在150px之间（临界值小鸟的高度=上柱子的高度~小鸟的高度等于上柱子的高度+150px
        let index = this.score % this.pipeNum
        let upHeight = this.pipeArr[index].y
        let upLeft = this.pipeArr[index].pipeUp.offsetLeft
        this.pipeX = upLeft
        if ((this.pipeX >= 13 && this.pipeX <= 95) && (this.birdTop <= upHeight[0] || this.birdTop >= upHeight[1])) {
            this.failGame()
        }
    },
    /* 
    生成柱子，一对柱子上下对齐，水平距离也是固定一样的，（垂直）中间的间隙一样，生成柱子的高度不一样，上柱子设置背景图片位置bottom
     设置不同样式，行内样式主要改变left和高度
    */
    createPipe: function (i) {
        // (600-150 )/2=225 除去间隔每个柱子的最大高度，最小高度设为50
        var pipeHeight1 = Math.floor(Math.random() * 175) + 50
        var pipeHeight2 = 450 - pipeHeight1
        var pipeLeft = (i + 1) * 300
        var class1 = ['pipe', 'pipe-up']
        var class2 = ['pipe', 'pipe-bottom']
        var styles1 = {
            height: pipeHeight1 + 'px',
            left: pipeLeft + 'px'
        }
        var styles2 = {
            height: pipeHeight2 + 'px',
            left: pipeLeft + 'px'
        }
        var pipeUp = createEl('div', class1, styles1)
        var pipeDown = createEl('div', class2, styles2)
        this.el.appendChild(pipeUp)
        this.el.appendChild(pipeDown)


        this.pipeArr.push(
            {
                pipeUp,
                pipeDown,
                y: [pipeHeight1, pipeHeight1 + 150],
            }
        )
    },
    /* 重新开始游戏 */
    handleRestart: function () {
        this.oRestart.onclick = () => {
            sessionStorage.setItem('play', true)
            window.location.reload()
        }
    },
    setStore: function () {
        this.store.push({
            score: this.score,
            time: this.getDate()
        })
       setLocal('store', this.store)
    },
    getStore: function () {
        this.store = getLocal('store')
    },
    rankList: function () {
        var localStore = getLocal('store')
        var nowStore = localStore.sort(compare('score')).slice(0, 6)
        var template = ""
        nowStore.forEach((item, index) => {
            template += '<li class="rank-item">\n' +
                ' <span span class="rank-degree" >' + (index + 1) + '</span >\n' +
                ' <span span class="rank-score" >' + item.score + '</span >\n' +
                '<span class="rank-time">' + item.time + '</span></li >'
        })
        this.oRankList.innerHTML = template
    },
    /* 游戏失败 */
    failGame: function () {
        clearInterval(this.timer)
        this.oScore.style.display = "none"
        this.oMask.style.display = "block"
        this.oEnd.style.display = "block"
        this.finalScore.innerText = this.score
        this.setStore()
        this.rankList()
    }
}