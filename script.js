const qs = (target) => document.querySelector(target);
const doms = {
    loading: qs('.loading'),
    clock: qs('.clock'),
    clockDial: {
        small: qs('.clock .dial .small'),
        medium: qs('.clock .dial .meduim'),
        large: qs('.clock .dial .large')
    },
    clockHand: {
        s: qs('.clock .hand.s'),
        m: qs('.clock .hand.m'),
        h: qs('.clock .hand.h')
    }
};
const assets = {};
const clockTick = {
    s: 0,
    m: 0,
    h: 0,
    sound: 0
};
var clockId;

doms.clock.addEventListener('click', () =>
{
    let lastClickTime = doms.clock.clickTime;
    doms.clock.clickTime = Date.now();
    if (!lastClickTime) return;

    if (doms.clock.clickTime - lastClickTime <= 200)
    {
        assets.sound.volume((assets.sound.volume() < 1 ? 1 : 0));
    }
});

window.addEventListener('DOMContentLoaded', async () =>
{
    calcHeightPercent();

    await (async (resources) =>
    {
        for (const resource of resources)
        {
            try
            {
                let res = await fetchResource(resource.url);
                let url = URL.createObjectURL(res);

                resource.dom.style.backgroundImage = 'url(\'' + url + '\')';
            }
            catch (e)
            {
                console.error('Failed to get resource ' + resource.url);
                console.error(e);
                continue;
            }
        }

        function fetchResource(url)
        {
            return new Promise((res, rej) =>
            {
                let xhr = new XMLHttpRequest();

                xhr.responseType = 'blob';

                xhr.onreadystatechange = () =>
                {
                    if (xhr.readyState === 4 && xhr.status === 200)
                    {
                        res(xhr.response);
                    }
                };

                xhr.onerror = (e) =>
                {
                    rej(e);
                };

                xhr.open('GET', url);
                xhr.send();
            });
        }
    })([
        { url: './assets/ClockDial_Small.png', dom: doms.clockDial.small },
        { url: './assets/ClockDial_Medium.png', dom: doms.clockDial.medium },
        { url: './assets/ClockDial_Large.png', dom: doms.clockDial.large },

        { url: './assets/ClockHand_S.png', dom: doms.clockHand.s },
        { url: './assets/ClockHand_M.png', dom: doms.clockHand.m },
        { url: './assets/ClockHand_H.png', dom: doms.clockHand.h }
    ]);

    (await (new Promise((res, rej) =>
    {
        assets.sound = new Howl({
            src: './assets/Clock.wav',
            preload: true,
            loop: false,
            autoplay: false,

            onload: () => {
                res(assets.audio);
            },
            onloaderror: (id, e) => {
                rej(id, e);
            }
        });

        assets.sound.load();
    })));

    let currentTime = new Date();

    clockTick.s = currentTime.getSeconds();
    clockTick.m = currentTime.getMinutes();
    clockTick.h = currentTime.getHours() / 12 * 60;

    doms.clockHand.s.style.setProperty('--tick', clockTick.s);
    doms.clockHand.m.style.setProperty('--tick', clockTick.m);
    doms.clockHand.h.style.setProperty('--tick', clockTick.h);

    clockId = setInterval(calcClock, 1000);

    doms.loading.style.display = 'none';
    document.body.classList.add('loaded');
    assets.sound.play();
});
window.addEventListener('resize', () => calcHeightPercent());

function calcHeightPercent()
{
    let heightPercent = document.documentElement.clientHeight / 1080;
    document.body.style.setProperty('--height-percent', heightPercent);
}

function calcClock()
{
    clockTick.s += 1;
    clockTick.m += (1 / 60);
    clockTick.h += ((1 / 60) / 12);

    doms.clockHand.s.style.setProperty('--tick', clockTick.s);
    doms.clockHand.m.style.setProperty('--tick', clockTick.m);
    doms.clockHand.h.style.setProperty('--tick', clockTick.h);

    clockTick.sound += 1;
    if (clockTick.sound % 4 == 0) assets.sound.play();
}