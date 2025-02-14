document.addEventListener('DOMContentLoaded', init);

var canvas, canvas2;
var currentX = 10000;
var currentY = 10000;
var numElements;
var rect;
var loveboxes = [];
var isMouseDown = false;
var startX, startY;
var success = false;
var visitCount = 0; // Number of visits to manage messages sequence
var maxDistance = 240; // Maximum cursor influence distance
let fillstep = 20; // Lovebox fill step from 0 to 100

function init() {
    // Title and message selection
    const title = titles[Math.floor(Math.random() * titles.length)];
    visitCount = parseInt(localStorage.getItem('visitCount')) || 0;
    const messageIndex = visitCount % messages.length;
    const messsaage = messages[messageIndex] + messageend;

    document.getElementById('title').textContent = title;
    document.getElementById('messagep').textContent = messsaage;

    // Prevent text selection
    document.onselectstart = () => false;

    // Canvas setup
    canvas2 = document.getElementById('nums');
    rect = canvas2.getBoundingClientRect();
    window.addEventListener('resize', () => {
        rect = canvas2.getBoundingClientRect();
    });

    // Setup loveboxes
    document.querySelectorAll('.lovebox').forEach(box => loveboxes.push(box));

    // Create numbers
    for (let i = 0; i < 42; i++) {
        const i2 = getSpecialNum();
        const numDiv = document.createElement('div');
        numDiv.className = 'num';
        numDiv.dataset.sc = '0';
        numDiv.id = `num_${i}`;
        numDiv.innerHTML = `
            <div class="num1">${i2}</div>
            <div class="num2">${i2}</div>
        `;
        numDiv.style.opacity = '0';
        canvas2.prepend(numDiv);

        // Animación de entrada con delay
        setTimeout(() => {
            numDiv.style.transition = 'opacity 600ms';
            numDiv.style.opacity = '1';
        }, Math.random() * 500);
    }

    // Grid setup
    const canvasWidth = canvas2.offsetWidth;
    const canvasHeight = canvas2.offsetHeight;
    const gridSizeW = 6;
    const gridSizeH = 7;
    const elementWidth = canvasWidth / gridSizeW;
    const elementHeight = canvasHeight / gridSizeH;

    numElements = document.querySelectorAll('.num');
    numElements.forEach((el, index) => {
        const row = Math.floor(index / gridSizeW);
        const col = index % gridSizeW;
        el.style.position = 'absolute';
        el.style.left = `${col * elementWidth + (elementWidth / 2)}px`;
        el.style.top = `${row * elementHeight + (elementHeight / 2)}px`;
    });

    // Event Listeners
    document.getElementById('scanlines').addEventListener('mousedown', e => appmousedown(e, false));
    document.getElementById('app').addEventListener('mousemove', e => appmousemove(e, false));
    document.addEventListener('mouseup', appmouseup);

    // Touch events
    document.addEventListener('touchstart', e => appmousedown(e, true));
    document.addEventListener('touchmove', e => {
        e.preventDefault();
        appmousemove(e, true);
    });
    document.addEventListener('touchend', appmouseup);

    document.getElementById('botreplay').addEventListener('click', () => location.reload());

    // Animation loop
    setInterval(updatenums, 1000 / 15);
}

