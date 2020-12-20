export default class Slide{
    constructor(main = '#application'){
        this.main = document.querySelector(main);
        if(!this.main){
            this.main = document.createElement('main');
            this.main.id = 'application';
        }
        this.listen = {};
        this.queue = [];
        this.changeVariable = (name, value) => this.main.querySelectorAll('*[data-listener-var="' + name + '"]').forEach(i => i.innerHTML = value);
    }
    setGlobal(name, value){
        this.changeVariable(name, value);
        this.queue.push(() => this.changeVariable(name, value));
        this.listen[name] = value;
    }
    render(block){
        this.main.innerHTML = block;
        Object.keys(this.listen).forEach(key => [...this.main.querySelectorAll('*')].filter(i => i.innerHTML.includes(`{${key}}`)).forEach(i => {
            i.setAttribute('data-listener-var', key);
            i.innerHTML = i.innerHTML.replaceAll(`{${key}}`, this.listener[key])
        }));
        this.queue.forEach(i);
    }
}
