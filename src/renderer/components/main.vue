<template>
    <section class="main-view">
        <modal v-bind:message="modalMsg"></modal>
        <ul class="directory-header">
            <li class="header-name">Name</li>
            <li class="header-type">Type</li>
        </ul>
        <ul class="directory">
            <li class="fileSystemEntry folder" v-for="folder of systemObjects.folders" :key="folder.id" v-on:click="highlight($event)" v-on:dblclick="readPath(folder.name)" v-bind:data="folder.name">
                <ul>
                    <li><object v-bind:data="icons.folder"></object></li>
                    <li class="fileSystemEntry-name">{{folder.name}}</li>
                    <li class="fileSystemEntry-type">{{folder.ext}}</li>
                </ul>
            </li>
            <li class="fileSystemEntry file" v-for="file of systemObjects.files" :key="file.id" v-on:click="highlight($event)" v-on:dblclick="openFile(file.name)" v-bind:data="file.name">
                <ul>
                    <li><object v-bind:data="icons.file"></object></li>
                    <li class="fileSystemEntry-name">{{file.name}}</li>
                    <li class="fileSystemEntry-type">{{file.ext}}</li>
                </ul>
            </li>
        </ul>
        <div class="fill"></div>
    </section>
</template>

<script>
    
    import {mapState} from 'vuex'
    import Modal from './subcomponents/modal'
    
    const fs = require('fs')
    const nodePath = require('path')

    export default {
        name: "main",
        components: {Modal},
        data() {
            return {
                systemObjects: {
                    files: [],
                    folders: []
                },
                watch: null,
                icons: {
                    folder: 'static/icons/Folder-Main.svg',
                    file: 'static/icons/File-Main.svg'
                }
            }
        },
        computed:
        {
            ...mapState({

                path: state => state.filePath.currentPath,
                tryPath: state => state.filePath.try,
                modalMsg: state => state.windowData.modalMsg,
                modalOpen: state => state.windowData.showModal
            }),

            currentPath() {

                return this.path
            }
        },
        methods: {

            generateFileStruct(path) {

                let listOfFiles = []
                let listOfFolders = []

                fs.readdir(path, (err, files) => {

                    if (err) throw(err)

                    let id = 1

                    for (let file of files) {

                        fs.stat(path + file, (err, stats) => {

                            if (err) throw(err)

                            let size = `${stats.size}bytes`

                            if (stats.isDirectory()) {
                                
                                listOfFolders.push({name: file, id: id, ext: 'File Folder', size: size})
                            }
                            else {
                                
                                let fileData = nodePath.parse(file)
                                listOfFiles.push({name: file, id: id, ext: fileData.ext.substring(1) + 'File', size: size})
                            }
                        })

                        id++
                    }
                })

                return {

                    files: listOfFiles,
                    folders: listOfFolders
                }
            },

            readPath(path, overwrite = false) {

                let usePath;

                if (overwrite) {

                    usePath = path
                } 
                else {

                    this.$store.dispatch('updatePath', this.path + `${path}\\`)
                    usePath = this.path
                }

                let fileStruct = this.generateFileStruct(usePath)

                this.watch = fs.watch(usePath, (eventType, filename) => {
                    
                    if (filename) {
                        
                        console.log(filename, eventType)
                        fileStruct = this.generateFileStruct(usePath)
                        this.systemObjects.files = fileStruct.files
                        this.systemObjects.folders = fileStruct.folders
                    }
                })

                this.systemObjects.files = fileStruct.files
                this.systemObjects.folders = fileStruct.folders
            },

            openFile(file) {
                
                let x = nodePath.join(this.currentPath, file)
                console.log(x)
                this.$electron.shell.openItem(x)

            },
            
            checkTryPath() {

                if (fs.existsSync(this.tryPath)) {
                
                    this.$store.dispatch('sendTo', this.tryPath)
                }

                else {

                    this.$store.dispatch('setModalMsg', 'test')
                    this.$store.dispatch('toggleModal', 'main')
                    this.$electron.shell.beep()
                }
            },

            highlight(event) {
                
                let remove = document.getElementById('highlight')
                if (remove) remove.removeAttribute('id')

                event.target.id ='highlight'
            }
        },
        mounted() {

            let Vue = this
            
            //this.$store.commit('SET', 'D:\\Dev\\Complex\\my-project\\')
            
            'Dev\\Complex\\my-project'.split(nodePath.sep).forEach((path) => {
                this.readPath(path + '\\')
            })
            

            const {Menu, MenuItem} = this.$electron.remote
            const mainViewContextMenu = new Menu()
            
            mainViewContextMenu.append(new MenuItem({
                label: 'New Folder',
                click() {

                    let name = 'New Folder'
                    let i = 1

                    while(fs.existsSync(name)) {

                        name = `New Folder (${i})`
                        i++
                    }

                    fs.mkdir(`./${name}`, Vue.readPath(Vue.currentPath, true))
                }
            }))

            mainViewContextMenu.append(new MenuItem({

                label: 'Delete',
                enabled: false,
                click() {

                    let selected = document.getElementById('highlight')

                        if (selected) {

                            let path = nodePath.join(Vue.currentPath, selected.getAttribute('data'))

                            this.$store.dispatch('setModalMsg', 'Are you sure you want to delete this file?')
                            this.$store.dispatch('toggleModal', 'main')
                            this.$events.on('modal-response', (eventData) => {

                                if (eventData) {

                                    this.$electron.shell.moveItemToTrash(path)
                                }
                            })
                        }

                }
            }))

            window.addEventListener('contextmenu', (event) => {
                event.preventDefault()
                mainViewContextMenu.popup(this.$electron.remote.getCurrentWindow())
            }, false)

            if (!this.modalOpen) {

                window.onkeyup = (event) => {

                    if (event.key === 'Enter') {

                        let selected = document.getElementById('highlight')

                        if (selected) {

                            if (selected.classList.contains('file')) this.openFile(selected.getAttribute('data'))
                            else if (selected.classList.contains('folder')) this.readPath(selected.getAttribute('data'))
                        }
                    }

                    else if (event.key === 'Delete') {
                        
                        let selected = document.getElementById('highlight')

                        if (selected) {

                            let path = nodePath.join(Vue.currentPath, selected.getAttribute('data'))

                            this.$store.dispatch('setModalMsg', 'Are you sure you want to delete this file?')
                            this.$store.dispatch('toggleModal', 'main')
                            this.$events.on('modal-response', (eventData) => {

                                if (eventData) {

                                    this.$electron.shell.moveItemToTrash(path)
                                }
                            })
                        }
                    }
                }

                window.onkeydown = (event) => {

                    if (event.key === 'ArrowUp') {

                        let selected = document.getElementById('highlight')
                        
                        if (selected && selected.previousElementSibling) {

                            selected.removeAttribute('id')
                            selected.previousElementSibling.id = 'highlight'
                        }
                    }

                    else if (event.key === 'ArrowDown') {

                        let selected = document.getElementById('highlight')

                        if (selected && selected.nextElementSibling) {

                            selected.removeAttribute('id')
                            selected.nextElementSibling.id = 'highlight'
                        }
                    }
                }
            }
        },
        watch: {

            currentPath: function () {
                
                this.readPath(this.currentPath, true)
            },

            tryPath: function() {

                this.checkTryPath()
            }
        }
    }
</script>

<style lang="scss">

    .main-view {

        width: 100%;
        height: 100%;
        position: absolute;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;

        ul {

            width: 100%;
            display: flex;

            li {

                font-size: 16px;
                -webkit-user-select: none;
            }
        }

        .directory-header {

            height: auto;

            li {

                font-style: italic;

                &:first-child {

                    margin-left: 2.3em;
                }

                &.header-name {
                    
                    flex-grow: 1;
                    
                }

                &.header-type {

                    margin-right: 1.5em;
                }
            }
        }

        .directory {

            height: 100%;
            flex-direction: column;
            padding-bottom: 5em;
            overflow-y: scroll;

            .fileSystemEntry {

                cursor: default;
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 1.75em 0.25em;

                ul {

                    display: flex;
                    flex-direction: row;

                    .fileSystemEntry-name {

                        flex-grow: 1;
                    }
                }

                i {

                    margin-right: 0.5rem;
                }
                
                object {

                    width: 1.5em;
                    height: 1.5em;
                    margin-right: 0.25rem;
                }

                &:hover {

                    background: lightblue;
                }
            }
        }

        .fill {

            flex: 1 1 auto;
        }
    }

    #highlight {

        background: lightblue;

    }

</style>


