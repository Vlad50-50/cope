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
        this.onCloseClick = this.onCloseClick.bind(this);
        this.onMaximaseClick = this.onMaximaseClick.bind(this);


        this.el.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        document.body.style.overflow = 'hidden';

        this.closeBtn = this.el.querySelector('.btn.close');
        this.closeBtn.addEventListener('click', this.onCloseClick);

        this.resisebtn = this.el.querySelector('.maximase');
        this.resisebtn.addEventListener('click', this.onMaximaseClick);
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

    onCloseClick(e) {
        e.preventDefault();
        this.destroy();
    }

    onMaximaseClick() {
        console.log("Maximase clicked");
        
        this.el.style.width = '100%';
        this.el.style.height = '100%';
        this.el.style.left = 0 + 'px';
        this.el.style.top = 0 + 'px';

        this.resisebtn.removeEventListener('click', this.onMaximaseClick);
        this.resisebtn.addEventListener('click', this.onMinimaseClick.bind(this));
    }

    onMinimaseClick() {
        console.log("Minimase clicked");
        
        this.el.style.width = 200 + 'px';
        this.el.style.height = 200 + 'px';
        this.el.style.left = (maxRight_pos - this.el.offsetWidth)/2 + 'px';
        this.el.style.top = ((maxBottom_pos - this.el.offsetHeight)/2)-60 + 'px';

        this.resisebtn.removeEventListener('click', this.onMaximaseClick);
        this.resisebtn.addEventListener('click', this.onMaximaseClick.bind(this));
    }

    destroy() {
        console.log('Destroying window:', this.el);
        
        this.el.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        this.closeBtn.removeEventListener('click', this.onCloseClick);
        this.el.parentNode.removeChild(this.el);
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
                <div class="btn maximase"></div>
                <div class="btn close">${content}</div>
            </div>
        </div>
        <div class="content"></div>
    `;
    document.body.appendChild(newWindow);

    initWin('.draggable-window');
}

createWin();