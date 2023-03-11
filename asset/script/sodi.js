"use strict";
class Cluster {
    constructor(x, y, vx, vy) {
        this.speed = [];
        this.position = [];
        this.position = [x, y];
        this.speed = [vx, vy];
    }
    update() {
        for (let i = 0; i < 2; i++) {
            this.position[i] += this.speed[i];
        }
    }
    render() {
        mknpad.var.ctx.drawImage(mknpad.image.get('cluster'), this.position[0] - 80, this.position[1] - 80, 160, 160);
    }
    isDead() {
        if (this.position[0] < 0 - 60 || this.position[0] > 480 + 60) {
            return true;
        }
        if (this.position[1] < 0 - 80 || this.position[1] > 480 + 80) {
            return true;
        }
        return false;
    }
    getPos() {
        return this.position;
    }
}
class Money extends Cluster {
    render() {
        mknpad.var.ctx.drawImage(mknpad.image.get('10man'), this.position[0] - 50, this.position[1] - 50, 100, 100);
    }
}
class Shoudoku extends Cluster {
    render() {
        mknpad.var.ctx.drawImage(mknpad.image.get('shoudoku'), this.position[0] - 50, this.position[1] - 50, 100, 100);
    }
}
class User {
    constructor(x, y) {
        this.position = [];
        this.pressedKey = [];
        this.speed = [];
        this.life = 2;
        this.muteki = 0;
        this.sodi = false;
        this.soding = 0;
        this.sodiCount = 1000;
        this.cleanMuteki = false;
        this.position = [x, y];
    }
    press(key) {
        this.pressedKey.push(key);
        this.pressedKey.push(key.toLowerCase());
        this.pressedKey.push(key.toUpperCase());
        this.pressedKey = this.pressedKey.filter((x, i, self) => (self.indexOf(x) === i)); // 重複をはじいて処理を軽くする
    }
    release(key) {
        this.pressedKey = this.pressedKey.filter((x, i, self) => (self.indexOf(x) === i)); // 重複をはじいて処理を軽くする
        let pos = this.pressedKey.indexOf(key);
        if (pos !== -1) {
            this.pressedKey.splice(pos, 1);
        }
        pos = this.pressedKey.indexOf(key.toUpperCase());
        if (pos !== -1) {
            this.pressedKey.splice(pos, 1);
        }
        pos = this.pressedKey.indexOf(key.toLowerCase());
        if (pos !== -1) {
            this.pressedKey.splice(pos, 1);
        }
    }
    solve() {
        this.speed = [0, 0];
        for (let i = 0; i < this.pressedKey.length; i++) {
            switch (this.pressedKey[i]) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.speed[0] !== -1) {
                        this.speed[0]--;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.speed[0] !== 1) {
                        this.speed[0]++;
                    }
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.speed[1] !== -1) {
                        this.speed[1]--;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.speed[1] !== 1) {
                        this.speed[1]++;
                    }
                    break;
                case ' ':
                case 'Enter':
                    if (this.sodiCount === 0) {
                        this.sodi = true;
                        this.soding = 125;
                        this.sodiCount = 1000;
                    }
                    break;
                case 'Escape':
                    this.life = 0;
                    break;
                default:
            }
        }
    }
    update() {
        if (Math.abs(this.speed[0]) + Math.abs(this.speed[1]) === 1) {
            this.speed[0] *= Math.SQRT2;
            this.speed[1] *= Math.SQRT2;
        }
        for (let i = 0; i < 2; i++) {
            this.position[i] += 2 * this.speed[i];
        }
        if (this.position[0] < 0) {
            this.position[0] = 0;
        }
        if (this.position[1] < 0) {
            this.position[1] = 0;
        }
        if (this.position[0] > 480) {
            this.position[0] = 480;
        }
        if (this.position[1] > 480) {
            this.position[1] = 480;
        }
        if (this.sodiCount > 0) {
            this.sodiCount--;
        }
        if (this.muteki > 0) {
            this.muteki--;
        }
        if (this.muteki === 0) {
            this.cleanMuteki = false;
        }
    }
    render() {
        if (this.muteki === 0 || this.muteki % 2 === 0) {
            mknpad.var.ctx.drawImage(mknpad.image.get('pl'), this.position[0] - 30, this.position[1] - 40, 60, 80);
        }
    }
    isDead() {
        return (this.life < 0);
    }
    isSodi() {
        const q = this.sodi;
        this.sodi = false;
        return q;
    }
    getPos() {
        return this.position;
    }
    kill() {
        if (this.muteki === 0) {
            mknpad.sound.play('damage');
            this.life--;
            this.muteki = 125;
        }
    }
    getLife() {
        return this.life;
    }
    getSoding() {
        if (this.soding === 0) {
            return -1;
        }
        return this.soding;
    }
    updateSoding() {
        if (this.soding !== 0) {
            --this.soding;
        }
    }
    getSodiCount() {
        return this.sodiCount;
    }
    getMuteki(t) {
        this.cleanMuteki = true;
        this.muteki = t;
    }
    isMuteki() {
        return this.cleanMuteki;
    }
}
const mknpad = {
    const: {
        version: '63',
        versionString: 'SoDi 0.0.1+',
        game: {
            minDistance: 70,
        }
    },
    dev: {
        canvas: null,
    },
    var: {
        ctx: null,
        clusters: [],
        mans: [],
        shoudokus: [],
        user: null,
        score: 0,
        kusoDone: false,
        timerId: undefined,
    },
    lib: {
        sleep(ms) {
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        },
        drawText(str, x, y, px = 24) {
            mknpad.var.ctx.fillStyle = 'white';
            mknpad.var.ctx.strokeStyle = "black";
            mknpad.var.ctx.lineWidth = 4;
            mknpad.var.ctx.font = `bold ${px}px 'MS Gothic', sans-serif`;
            mknpad.var.ctx.strokeText(str, x, y);
            mknpad.var.ctx.fillText(str, x, y);
        },
        clearScreen() {
            mknpad.var.ctx.clearRect(0, 0, mknpad.dev.canvas.width, mknpad.dev.canvas.height);
        },
        async fadeOut() {
            let i = 0;
            let id = setInterval(() => {
                mknpad.var.ctx.fillStyle = `rgba(0, 0, 0, ${0.01 * i})`;
                mknpad.var.ctx.fillRect(0, 0, 640, 480);
                if (++i > 100) {
                    clearInterval(id);
                }
            }, 15);
            await mknpad.lib.sleep(2000);
            mknpad.lib.clearScreen();
        },
        getDistance(a, b) {
            return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
        },
        waitKey() {
            return new Promise(resolve => {
                function ws(e) {
                    resolve(e.key);
                }
                window.addEventListener('keydown', ws);
            });
        },
        drawRotatedImage(img, x, y, w, h, angle) {
            mknpad.var.ctx.save();
            mknpad.var.ctx.translate(x, y);
            mknpad.var.ctx.rotate(angle);
            mknpad.var.ctx.drawImage(img, -w / 2, -h / 2, w, h);
            mknpad.var.ctx.restore();
        }
    },
    sound: {
        buf: [],
        vol: .75,
        context: null,
        async loadAll() {
            mknpad.var.ctx.fillText('Loading Sounds ...', 0, 80);
            const promissBuffer = [];
            const loadList = [
                { src: './asset/sound/cursor1.mp3', id: 'cur' },
                { src: './asset/sound/decision7.mp3', id: 'dec' },
                { src: './asset/sound/nc149828.m4a', id: 'end' },
                { src: './asset/sound/nc149823.m4a', id: 'win98' },
                { src: './asset/sound/kuso.m4a', id: 'kuso' },
                { src: './asset/sound/koikemitsu.m4a', id: 'mitsu' },
                { src: './asset/sound/sodi.m4a', id: 'sodi' },
                { src: './asset/sound/abe10man.m4a', id: 'man' },
                { src: './asset/sound/dam.mp3', id: 'damage' },
                { src: './asset/sound/sodiok.m4a', id: 'sodiok' },
                { src: './asset/sound/abemask.m4a', id: 'mask' },
            ];
            for (let i = 0; i < loadList.length; i++) {
                promissBuffer.push(mknpad.sound.load(loadList[i].src, loadList[i].id));
            }
            for (let i = 0; i < promissBuffer.length; i++) {
                await promissBuffer[i];
            }
            mknpad.var.ctx.fillText('Done.', 240, 80);
        },
        load(url, id) {
            return new Promise(resolve => {
                mknpad.sound.context = new AudioContext();
                let request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.addEventListener('load', () => {
                    mknpad.sound.context.decodeAudioData(request.response, function (buffer) {
                        mknpad.sound.buf[id] = buffer;
                        resolve();
                    }, function () {
                        alert("音声ファイルの読み込みに失敗しました。");
                    });
                });
                request.send();
            });
        },
        play(id) {
            if (!mknpad.sound.buf[id]) {
                return;
            }
            let source = mknpad.sound.context.createBufferSource();
            source.buffer = mknpad.sound.buf[id];
            let gain = mknpad.sound.context.createGain();
            gain.gain.value = mknpad.sound.vol;
            source.connect(gain);
            gain.connect(mknpad.sound.context.destination);
            source.start(0); // 同じ音声ならstartだけでも良い？
        }
    },
    image: {
        buf: [],
        async loadAll() {
            mknpad.var.ctx.fillText('Loading Images ...', 0, 64);
            const promissBuffer = [];
            const loadList = [
                { src: './asset/image/title.png', id: 'title' },
                { src: './asset/image/kuso.png', id: 'kuso' },
                { src: './asset/image/cluster.png', id: 'cluster' },
                { src: './asset/image/mitsu.png', id: 'mitsu' },
                { src: './asset/image/bsod.png', id: 'bsod' },
                { src: './asset/image/10man.png', id: '10man' },
                { src: './asset/image/hidameaso.png', id: 'aso' },
                { src: './asset/image/sousa1.png', id: 'sousa1' },
                { src: './asset/image/sousa2.png', id: 'sousa2' },
                { src: './asset/image/sousa3.png', id: 'sousa3' },
                { src: './asset/image/shoudoku.png', id: 'shoudoku' },
                { src: './asset/image/game.png', id: 'game' },
                { src: './asset/image/mask.png', id: 'mask' },
                { src: './asset/image/pl.png', id: 'pl' },
            ];
            for (let i = 0; i < loadList.length; i++) {
                promissBuffer.push(mknpad.image.load(loadList[i].src, loadList[i].id));
            }
            for (let i = 0; i < promissBuffer.length; i++) {
                await promissBuffer[i];
            }
            mknpad.var.ctx.fillText('Done.', 240, 64);
        },
        load(url, id) {
            return new Promise(resolve => {
                mknpad.image.buf[id] = new Image();
                mknpad.image.buf[id].addEventListener('load', () => resolve());
                mknpad.image.buf[id].src = url;
            });
        },
        get(id) {
            return mknpad.image.buf[id];
        },
    },
    anime: {
        buf: [],
        async loadAll() {
            mknpad.var.ctx.fillText('Loading Animations ...', 0, 96);
            const promissBuffer = [];
            const loadList = [
                { src: './asset/anime/sodi', id: 'sodi', flames: 125 },
            ];
            for (let i = 0; i < loadList.length; i++) {
                promissBuffer.push(mknpad.anime.load(loadList[i].src, loadList[i].id, loadList[i].flames));
            }
            for (let i = 0; i < promissBuffer.length; i++) {
                await promissBuffer[i];
            }
            mknpad.var.ctx.fillText('Done.', 240, 96);
        },
        async load(url, id, n) {
            let promissBuf = [];
            for (let i = 0; i < n; i++) {
                promissBuf[i] = mknpad.image.load(`${url}_${('00000' + i).slice(-5)}.png`, `anime_${id}_${i}`);
            }
            for (let i = 0; i < n; i++) {
                await promissBuf[i];
            }
            mknpad.anime.buf[id] = [0, n];
        },
        get(id) {
            const f = mknpad.image.get(`anime_${id}_${mknpad.anime.buf[id][0]++}`);
            if (mknpad.anime.buf[id][0] >= mknpad.anime.buf[id][1]) {
                mknpad.anime.buf[id][0] = 0;
            }
            return f;
        },
        rewind(id) {
            mknpad.anime.buf[id][0] = 0;
        },
        rewindAll() {
            for (let key in mknpad.anime.buf) {
                mknpad.anime.rewind(key);
            }
        }
    },
    music: {
        buf: [],
        vol: .5,
        async loadAll() {
            mknpad.var.ctx.fillText('Loading Musics ...', 0, 112);
            const promissBuffer = [];
            const loadList = [
                { src: './asset/music/prelude.m4a', id: 'title' },
                { src: './asset/music/scene1.mp3', id: 'baba1' },
                { src: './asset/music/scene2.mp3', id: 'baba2' },
                { src: './asset/music/scene3.mp3', id: 'baba3' },
                { src: './asset/music/scene4.mp3', id: 'baba4' },
                { src: './asset/music/scene5.mp3', id: 'baba5' },
                { src: './asset/music/scene6.mp3', id: 'baba6' },
                { src: './asset/sound/shoudoku.m4a', id: 'shoudoku' },
            ];
            for (let i = 0; i < loadList.length; i++) {
                promissBuffer.push(mknpad.music.load(loadList[i].src, loadList[i].id));
            }
            for (let i = 0; i < promissBuffer.length; i++) {
                await promissBuffer[i];
            }
            mknpad.var.ctx.fillText('Done.', 240, 112);
        },
        rewindAll() {
            for (let key in mknpad.music.buf) {
                mknpad.music.rewind(key);
            }
        },
        play(id) {
            mknpad.music._volume(id, mknpad.music.vol);
            mknpad.music.buf[id].play();
        },
        load(src, id) {
            return new Promise(resolve => {
                mknpad.music.buf[id] = new Audio(src);
                mknpad.music.buf[id].addEventListener('canplay', () => resolve());
                mknpad.music.buf[id].load();
                mknpad.music.buf[id].loop = true;
            });
        },
        stop(id) {
            mknpad.music.buf[id].pause();
        },
        _volume(id, v) {
            mknpad.music.buf[id].volume = v;
        },
        rewind(id) {
            mknpad.music.buf[id].currentTime = 0;
        },
        fadeOut(id) {
            let org = mknpad.music.buf[id].volume;
            let i = 1;
            return new Promise(resolve => {
                let iid = setInterval(() => {
                    mknpad.music._volume(id, org * (100 - i) / 100);
                    if (++i == 100) {
                        clearInterval(iid);
                        mknpad.music.stop(id);
                        resolve();
                    }
                }, 10);
            });
        },
        stopAll() {
            for (let key in mknpad.music.buf) {
                mknpad.music.stop(key);
            }
        },
        volumeAll(v) {
            for (let key in mknpad.music.buf) {
                mknpad.music._volume(key, v);
            }
        }
    },
    config: {
        all() {
            mknpad.config.canvas();
            mknpad.config.window();
        },
        canvas() {
            mknpad.dev.canvas.width = 640;
            mknpad.dev.canvas.height = 480;
            mknpad.var.ctx.font = "16px 'Courier New', Courier, monospace";
            mknpad.var.ctx.fillStyle = 'white';
        },
        window() {
            function resizeReset() {
                window.resizeTo(window.outerWidth - window.innerWidth + 640, window.outerHeight - window.innerHeight + 480);
            }
            resizeReset();
            window.addEventListener('resize', resizeReset);
        },
    },
    game: {
        internal: {
            pressKey(e) {
                mknpad.var.user.press(e.key);
            },
            releaseKey(e) {
                mknpad.var.user.release(e.key);
            },
            isTouched() {
                mknpad.var.clusters.sort((a, b) => (mknpad.lib.getDistance(mknpad.var.user.getPos(), a.getPos()) - mknpad.lib.getDistance(mknpad.var.user.getPos(), b.getPos())));
                if (mknpad.var.clusters[0] && mknpad.lib.getDistance(mknpad.var.user.getPos(), mknpad.var.clusters[0].getPos()) < mknpad.const.game.minDistance) {
                    return true;
                }
                return false;
            },
            isGet() {
                mknpad.var.mans.sort((a, b) => (mknpad.lib.getDistance(mknpad.var.user.getPos(), a.getPos()) - mknpad.lib.getDistance(mknpad.var.user.getPos(), b.getPos())));
                if (mknpad.var.mans[0] && mknpad.lib.getDistance(mknpad.var.user.getPos(), mknpad.var.mans[0].getPos()) < 50) {
                    mknpad.var.mans.shift();
                    return true;
                }
                return false;
            },
            sodiMater() {
                return ((1000 - mknpad.var.user.getSodiCount()) / 1000);
            },
            isClean() {
                mknpad.var.shoudokus.sort((a, b) => (mknpad.lib.getDistance(mknpad.var.user.getPos(), a.getPos()) - mknpad.lib.getDistance(mknpad.var.user.getPos(), b.getPos())));
                if (mknpad.var.shoudokus[0] && mknpad.lib.getDistance(mknpad.var.user.getPos(), mknpad.var.shoudokus[0].getPos()) < 50) {
                    mknpad.var.shoudokus.shift();
                    return true;
                }
                return false;
            },
            async getWorst() {
                /*
                function internalworst() {
                    return new Promise(resolve => {
                        let req = new XMLHttpRequest();
                        req.open('GET', './ranking.php?worst=1');
                        req.overrideMimeType('text/plain; charset=utf-8');
                        req.addEventListener('load', () => resolve(req.responseText));
                        req.send();
                    });
                }
                return await internalworst();
                */
                return 0;
            },
            kirikae() {
                if (mknpad.var.score > 1000000) {
                    mknpad.music.rewind('baba6');
                    mknpad.music.stop('baba6');
                    mknpad.music.play('baba6');
                }
                else if (mknpad.var.score > 700000) {
                    mknpad.music.rewind('baba5');
                    mknpad.music.stop('baba5');
                    mknpad.music.play('baba5');
                }
                else if (mknpad.var.score > 600000) {
                    mknpad.music.rewind('baba4');
                    mknpad.music.stop('baba4');
                    mknpad.music.play('baba4');
                }
                else if (mknpad.var.score > 400000) {
                    mknpad.music.rewind('baba3');
                    mknpad.music.stop('baba3');
                    mknpad.music.play('baba3');
                }
                else if (mknpad.var.score > 200000) {
                    mknpad.music.rewind('baba2');
                    mknpad.music.stop('baba2');
                    mknpad.music.play('baba2');
                }
                else {
                    mknpad.music.rewind('baba1');
                    mknpad.music.stop('baba1');
                    mknpad.music.play('baba1');
                }
            },
            kirikaeHandler(e) {
                mknpad.var.timerId = setTimeout(mknpad.game.internal.kirikae, e.target.duration * 1000 - 30);
            },
            ongaku() {
                mknpad.music.buf['baba1'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba1'].loop = false;
                mknpad.music.buf['baba2'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba2'].loop = false;
                mknpad.music.buf['baba3'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba3'].loop = false;
                mknpad.music.buf['baba4'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba4'].loop = false;
                mknpad.music.buf['baba5'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba5'].loop = false;
                mknpad.music.buf['baba6'].addEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba6'].loop = false;
            },
            ongakuEnd() {
                clearTimeout(mknpad.var.timerId);
                mknpad.music.stopAll();
                mknpad.music.buf['baba1'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba2'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba3'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba4'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba5'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
                mknpad.music.buf['baba6'].removeEventListener('play', mknpad.game.internal.kirikaeHandler);
            }
        },
        async exit() {
            await mknpad.lib.sleep(500);
            mknpad.music.stop('title');
            await mknpad.lib.sleep(1000);
            if (Math.random() < 0.05) {
                mknpad.sound.play('win98');
            }
            else {
                mknpad.sound.play('end');
            }
            await mknpad.lib.sleep(3000);
            mknpad.lib.clearScreen();
            await mknpad.lib.sleep(300);
            mknpad.var.ctx.drawImage(mknpad.image.get('title'), 0, 0, 640, 480);
            await mknpad.lib.sleep(50);
            mknpad.lib.clearScreen();
            mknpad.var.ctx.font = "bold 24px 'MS UI Gothic', sans-serif";
            mknpad.var.ctx.fillStyle = "red";
            await mknpad.lib.sleep(500);
            mknpad.var.ctx.fillText('ゲームのウィンドウを', 200, 240);
            mknpad.var.ctx.fillText('閉じる準備ができました', 200, 262);
            if (Math.random() < 0.001) {
                mknpad.var.ctx.fillStyle = 'rgb(0, 0, 128)';
                mknpad.var.ctx.fillRect(0, 0, 640, 480);
                await mknpad.lib.sleep(100);
                mknpad.var.ctx.drawImage(mknpad.image.get('bsod'), 0, 0, 640, 480);
            }
        },
        async title() {
            function DrawMenu() {
                mknpad.var.ctx.fillStyle = "rgb(0, 64, 192)";
                mknpad.var.ctx.strokeStyle = "gray";
                mknpad.var.ctx.lineWidth = 4;
                mknpad.var.ctx.fillRect(200, 320, 240, 120);
                mknpad.var.ctx.strokeRect(200, 320, 240, 120);
                mknpad.var.ctx.strokeStyle = "white";
                mknpad.var.ctx.lineWidth = 2;
                mknpad.var.ctx.strokeRect(200, 320, 240, 120);
                mknpad.lib.drawText('感染予防に努める', 223, 360);
                mknpad.lib.drawText('最新の情報をみる', 223, 390);
                mknpad.lib.drawText('     やめる     ', 223, 420);
            }
            function MainMenu() {
                return new Promise(resolve => {
                    let select = 0;
                    async function KeySelector(e) {
                        DrawMenu();
                        mknpad.music.play('title');
                        switch (e.key) {
                            case 'ArrowUp':
                            case 'w':
                            case 'W':
                                mknpad.sound.play('cur');
                                select = (select > 0 ? select - 1 : select);
                                break;
                            case 'ArrowDown':
                            case 's':
                            case 'S':
                                mknpad.sound.play('cur');
                                select = (select < 2 ? select + 1 : select);
                                break;
                            case 'Escape':
                                mknpad.sound.play('dec');
                                window.removeEventListener('keydown', KeySelector);
                                await mknpad.submenu.main();
                                mknpad.sound.play('dec');
                                window.addEventListener('keydown', KeySelector);
                                break;
                            case ' ':
                            case 'Enter':
                                mknpad.sound.play('dec');
                                window.removeEventListener('keydown', KeySelector);
                                resolve(select);
                        }
                        mknpad.var.ctx.strokeStyle = "yellow";
                        mknpad.var.ctx.lineWidth = 2;
                        mknpad.var.ctx.strokeRect(210, 336 + select * 30, 220, 30);
                    }
                    KeySelector({ key: '' });
                    window.addEventListener('keydown', KeySelector);
                });
            }
            mknpad.lib.clearScreen();
            mknpad.music.play('title');
            mknpad.var.ctx.drawImage(mknpad.image.get('title'), 0, 0, 640, 480);
            mknpad.var.ctx.font = "16px 'MS Gothic', sans-serif";
            mknpad.var.ctx.fillStyle = 'white';
            mknpad.var.ctx.fillText('[Esc] : 音量調節', 0, 475);
            DrawMenu();
            return await MainMenu();
        },
        async main() {
            if (!mknpad.var.kusoDone) {
                mknpad.var.kusoDone = true;
                mknpad.var.ctx.drawImage(mknpad.image.get('kuso'), 0, 0, 640, 480);
                mknpad.sound.play('kuso');
                let angle = 0;
                let id2 = setInterval(() => {
                    mknpad.lib.drawRotatedImage(mknpad.image.get('aso'), 100, 70, 150, 140, angle += 0.1);
                    mknpad.lib.drawRotatedImage(mknpad.image.get('aso'), 540, 70, 150, 140, -angle);
                }, 20);
                await mknpad.lib.sleep(3000);
                clearInterval(id2);
                await mknpad.lib.fadeOut();
                for (let i = 0; i < 3; i++) {
                    mknpad.var.ctx.drawImage(mknpad.image.get(`sousa${i + 1}`), 0, 0, 640, 480);
                    if (i === 2) {
                        mknpad.sound.play('mask');
                    }
                    let c;
                    do {
                        c = await mknpad.lib.waitKey();
                    } while (c !== ' ' && c !== 'Enter' && c !== 'Escape');
                    if (c === 'Escape')
                        break;
                    mknpad.sound.play('dec');
                    await mknpad.lib.fadeOut();
                }
            }
            mknpad.game.init();
            mknpad.music.play('baba1');
            function hoge() {
                return new Promise(resolve => {
                    let id = setInterval(async () => {
                        mknpad.game.update();
                        mknpad.game.render();
                        if (mknpad.var.user.isDead()) {
                            clearInterval(id);
                            mknpad.music.stopAll();
                            mknpad.sound.play('mitsu');
                            mknpad.var.ctx.drawImage(mknpad.image.get('mitsu'), 0, 0, 640, 480);
                            mknpad.game.internal.ongakuEnd();
                            let worst = await mknpad.game.internal.getWorst();
                            await mknpad.lib.sleep(2500);
                            let c;
                            do {
                                c = await mknpad.lib.waitKey();
                                if (c === 't' || c === 'T') {
                                    window.open(`https://twitter.com/intent/tweet?` +
                                        `hashtags=${encodeURIComponent('StayHome,SosyaruDisutansu')}&` +
                                        `text=${encodeURIComponent(`私のスコアは ${mknpad.var.score} でした！\nみんなもやろう！\n`)}&` +
                                        `url=${encodeURIComponent('https://team-kojin.github.io/sodi/')}`, '_blank');
                                }
                            } while (c !== ' ' && c !== 'Enter');
                            /*
                            if (Number(worst) < mknpad.var.score) {
                                let name;
                                const prevName = window.localStorage.username && window.localStorage.getItem('username') || '名無しの引きこもり';
                                do {
                                    name = window.prompt('新記録です！\nランキングに掲載する名前を入力してください！(16文字まで)\n(キャンセルを押すことで送信せずに終了します)', prevName);
                                    name && (name = name.replace(/\s+/g, ' ').replace(/(^\s*|\s*$)/g, ''));
                                } while (name === '' || (name === null || name === void 0 ? void 0 : name.length) > 16);
                                if (name !== null) {
                                    let req = new XMLHttpRequest();
                                    req.open('POST', './ranking.php');
                                    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                    req.send(`name=${name}&score=${mknpad.var.score}`);
                                    window.localStorage.setItem('username', name);
                                }
                            }
                            */
                            await mknpad.lib.fadeOut();
                            resolve();
                        }
                    }, 20);
                });
            }
            await hoge();
        },
        init() {
            mknpad.var.clusters = [];
            mknpad.var.mans = [];
            mknpad.var.shoudokus = [];
            mknpad.var.user = null;
            mknpad.var.score = 0;
            mknpad.anime.rewindAll();
            mknpad.music.rewindAll();
            // 音楽関係
            mknpad.game.internal.ongaku();
            mknpad.music.buf['shoudoku'].loop = false;
            mknpad.var.clusters.push(new Cluster(320, 0, 0, 1));
            mknpad.var.user = new User(240, 400);
            window.addEventListener('keydown', mknpad.game.internal.pressKey);
            window.addEventListener('keyup', mknpad.game.internal.releaseKey);
        },
        update() {
            if (mknpad.var.user.getSoding() === -1) {
                for (let i = 0; i < mknpad.var.clusters.length; i++) {
                    mknpad.var.clusters[i].update();
                }
                for (let i = 0; i < mknpad.var.mans.length; i++) {
                    mknpad.var.mans[i].update();
                }
                for (let i = 0; i < mknpad.var.shoudokus.length; i++) {
                    mknpad.var.shoudokus[i].update();
                }
                if (Math.random() < (0.03 + mknpad.var.score / 30000000)) {
                    mknpad.var.clusters.push(new Cluster(Math.random() * 640, 0 - 80, Math.random() * (2 + mknpad.var.score / 300000) - (2 + mknpad.var.score / 300000) / 2, Math.random() * (3 + mknpad.var.score / 500000)));
                }
                if (Math.random() < 0.002) {
                    mknpad.var.mans.push(new Money(Math.random() * 640, 0 - 80, Math.random() * 2 - 1, Math.random() * 3));
                }
                if (Math.random() < 0.001) {
                    mknpad.var.shoudokus.push(new Shoudoku(Math.random() * 640, 0 - 80, Math.random() * 2 - 1, Math.random() * 3));
                }
                for (let i = 0; i < mknpad.var.clusters.length; i++) {
                    if (mknpad.var.clusters[i].isDead()) {
                        mknpad.var.clusters.splice(i, 1);
                    }
                }
                mknpad.var.user.solve();
                mknpad.var.user.update();
                if (mknpad.var.user.isMuteki() && mknpad.music.buf['shoudoku'].paused) {
                    mknpad.music.play('shoudoku');
                }
                if (mknpad.var.user.isSodi()) {
                    mknpad.music.stop('shoudoku');
                    mknpad.sound.play('sodi');
                    setTimeout(() => (mknpad.var.clusters = []), 1520);
                }
                if (mknpad.game.internal.isTouched()) {
                    mknpad.var.user.kill();
                }
                if (mknpad.game.internal.isGet()) {
                    mknpad.sound.play('man');
                    mknpad.var.score += 100000;
                }
                if (mknpad.game.internal.isClean()) {
                    mknpad.music.rewind('shoudoku');
                    mknpad.music.play('shoudoku');
                    mknpad.var.user.getMuteki(275);
                }
                if (mknpad.var.user.getSodiCount() === 1) {
                    mknpad.sound.play('sodiok');
                }
                if (mknpad.var.user.isDead()) {
                    window.removeEventListener('keydown', mknpad.game.internal.pressKey);
                    window.removeEventListener('keyup', mknpad.game.internal.releaseKey);
                }
                mknpad.var.score += 20;
            }
            mknpad.var.user.updateSoding();
        },
        render() {
            mknpad.lib.clearScreen();
            for (let i = 0; i < mknpad.var.mans.length; i++) {
                mknpad.var.mans[i].render();
            }
            for (let i = 0; i < mknpad.var.shoudokus.length; i++) {
                mknpad.var.shoudokus[i].render();
            }
            for (let i = 0; i < mknpad.var.clusters.length; i++) {
                mknpad.var.clusters[i].render();
            }
            mknpad.var.user.render();
            mknpad.var.ctx.drawImage(mknpad.image.get('game'), 480, 0);
            mknpad.lib.drawText(('00000000' + mknpad.var.score).slice(-8), 515, 80, 20);
            for (let i = 0; i < mknpad.var.user.getLife(); i++) {
                mknpad.var.ctx.drawImage(mknpad.image.get('mask'), 490 + i * 65, 160, 65, 60);
            }
            if (mknpad.var.user.getLife() === 0) {
                mknpad.lib.drawText('No Mask', 520, 180, 20);
            }
            mknpad.var.ctx.fillStyle = 'white';
            mknpad.var.ctx.fillRect(489, 319, 142, 42);
            mknpad.var.ctx.fillStyle =
                `rgb(${Math.floor(Math.cos(mknpad.game.internal.sodiMater() * Math.PI / 2) * 255)}, ${Math.floor(Math.sin(mknpad.game.internal.sodiMater() * Math.PI / 2) * 255)}, 0)`;
            mknpad.var.ctx.fillRect(490, 320, 140 * mknpad.game.internal.sodiMater(), 40);
            if (mknpad.var.user.getSoding() !== -1) {
                mknpad.var.ctx.drawImage(mknpad.anime.get('sodi'), 0, 0, 640, 480);
            }
        },
    },
    submenu: {
        var: {
            subwin: null,
            bgmVol: null,
            seVol: null,
            okButton: null,
        },
        main() {
            return new Promise(resolve => {
                mknpad.submenu.open();
                mknpad.submenu.var.okButton.addEventListener('click', () => {
                    mknpad.submenu.close();
                    resolve();
                });
            });
        },
        open() {
            (mknpad.submenu.var.subwin = document.body.appendChild(document.createElement('div'))).classList.add('submenu');
            mknpad.submenu.var.subwin
                .appendChild(document.createElement('div'))
                .appendChild(document.createTextNode('このダイアログはマウスで操作できます')).parentElement
                .classList.add('note');
            mknpad.submenu.var.subwin
                .appendChild(document.createElement('label'))
                .appendChild(document.createTextNode('BGM Volume\n')).parentElement
                .appendChild(mknpad.submenu.var.bgmVol = document.createElement('input')).type = 'range';
            mknpad.submenu.var.bgmVol.min = '0';
            mknpad.submenu.var.bgmVol.max = '1';
            mknpad.submenu.var.bgmVol.step = '.05';
            mknpad.submenu.var.bgmVol.value = `${mknpad.music.vol}`;
            mknpad.submenu.var.bgmVol.addEventListener('input', () => {
                mknpad.sound.play('cur');
                mknpad.music.play('title');
                mknpad.music.volumeAll(mknpad.music.vol = +mknpad.submenu.var.bgmVol.value);
            });
            mknpad.submenu.var.subwin
                .appendChild(document.createElement('label'))
                .appendChild(document.createTextNode('SE Volume\n')).parentElement
                .appendChild(mknpad.submenu.var.seVol = document.createElement('input')).type = 'range';
            mknpad.submenu.var.seVol.min = '0';
            mknpad.submenu.var.seVol.max = '1';
            mknpad.submenu.var.seVol.step = '.05';
            mknpad.submenu.var.seVol.value = `${mknpad.sound.vol}`;
            mknpad.submenu.var.seVol.addEventListener('input', () => {
                mknpad.sound.play('cur');
                mknpad.music.play('title');
                mknpad.sound.vol = +mknpad.submenu.var.seVol.value;
            });
            mknpad.submenu.var.subwin
                .appendChild(document.createElement('div'))
                .appendChild(document.createTextNode('Version')).parentElement
                .appendChild(document.createElement('br')).parentElement
                .appendChild(document.createElement('span'))
                .appendChild(document.createTextNode(`🍊 ${mknpad.const.versionString}:${mknpad.const.version}`)).parentElement
                .appendChild(document.createElement('br')).parentElement
                .appendChild(document.createTextNode('https://team-kojin.github.io/sodi/')).parentElement
                .style.fontSize = 'small';
            mknpad.submenu.var.subwin
                .appendChild(mknpad.submenu.var.okButton = document.createElement('button')).textContent = 'OK';
            mknpad.submenu.var.okButton.style.width = '5em';
            mknpad.submenu.var.okButton.style.height = '2em';
            mknpad.submenu.var.okButton.style.position = 'absolute';
            mknpad.submenu.var.okButton.style.bottom = '1em';
            mknpad.submenu.var.okButton.style.right = '1em';
            mknpad.submenu.var.okButton.focus();
        },
        close() {
            mknpad.submenu.var.subwin.parentElement.removeChild(mknpad.submenu.var.subwin);
        }
    },
    async main() {
        if (!mknpad.init()) {
            window.alert('初期化中にエラーが発生しました');
            return false;
        }
        mknpad.config.all();
        await mknpad.load();
        while (1) {
            mknpad.music.stopAll();
            switch (await mknpad.game.title()) {
                case 0:
                    mknpad.music.fadeOut('title');
                    await mknpad.lib.fadeOut();
                    await mknpad.game.main();
                    break;
                case 1:
                    window.open('https://www.stopcovid19.jp/', '_blank');
                    mknpad.music.stop('title');
                    break;
                case 2:
                    mknpad.game.exit();
                    return 0;
            }
        }
    },
    async load() {
        mknpad.var.ctx.fillText(`${mknpad.const.versionString}:${mknpad.const.version}`, 0, 16);
        mknpad.var.ctx.fillText('Starting up ...', 0, 32);
        const imagePromiss = mknpad.image.loadAll();
        const soundPromiss = mknpad.sound.loadAll();
        const animePromiss = mknpad.anime.loadAll();
        const musicPromiss = mknpad.music.loadAll();
        await imagePromiss;
        await soundPromiss;
        await animePromiss;
        await musicPromiss;
        mknpad.var.ctx.fillText('Have fun!!', 0, 144);
        await mknpad.lib.sleep(1500);
    },
    init() {
        mknpad.dev.canvas = document.querySelector('canvas.canvas');
        mknpad.var.ctx = mknpad.dev.canvas.getContext && mknpad.dev.canvas.getContext("2d") || null;
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        return mknpad.dev.canvas && mknpad.var.ctx && true;
    },
};
window.addEventListener('load', () => mknpad.main());
