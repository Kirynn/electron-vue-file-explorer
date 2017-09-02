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
                <div class="flx-table-row"
                     v-for="folder in systemObjects.folders"
                     v-bind:key="folder.id"
                     v-bind:data-path="folder.name"
                     v-on:dblclick="folderOpen(folder.name)"
                     v-on:click.stop="select($event)"
                     data-selected=false
                     >
                    <object v-bind:data="icons.folder" class="flx-table-row-item" data-type="icon"></object>
                    <div class="flx-table-row-item" data-type="name">{{folder.name}}</div>
                    <div class="flx-table-row-item">{{folder.type}}</div>
                    <div class="flx-table-row-item"></div>
                    <div class="flx-table-row-item"></div>
                </div>
                <div class="flx-table-row"
                     v-for="file in systemObjects.files"
                     v-bind:key="file.id"
                     v-bind:data-path="file.name"
                     v-on:dblclick="fileOpen(file.path)"
                     v-on:click.stop="select($event)"
                     data-selected=false>
                    <object v-bind:data="icons.file" class="flx-table-row-item" data-type="icon"></object>
                    <div class="flx-table-row-item" data-type="name">{{file.name}}</div>
                    <div class="flx-table-row-item">{{file.type}}</div>
                    <div class="flx-table-row-item" data-type="size">{{file.size}}</div>
                    <div class="flx-table-row-item"></div>
                </div>
            </section>
        </div>
    </main>
</template>


<script>

    import {mapState} from 'vuex'
    import Modal from './subcomponents/modal'

    const path = require('path')
    const fs = require('fs')

    export default {

        name: "mainVue",
        components: {Modal},
        directives: {
        },
        data() {

            return {

                lockedFile: ['System Volume Information', 'pagefile.sys', '$RECYCLE.BIN'],
                icons: {
                    folder: 'static/icons/Folder-Main.svg',
                    file: 'static/icons/File-Main.svg'
                },
                contextMenu: null
            }
        },
        computed: {

            ...mapState({

                currentPath: state => path.win32.normalize(state.filePath.currentPath),
                tryPath: state => path.win32.normalize(state.filePath.try, '.'),
                modalMsg: state => state.windowData.modalMsg,
                modalOpen: state => state.windowData.showModal,
                currentEventStream: state => state.windowData.currentEventStream
            }),

            systemObjects() {

                let fileStruct = this.genFileStruct()

                fs.watch(this.currentPath, (eventType, filename) => {
                    
                    if (filename) this.$store.dispatch('reload')
                })

                return {

                    files: fileStruct.files,
                    folders: fileStruct.folders
                }
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
                                type: 'File Folder'
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
                                size: sizeString
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
                
                this.$store.dispatch('updatePath', this.currentPath + `${file}\\`)
            },

            fileOpen(file) {

                this.$electron.shell.openItem(path.join(this.currentPath, file))
            },

            select(event) {

                let el = event.target

                if (!el.classList.contains('flx-table-row')) el = el.parentNode

                if (!event.ctrlKey) {

                    let els = document.querySelectorAll("[data-selected='true']")
                    
                    els.forEach((el) => {

                        el.setAttribute('data-selected', false)
                        el.classList.remove('selected')
                    })
                }

                el.setAttribute('data-selected', true)
                el.classList.add('selected')

                let els = document.querySelectorAll("[data-selected='true']")

                if (els.length >= 1) this.contextMenu.items[1].visible = true
                if (els.length === 1) this.contextMenu.items[2].visible = true

            }

        },
        watch: {

            tryPath: function() {

                if (fs.existsSync(this.tryPath)) this.$store.dispatch('sendTo', this.tryPath)
                else this.$electron.shell.beep()
                
            }

        },
        mounted() {

            this.$store.dispatch('setModalMsg', `Test Text`)
            this.$store.dispatch('toggleModal')

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

                    let selected = document.querySelectorAll("[data-selected='true']")

                    let currentPath = Vue.currentPath
                    let oldPath = path.join(currentPath, selected[0].getAttribute('data-path'))
                    let newPath = path.join(currentPath, 'renamed')

                    fs.renameSync(oldPath, newPath)

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

