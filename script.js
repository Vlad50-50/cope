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
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        let newLeft = e.clientX - this.offsetX;
        let newTop = e.clientY - this.offsetY;

        const viewportLeft = window.scrollX;
        const viewportTop = window.scrollY;
        const viewportRight = window.scrollX + window.innerWidth;
        const viewportBottom = window.scrollY + window.innerHeight;

        const elWidth = this.el.offsetWidth;
        const elHeight = this.el.offsetHeight;

        if (newLeft < viewportLeft) newLeft = viewportLeft;
        if (newLeft + elWidth > viewportRight) newLeft = viewportRight - elWidth;
        if (newTop < viewportTop) newTop = viewportTop;
        if (newTop + elHeight > viewportBottom) newTop = viewportBottom - elHeight;

        this.el.style.left = newLeft + 'px';
        this.el.style.top = newTop + 'px';
    }

    onMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.el.style.cursor = 'grab';
        console.log(`Координати вікна: left=${this.el.style.left}, top=${this.el.style.top}`);
    }

    destroy() {
        this.el.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
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

initWin('.draggable-window');
