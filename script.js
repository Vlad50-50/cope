const maxLeft_pos = window.scrollX;
const maxTop_pos = window.scrollY;
const maxRight_pos = window.scrollX + window.innerWidth;
const maxBottom_pos = window.scrollY + window.innerHeight;

const DEFAULT = {
    name: "Window name",
    position: {
        left: ((maxRight_pos - 200) / 2),
        top: ((maxBottom_pos - 100) / 2) - 60
    },
    size: {
        width: 300,
        height: 300
    },
    content: "",
    color: ""
}

const DB = () => {
    const dbName = "myOS";
    const storeName = "files";

    let database;

    const open = () => new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "path" });
            }
        };

        request.onsuccess = () => {
            database = request.result;
            resolve(database);
        };

        request.onerror = () => reject("DB open error");
    });

    const getStore = (mode = "readonly") => {
        const tx = database.transaction(storeName, mode);
        return tx.objectStore(storeName);
    };

    const save = async (file) => {
        await open();
        return new Promise((resolve, reject) => {
            const store = getStore("readwrite");
            const request = store.put(file);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject("Save error");
        });
    };

    const load = async (path) => {
        await open();
        return new Promise((resolve, reject) => {
            const store = getStore("readonly");
            const request = store.get(path);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Load error");
        });
    };

    const remove = async (path) => {
        await open();
        return new Promise((resolve, reject) => {
            const store = getStore("readwrite");
            const request = store.delete(path);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject("Delete error");
        });
    };

    const list = async () => {
        await open();
        return new Promise((resolve, reject) => {
            const store = getStore("readonly");
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("List error");
        });
    };

    const exists = async (path) => {
        await open();
        return new Promise((resolve, reject) => {
            const store = getStore("readonly");
            const request = store.getKey(path);
            request.onsuccess = () => resolve(request.result !== undefined);
            request.onerror = () => reject("Exists error");
        });
    };

    return { save, load, remove, list, exists };
};

const FILE_SYS = DB();

let zIndex_count = 100;
let massive_all_windows = [];

class DWindow {
    constructor(data_set) {
        this.data = data_set;

        if (this.data == undefined) {
            this.data = DEFAULT;
            console.warn("It is undefiened.");
        }

        this.data.name = this.data.name || DEFAULT.name;

        this.data.position = this.data.position || {};

        this.data.size = this.data.size || {};
        this.data.size.width = this.data.size.width || DEFAULT.size.width;
        this.data.size.height = this.data.size.height || DEFAULT.size.height;

        this.data.content = this.data.content || DEFAULT.content;
        this.data.color = this.data.color || DEFAULT.color;

        this.el = document.createElement('div');
        console.log(this.data);

        this.el.classList.add('draggable-window');
        this.el.style.width = this.data.size.width + 'px';
        this.el.style.height = this.data.size.height + 'px';

        this.el.style.background = this.data.color;

        this.el.innerHTML = `
            <div class="win-blocks">
                <div class="win-name">${this.data.name}</div>
                <div class="win-btns">
                    <div class="btn minimize"></div>
                    <div class="btn maximase"></div>
                    <div class="btn close"></div>
                </div>
            </div>
            <div class="content">${this.data.content}</div>
        `;

        this.windowHeader = this.el.querySelector('.win-blocks');

        zIndex_count++;
        this.el.style.zIndex = zIndex_count;
        console.log("Z-index:" + zIndex_count);

        this.el.classList.add("fade-on");
        document.body.appendChild(this.el);

        this.el.style.position = 'absolute';

        if (this.data.position.left == undefined || this.data.position.left < maxLeft_pos || this.data.position.left > maxRight_pos)
            this.el.style.left = DEFAULT.position.left + 'px';
        else this.el.style.left = this.data.position.left + 'px';

        if (this.data.position.top == undefined || this.data.position.top < maxTop_pos || this.data.position.top > maxBottom_pos)
            this.el.style.top = DEFAULT.position.top + 'px';
        else this.el.style.top = this.data.position.top + 'px';

        this.isDragging = false;
        this.isMaximased = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onCloseClick = this.onCloseClick.bind(this);
        this.onHideClick = this.onHideClick.bind(this);
        this.onMaximaseClick = this.onMaximaseClick.bind(this);
        this.onMinimizeClickBound = this.onMinimaseClick.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);

        this.windowHeader.addEventListener('mousedown', this.onMouseDown);
        this.el.addEventListener('mousedown', this.onMouseClick);

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        document.body.style.overflow = 'hidden';

