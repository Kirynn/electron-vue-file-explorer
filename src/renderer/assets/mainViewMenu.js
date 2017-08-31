
const {remote} = require('electron')
const {Menu, MenuItem} = remote

const fs = require('fs')

const mainViewMenu = {
    menu: new Menu(),
    listener: listener,
    click() {

        let name = 'New Folder'
        let i = 1

        while(fs.existsSync(name)) {

            name = `New Folder (${i})`
            i++
        }

        fs.mkdir(`./${name}`, Vue.readPath(Vue.currentPath, true))
    }
}

mainViewMenu.menu.append(new MenuItem({
    label: 'New Folder'
}))

const listener = window.addEventListener('contextmenu', (event) => {
    
                    event.preventDefault()
                    console.log(remote)
                    mainViewMenu.menu.popup(remote.getCurrentWindow())
                })

export default mainViewMenu