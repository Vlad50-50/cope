const maxLeft_pos = window.scrollX;
const maxTop_pos = window.scrollY;
const maxRight_pos = window.scrollX + window.innerWidth;
const maxBottom_pos = window.scrollY + window.innerHeight;

let zIndex_count = 200;

class DraggableWindow {
    constructor(element) {
        this.el = element;

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.el.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        document.body.style.overflow = 'hidden';
    }

    onMouseDown(e) {
        this.isDragging = true;
        const rect = this.el.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        this.el.style.cursor = 'grabbing';

        zIndex_count++;
        this.el.style.zIndex = zIndex_count;
        console.log("Z-index:" + zIndex_count);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        let newLeft = e.clientX - this.offsetX;
        let newTop = e.clientY - this.offsetY;

        const elWidth = this.el.offsetWidth;
        const elHeight = this.el.offsetHeight;

        if (newLeft < maxLeft_pos) newLeft = maxLeft_pos;
        if (newLeft + elWidth > maxRight_pos) newLeft = maxRight_pos - elWidth;
        if (newTop < maxTop_pos) newTop = maxTop_pos;
        if (newTop + elHeight > maxBottom_pos) newTop = (maxBottom_pos - elHeight);

        this.el.style.left = newLeft + 'px';
        this.el.style.top = newTop + 'px';
    }

    onMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.el.style.cursor = 'grab';

        console.log(`Координати вікна: left=${this.el.style.left}, top=${this.el.style.top}`);
    }
}

function initWin(selector) {
    let allWindows = document.querySelectorAll(selector);
    let draggableInstances = [];

    console.log(allWindows);


    allWindows.forEach(el => {
        console.log(el);
        let instance = new DraggableWindow(el);
        draggableInstances.push(instance);
    });
}

function createWin(
                    name = 'Base',
                    content = '',
                    size = { width: 200, height: 200 },
                    position = { 
                        left: ((maxRight_pos - size.width)/2),
                        top: (((maxBottom_pos - size.height)/2)-60) 
                    }) {

    const newWindow = document.createElement('div');

    newWindow.classList.add('draggable-window');
    newWindow.style.width = size.width + 'px';
    newWindow.style.height = size.height + 'px';
    newWindow.style.left = position.left + 'px';
    newWindow.style.top = position.top + 'px';
    newWindow.style.background = '#ffffff';
    newWindow.style.position = 'absolute';
    newWindow.style.cursor = 'grab';
    newWindow.innerHTML = `
        <div class="win-blocks">
            <div class="win-name">${name}</div>
            <div class="win-btns">
                <div class="btn minimize"></div>
                <div class="btn big-smal"></div>
                <div class="btn close">${content}</div>
            </div>
        </div>
        <div class="content"></div>
    `;
    document.body.appendChild(newWindow);

    initWin('.draggable-window');
}

createWin();