        this.closeBtn = this.el.querySelector('.btn.close');
        this.closeBtn.addEventListener('click', this.onCloseClick);

        this.resisebtn = this.el.querySelector('.maximase');
        this.resisebtn.addEventListener('click', this.onMaximaseClick);

        this.minimize = this.el.querySelector('.minimize');
        this.minimize.addEventListener('click', this.onHideClick);

        massive_all_windows.push(this);
        this.win_index = massive_all_windows.indexOf(this);

        this.appList = document.querySelector('.programs');
        this.appIcon = document.createElement('div');
        this.appIcon.classList.add('icon');
    }

    onMouseDown(e) {
        if (this.isMaximased) return;
        this.isDragging = true;
        const rect = this.el.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        this.windowHeader.style.cursor = 'grabbing';
    }

    onMouseClick() {
        zIndex_count++;
        this.el.style.zIndex = zIndex_count;
        console.log("Z-index:" + zIndex_count);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        if (this.isMaximased) return;

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
        this.windowHeader.style.cursor = 'grab';

        const cs = getComputedStyle(this.el);
        this.data.position.left = parseInt(cs.left);
        this.data.position.top = parseInt(cs.top);

        console.log(`Коорди: left=${this.data.position.left}, top=${this.data.position.top}`);
    }

    onCloseClick() {
        this.destroy();
    }

    onMaximaseClick() {
        if (this.isMaximased) return;

        this.isMaximased = true;
        console.log("Maximase clicked");

        const cs = getComputedStyle(this.el);
        this.data.position.left = parseInt(cs.left);
        this.data.position.top = parseInt(cs.top);

        this.el.style.width = '100%';
        this.el.style.height = '100%';
        this.el.style.left = 0 + 'px';
        this.el.style.top = 0 + 'px';

        this.windowHeader.style.cursor = 'default';

        this.resisebtn.removeEventListener('click', this.onMaximaseClick);
        this.resisebtn.addEventListener('click', this.onMinimaseClick.bind(this));
    }

    onMinimaseClick() {
        this.isMaximased = false;
        console.log("Minimase clicked");

        this.el.style.width = this.data.size.width + 'px';
        this.el.style.height = this.data.size.height + 'px';
        this.el.style.left = this.data.position.left + 'px';
        this.el.style.top = this.data.position.top + 'px';

        this.windowHeader.style.cursor = 'grab';

        console.log(this.data.position.top);

        this.resisebtn.removeEventListener('click', this.onMaximaseClick);
        this.resisebtn.addEventListener('click', this.onMaximaseClick.bind(this));
    }

    onHideClick() {
        this.el.classList.remove("fade-on");
        this.el.classList.add("fade-out");
        this.appList.appendChild(this.appIcon);
        this.onShowClick = this.onShowClick.bind(this);
        this.appIcon.addEventListener('click', this.onShowClick);
    }

    onShowClick() {
        this.el.classList.remove("fade-out");
        this.el.classList.add("fade-on");
        this.el.style.display = '';
        this.appIcon.removeEventListener('click', this.onShowClick);
        this.appList.removeChild(this.appIcon);
    }

    destroy() {
        console.log('Destroying window:', this.el, this.win_index);

        this.el.classList.add("fade-out");

        setTimeout(() => {
            if (this.appIcon != undefined) this.appIcon.remove();

            this.el.removeEventListener('mousedown', this.onMouseDown);
            this.el.removeEventListener('mousedown', this.onMouseClick);

            this.minimize.removeEventListener('click', this.onHideClick);
            this.resisebtn.removeEventListener('click', this.onMaximaseClick);
            this.closeBtn.removeEventListener('click', this.onCloseClick);

            this.windowHeader.removeEventListener('mousedown', this.onMouseDown);

            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);

            this.closeBtn.removeEventListener('click', this.onCloseClick);

            this.el.parentNode.removeChild(this.el);

            if (this.win_index !== -1) massive_all_windows.splice(this.win_index, 1);
        }, 500);
    }
}