// Animate elements
function animate(element, properties, duration, easing = 'ease') {
    element.style.transition = Object.keys(properties)
        .map(prop => `${prop} ${duration}ms ${easing}`)
        .join(', ');
    Object.assign(element.style, properties);
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

function updatePosition(element, left, top) {
    element.style.transform = `translate(${left}px, ${top}px)`;
}

function getSpecialNum() {
    var randomNum = Math.random();
    if (randomNum < 0.4) {
        i2 = specialNumbers[Math.floor(Math.random() * specialNumbers.length)];
    } else {
        i2 = Math.floor(Math.random() * 99) + 1;
    }
    return i2;
}

function appmousemove(e, mobile) {
    if (!success) {
        if (mobile) {
            let touch = e.touches[0] || e.changedTouches[0];
            currentX = touch.pageX - rect.left;
            currentY = touch.pageY - rect.top;

        } else {
            currentX = e.clientX - rect.left;
            currentY = e.clientY - rect.top;
        }
        //console.log("currentX: " + currentX + " currentY: " + currentY);
        if (isMouseDown) {
            var width = Math.abs(currentX - startX);
            var height = Math.abs(currentY - startY);
            var newX = (currentX < startX) ? currentX : startX;
            var newY = (currentY < startY) ? currentY : startY;
            document.getElementById('selection').style.left = newX + 'px';
            document.getElementById('selection').style.top = newY + 'px';
            document.getElementById('selection').style.width = width + 'px';
            document.getElementById('selection').style.height = height + 'px';
        }
        //updatenums();
    }
}
function appmousedown(e, mobile) {
    if (!success) {
        if (mobile) {
            let touch = e.touches[0] || e.changedTouches[0];
            currentX = touch.pageX - rect.left;
            currentY = touch.pageY - rect.top;

        } else {
            currentX = e.clientX - rect.left;
            currentY = e.clientY - rect.top;
        }

        isMouseDown = true;
        startX = currentX;
        startY = currentY;
        document.getElementById('selection').style.left = startX + 'px';
        document.getElementById('selection').style.top = startY + 'px';
        document.getElementById('selection').style.width = '0';
        document.getElementById('selection').style.height = '0';
        document.getElementById('selection').style.display = 'block';
    }
}
function appmouseup() {
    if (!success) {
        var selectionRect = document.getElementById('selection').getBoundingClientRect();
        console.log("selectionRect: " + selectionRect.left + " " + selectionRect.top + " " + selectionRect.right + " " + selectionRect.bottom);
        if (isMouseDown) {
            isMouseDown = false;
            document.getElementById('selection').style.display = 'none';
        }
        isMouseDown = false;

        // Execute if numrect size is greater than 50
        if (selectionRect.width > 50 && selectionRect.height > 50) {

            // Loop through .num elements that don't have the removed class
            document.querySelectorAll('.num:not(.removed)').forEach(function (num) {
                var numRect = num.getBoundingClientRect();
                if (!(selectionRect.right < numRect.left ||
                    selectionRect.left > numRect.right ||
                    selectionRect.bottom < numRect.top ||
                    selectionRect.top > numRect.bottom)) {
                    // Collision detected
                    var op = num.querySelector('.num2').style.opacity;
                    var dat = num.querySelector('.num1').textContent;

                    if (op > 0.8 && ((dat == 42) || specialNumbers.includes(parseInt(dat)))) {
                        //duplicamos el elemento
                        var newElement = num.cloneNode(true);

                        var newNumber = getSpecialNum();
                        newElement.querySelector('.num1').textContent = newNumber;
                        newElement.querySelector('.num2').textContent = newNumber;

                        //newElement.html($(this).html());
                        newElement.style.opacity = '0';
                        setTimeout(() => {
                            newElement.style.transition = 'opacity 1000ms';
                            newElement.style.opacity = '1';
                        }, Math.random() * 1000);
                        document.getElementById('nums').appendChild(newElement);
                        num.classList.add('removed');

                    }
                } else {
                    // No collision
                    //$(this).css('background-color', '');
                }
            });
            totremoved = document.querySelectorAll('.removed').length;
            animateRemoved();
        }
    }
}
let totremoved = 0; let lovebox;
function animateRemoved() {
    if (totremoved > 0) {
        // Choose a random lovebox and get its center position
        lovebox = loveboxes[Math.floor(Math.random() * loveboxes.length)];
        // Check if this lovebox fill is 100, if so choose another
        if (parseInt(lovebox.querySelector('.lovefill').getAttribute('fill')) >= 100) {
            animateRemoved();
            return;
        }
        var pos = lovebox.offsetLeft;
        var posy = document.getElementById('bottom').offsetTop - document.getElementById('bottom').offsetHeight / 2;
        lovebox.classList.add('open');

        document.querySelectorAll('.removed').forEach(function (element) {
            // Position can be 25% or 75% of canvas randomly

            element.style.transition = 'all 800ms ease-in-out';
            element.style.left = pos + 'px';
            element.style.top = posy + 'px';
            element.style.opacity = '0.2';
            setTimeout(() => {
                element.remove();
            }, 800);
        });
        if (totremoved > 0) setTimeout(updatelovebox, 1000);
    }
}

function updatelovebox() {
    lovebox.classList.remove('open');
    var f = parseInt(lovebox.querySelector('.lovefill').getAttribute('fill'));
    f = f + (totremoved * fillstep);
    lovebox.setAttribute('fill', f);
    lovebox.querySelector('.lovefill').textContent = f + '%';
    lovebox.querySelector('.lovefill').setAttribute('fill', f);
    lovebox.querySelector('.lovefill').style.backgroundSize = f + '% 100%';
    if (f > 20) {
        lovebox.querySelector('.lovefill').style.color = 'black';
    }
    if (f >= 100) {
        lovebox.querySelector('.lovefill').textContent = '100%';
        if (!lovebox.querySelector('.lovename').textContent.includes('❤')) lovebox.querySelector('.lovename').textContent = lovebox.querySelector('.lovename').textContent + ' ❤';
        lovebox.querySelector('.lovefill').style.backgroundSize = '110% 100%';
        lovebox.querySelector('.lovefill').style.backgroundImage = 'url(imgs/progressok.png)';

    }
    // Check all loveboxes if they are at 100
    var all100 = true;
    document.querySelectorAll('.lovefill').forEach(function (fill) {
        if (parseInt(fill.getAttribute('fill')) < 100) {
            all100 = false;
        }
    });
    if (all100) {
        success = true;
        localStorage.setItem('visitCount', visitCount + 1);

        document.getElementById('selection').style.display = 'none';
        document.querySelectorAll('.num').forEach(function (num) {
            num.style.transition = 'opacity 800ms';
            num.style.opacity = '0';
        });

        var message = document.querySelector('#message p').textContent;
        document.querySelector('#message p').textContent = '';
        var index = 0;
        function typeWriter() {
            document.getElementById('message').style.display = 'block';
            document.getElementById('botreplay').style.display = 'block';
            if (index < message.split(/(\s+|<br>)/).length) {
                let word = message.split(/(\s+|<br>)/)[index];
                console.log("word: " + word);
                if (word == 'Te' || word == '-Pantolo') document.querySelector('#message p').innerHTML += '<br>';
                document.querySelector('#message p').innerHTML += word;

                index++;
                setTimeout(typeWriter, 100);
            }
        }
        setTimeout(typeWriter, 1000);
    }
}

function updatenums() {
    document.querySelectorAll('.num:not(.removed)').forEach(function (element) {
        var sc = parseFloat(element.getAttribute('data-sc'));
        if (sc > 0) sc = sc - 1.1;
        var elementX = element.offsetLeft;
        var elementY = element.offsetTop;
        var dx = elementX - currentX;
        var dy = elementY - currentY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        //console.log("distance: "+distance);
       
        if (distance < maxDistance) {
            var power = ((maxDistance - distance) / maxDistance) / 2;
            var randomMargin = ((Math.random() - 0.5) * power * 1);
            var angle = Math.atan2(dy, dx);
            var force = power * 10; // Adjust the force multiplier as needed
            var offsetX = Math.cos(angle) * force;
            var offsetY = Math.sin(angle) * force;
            if (sc < 24) sc = sc + (power * 3.6);
            element.style.marginLeft = randomMargin + offsetX + 'px';
            element.style.marginTop = randomMargin + offsetY + 'px';
            element.style.fontSize = 18 + Math.floor(sc) + 'px';
            var element2 = element.querySelector('.num2');
            element2.style.opacity = sc / 10;
        } else {
            element.style.fontSize = 18 + Math.floor(sc) + 'px';
        }
        element.setAttribute('data-sc', sc);
    });
}

var titles = [
    "BIENESTAR",
    "FELICIDAD",
    "EQUILIBRIO",
    "CALMA",
    "SERENIDAD",
    "CONFORMIDAD",
    "SINTONÍA",
    "COMPLICIDAD",
    "PUREZA",
    "CLARIDAD",
    "ARMONÍA",
    "PERFECCIÓN",
    "DEVOCIÓN",
    "INTEGRIDAD",
    "SACRIFICIO",
    "ENTREGA",
    "ILUMINACIÓN",
    "TRANQUILIDAD",
    "CUARENTAYDOS",
    "AMORE"
];
specialNumbers = [42, 15, 27, 1, 25, 13, 8, 17, 21, 75, 89];
var messages = [
    "Dentri o fueri, el verdadero bienestar es estar contigo.",
    "Gracias por refinar mi vida y a esta familia.",
    "No hay macrodatos suficientes para cuantificar lo que te amo.",
    "Oye, tenemos que hacer un Waffle Party algún dia no?.",
    "Los macrodatos lo confirman: te quiero más que nunca.",
    "5 años refinando la vida juntos, dentri y fueri.",
    "Hoy es Viernes de severance, ¡y hay empanadas!"
];
var messageend = " Te Kier-o mucho más que muchísimo: -Pantolo";
