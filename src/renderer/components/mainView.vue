<template>
    <main class="no-user-select">
        <modal v-bind:message="modalMsg" v-if="modalOpen"></modal>
        <div class="table-container">
            <section class="flx-table">
                <div class="flx-table-row flx-table-header">
                    <object class="flx-table-row-item" data-type="icon" style="padding: 0 0.8em"></object>
                    <div class="flx-table-row-item" data-type="name">Name</div>
                    <div class="flx-table-row-item">Type</div>
                    <div class="flx-table-row-item" data-type="size">Size</div>
                    <div class="flx-table-row-item"></div>
                </div>
                <System-Entry
                v-for="folder in systemObjects.folders"
                v-bind:key="folder.id"
                v-bind:data-path="folder.name"
                v-bind:entryData="folder"
                v-on:dblclick.native="folderOpen(folder.name)"
                v-on:click.native.stop="select($event)"
                ></System-Entry>

                <SystemEntry
                v-for="file in systemObjects.files"
                v-bind:key="file.id"
                v-bind:entryData="file"
                v-on:dblclick.native="fileOpen(file.path)"
                v-on:click.native.stop="select($event)"></SystemEntry>
            </section>
        </div>
    </main>
</template>


<script>

    import {mapState} from 'vuex'
    import Modal from './subcomponents/modal'
    import SystemEntry from './MainView/file'

    const path = require('path')
    const fs = require('fs')

    export default {

        name: "mainVue",
        components: {Modal, SystemEntry},
        directives: {
        },
        data() {
            return {
                iconList: {
                    'File': 'static/icons/File-Main.svg',
                    'File Folder': 'static/icons/Folder-Main.svg'
                },
                lockedFile: [
                    '$RECYCLE.BIN',
                    '$Recycle.Bin',
                    'Crash',
                    'Documents and Settings',
                    'MSOCache',
                    'pagefile.sys',
                    'System Volume Information'],
                contextMenu: null,
                selectedEls: {
                    els: [],
                    getSelectedEls: function() {

                        if (this.els.length === 1) return this.els[0]
                        else return this.els
                    }
                }
            }
        },
        computed: {

            ...mapState({

                currentPath: state => path.win32.normalize(state.filePath.currentPath),
                tryPath: state => path.win32.normalize(state.filePath.try, '.'),
                modalMsg: state => state.windowData.modalMsg,
                modalOpen: state => state.windowData.showModal,
                currentEventStream: state => state.windowData.currentEventStream,
                objectList: state => state.windowData.objectList
            }),

            systemObjects() {

                let fileStruct = this.genFileStruct()

                fs.watch(this.currentPath, (eventType, filename) => {
                    
                    if (filename) this.$store.dispatch('reload')
                })

                this.$store.dispatch(`setObjectList`, fileStruct)

                this.container = fileStruct

                return fileStruct
            }
        },
        methods: {

            genFileStruct() {

                let listOfFiles = []
                let listOfFolders = []

                let files = fs.readdirSync(this.currentPath)
                let id = 1

                files.forEach((file) => {

                    if (this.lockedFile.indexOf(file) === -1) {

                        let curFile = path.join(this.currentPath, file)
                        let stats = fs.statSync(curFile)
                        let fileData = path.parse(curFile)

                        if (stats.isDirectory()) {

                            listOfFolders.push({

                                id: id,
                                name: fileData.name,
                                type: 'File Folder',
                                icon: this.iconList['File Folder']
                            })
                        }

                        else {
                            

                            let size = Math.round(stats.size / 1000)
                            let sizeString = ''

                            let sizeWorking = size.toString().split('').reverse().join('')

                            for (let i = 0, len = size.toString().length; i < len; i++) {

                                 if (i % 3 === 0 && i) sizeString += ','  + sizeWorking.charAt(i)
                                 else sizeString += sizeWorking.charAt(i)
                            }

                            sizeString = sizeString.split('').reverse().join('') + ' KB'

                            listOfFiles.push({

                                id: id,
                                name: fileData.name,
                                type: fileData.ext.substring(1),
                                path: fileData.name + fileData.ext,
                                size: sizeString,
                                icon: (fileData.ext.substring(1) in this.iconList) ? this.iconList[fileData.ext.substring(1)] : this.iconList['File']
                            })
                        }

                        id++
                    }
                })
                
                return {

                    files: listOfFiles,
                    folders: listOfFolders
                }

            },

            folderOpen(file) { 

                if (!this.currentEventStream.locked && this.$store.getters.selectedLength === 1) this.$store.dispatch('updatePath', this.currentPath + `${file}\\`)
            },

            fileOpen(file) {

                if (!this.currentEventStream.locked && this.$store.getters.selectedLength === 1) this.$electron.shell.openItem(path.join(this.currentPath, file))
            },

            select(event) {

                if (!this.currentEventStream.locked) {

                    let el = event.target

                    while (!el.classList.contains('flx-table-row')) el = el.parentNode

                    if (!event.ctrlKey) {

                        let els = document.querySelectorAll("[data-selected='true']")
                        
                        this.selectedEls.els = []

                        els.forEach((el) => {

                            el.setAttribute('data-selected', false)
                            el.classList.remove('selected')
                        })
                    }

                    el.setAttribute('data-selected', true)
                    el.classList.add('selected')
                
                    this.selectedEls.els.push(el)

                    let els = document.querySelectorAll("[data-selected='true']")

                    if (els.length >= 1) this.contextMenu.items[1].visible = true   //Delete Option
                    if (els.length === 1) this.contextMenu.items[2].visible = true  //Rename option
                }
            },

            rename(selectedEl, callback) {

                // Send an event to the element using its [data-path] attribute
                this.$events.emit(selectedEl.getAttribute("data-path"), 'reaname')
                this.$events.on('rename', (response) => {
                    
                    return callback(response)
                })
            }
        },
        watch: {

            tryPath: function() {

                if (fs.existsSync(this.tryPath)) this.$store.dispatch('sendTo', this.tryPath)
                else this.$electron.shell.beep()
            }

        },
        mounted() {

            let Vue = this

            const {Menu, MenuItem} = this.$electron.remote

            Vue.contextMenu = new Menu()

            Vue.contextMenu.append(new MenuItem({

                label: 'New Folder',
                click() {
                    
                    let name = 'New Folder'
                    let i = 1

                    while(fs.existsSync(path.join(Vue.currentPath, name))) {

                        name = `New Folder (${i})`
                        i++
                    }

                    fs.mkdir(`${path.join(Vue.currentPath, name)}`, () => {return false})
                }
            }))

            Vue.contextMenu.append(new MenuItem({

                label: 'Delete',
                visible: false,
                click() {

                    let selected = document.querySelectorAll("[data-selected='true']")
                    Vue.$store.dispatch('setModalMsg', `Are you sure you want to delete these (${selected.length}) file(s)?`)
                    Vue.$store.dispatch('toggleModal', 'main')
                    Vue.$events.on('modal-response', (response) => {

                        if (response) {
                            
                            selected.forEach((selectedFile) => {

                                selectedFile.classList.remove('selected')
                                Vue.contextMenu.items[1].visible = false
                                Vue.$electron.shell.moveItemToTrash(path.join(Vue.currentPath, selectedFile.getAttribute("data-path")))
                            })
                        }
                    })
                }
            }))
            
            Vue.contextMenu.append(new MenuItem ({

                label: 'Rename',
                visible: false,
                click() {
                    
                    let currentPath = Vue.currentPath
                    let oldPath = path.join(currentPath, Vue.selectedEls.getSelectedEls().getAttribute('data-path'))

                    Vue.rename(Vue.selectedEls.getSelectedEls(), (newName) => {
                        
                        let check = true
                        
                        if (newName === null) {
                            
                            check = false
                        }

                        else {
                            
                            for (let obj in Vue.container) {

                                for (let entity in Vue.container[obj]) {

                                    if (Vue.container[obj][entity].name === newName) {

                                        Vue.$store.dispatch('setModalMsg', 'A file with this name already exists')
                                        Vue.$store.dispatch('toggleModal')

                                        check = false
                                    }
                                }
                            }
                        }
                        if (check) fs.renameSync(oldPath, path.join(currentPath, newName))
                    })

                    Vue.contextMenu.items[2].visible = false
                }
            }))
    
            window.addEventListener('contextmenu', (event) => {

                if (!this.currentEventStream.locked) {

                    event.preventDefault()
                    Vue.contextMenu.popup(this.$electron.remote.getCurrentWindow())
                }
            }, false)
        }
    }
</script>

<style lang="scss">

    main {

        height: auto;
        width: 100%;
        overflow-y: scroll;

        .table-container {

            height: 100%;
            height: 100%;
            padding: 1.25em;

            .flx-table-row {

                cursor: default;

                object {

                    width: 1em;
                    height: 1em;
                    margin-right: 0.5em;
                }

                .flx-table-row-item {

                    &[data-type="name"] {

                        flex-grow: 3;
                    }

                    &[data-type="size"] {
                        
                        justify-content: flex-end;
                        flex-shrink: 1;
                    }

                    &[data-type="icon"] {

                        flex-grow: 0;
                    }
                }

                &:not(.flx-table-header) {

                    padding: 0.5em;

                    &:hover {
                        
                        background: lightblue;
                    }
                }
            }
        }
    }

    .selected {

        background: lightblue;
    }

</style>