class ControlePanel {
    constructor(data_set) {
        this.data = data_set;
        if (this.data == undefined) this.data = {};

        this.el = document.createElement('div');
        this.el.classList.add('control_panel');
        this.el.innerHTML = `
            <div class="elements">
                <div class="icon user_acc"></div>
                <hr>
                <div class="programs"></div>
                <hr>
                <div class="icon more_programs"></div>
            </div>
            <div class="show_panel"></div>
        `;

        document.body.appendChild(this.el);

        this.el.style.position = 'absolute';
        this.el.style.transition = 'left 2s';
        this.el.style.left = 0;
        this.el.style.height = '320px';
        this.el.style.top = (maxBottom_pos / 2) - (this.el.offsetHeight / 2) + 'px';

        this.onHidePanel = this.onHidePanel.bind(this);
        this.onShowClick = this.onShowClick.bind(this);

        this.showpanel = this.el.querySelector('.show_panel');
        this.showpanel.classList.remove('show_panel');
        this.showpanel.addEventListener('click', this.onShowClick);

        this.isCursorOver = false;
        this.el.addEventListener('mouseover', this.setCursorOver.bind(this, true));
        this.el.addEventListener('mouseout', this.setCursorOver.bind(this, false));

        this.time = 4000;
    }

    setCursorOver(v) {
        this.isCursorOver = v;
        if (!v) {
            setTimeout(() => {
                this.onHidePanel();
            }, this.time);
        }
    }


    onHidePanel() {
        if (this.isCursorOver) return;
        this.newPos = this.el.offsetWidth - this.showpanel.offsetWidth;
        this.el.style.left = - this.newPos + 'px';
        this.showpanel.classList.add('show_panel');
    }

    onShowClick() {
        this.el.style.left = 0;
        this.showpanel.classList.remove('show_panel');

        if (!this.isCursorOver) {
            setTimeout(() => {
                this.onHidePanel()
            }, this.time);
        }
    }

    launchProgram(id) {
        const windowConfigs = [
            {
                name: "Notepad", content: `
                <div class="nav_note_bar">
                    <div class="note_bar_els create">Create</div>
                    <div class="note_bar_els open">Open</div>
                    <div class="note_bar_els save">Save</div>
                </div>
                <hr class="hr_note">
                <textarea name="note" id=""></textarea>`,
                color: "#fff"
            },
            { name: "Калькулятор", content: "<div>Здесь будет калькулятор</div>", color: "#e0f7fa" },
            { name: "Почта", content: "<div>Письма отсутствуют</div>", color: "#fce4ec" },
            { name: "Браузер", content: "<div>Введите URL...</div>", color: "#e8eaf6" },
            { name: "Проводник", content: "<div>Файлы</div>", color: "#f3e5f5" },
            { name: "Настройки", content: "<div>Параметры системы</div>", color: "#f0f4c3" }
        ];

        const config = windowConfigs[id] || { name: "Окно", content: "Пусто", color: "#ffffff" };

        new DWindow({
            name: config.name,
            content: config.content,
            color: config.color
        });
    }

}

class Notepad_program {
    constructor() {
        this.data = {
            name: "Notepad", content: `
                <div class="nav_note_bar">
                    <div class="note_bar_els create">Create</div>
                    <div class="note_bar_els open">Open</div>
                    <div class="note_bar_els save">Save</div>
                </div>
                <hr class="hr_note">
                <textarea name="note" id=""></textarea>`,
            color: "#fff"
        };

        this.window = new DWindow(this.data);
        this.controllbtns = {};

        this.controllbtns.create = this.window.el.querySelector('.create');
        this.controllbtns.open = this.window.el.querySelector('.open');
        this.controllbtns.save = this.window.el.querySelector('.save');

        this.onCreateFile = this.onCreateFile.bind(this);
        this.onOpenFile = this.onOpenFile.bind(this);
        this.onSaveFile = this.onSaveFile.bind(this);

        this.controllbtns.open.addEventListener('click', this.onOpenFile);
        this.controllbtns.save.addEventListener('click', this.onSaveFile);
        this.controllbtns.create.addEventListener('click', this.onCreateFile);
    }

    onCreateFile() {
        console.log("%cCreate file clicked", "color: green; font-weight: bold; font-size: 20px;");

    }

    onOpenFile() {
        console.log("%cOpen file clicked", "color: green; font-weight: bold; font-size: 20px;");

    }

    async onSaveFile() {
        console.log("%cSave file clicked", "color: green; font-weight: bold; font-size: 20px;");

        await FILE_SYS.save({
            path: "/Desktop/file.txt",
            type: "text",
            content: "Привет, мир!"
        });
    }
}

let panel = new ControlePanel();
let windowD = new DWindow();

panel.onHidePanel();