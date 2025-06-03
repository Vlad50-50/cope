const topEdge = window.scrollY;
const bottomEdge = window.scrollY + window.innerHeight;
const leftEdge = window.scrollX;
const rightEdge = window.scrollX + window.innerWidth;

const okno = document.getElementById('window');

document.body.style.overflow = 'hidden';

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

okno.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - okno.offsetLeft;
    offsetY = e.clientY - okno.offsetTop;
    okno.style.cursor = 'grabbing';
});

okno.addEventListener('mousemove', (e) => {
    if (isDragging) {      
        okno.style.left = (e.clientX - offsetX) + 'px';
        okno.style.top = (e.clientY - offsetY) + 'px';
    }
});


document.addEventListener('mouseup', () => {
    isDragging = false;
    okno.style.cursor = 'grab';

    console.log(okno.style.left);
    
    okno.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - okno.offsetLeft;
        offsetY = e.clientY - okno.offsetTop;
        okno.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {      
            okno.style.left = (e.clientX - offsetX) + 'px';
            okno.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    if(parseInt(okno.style.left) < leftEdge) okno.style.left = leftEdge + 'px';
    if((parseInt(okno.style.left)+okno.offsetWidth) > rightEdge) okno.style.left = (rightEdge-okno.offsetWidth) + 'px';
    if(parseInt(okno.style.top) < topEdge) okno.style.top = topEdge + 'px';
    if(parseInt(okno.style.top) > (bottomEdge-200)) okno.style.top = (bottomEdge-okno.offsetHeight-40) + 'px';
    console.log("Координати вікна:", okno.style.left, okno.style.top);
});




console.log("Край зверху:", topEdge);
console.log("Край знизу:", bottomEdge);
console.log("Край зліва:", leftEdge);
console.log("Край справа:", rightEdge);
