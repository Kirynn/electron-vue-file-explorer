<template>
    <main class="no-user-select">
        <modal></modal>
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
                     v-on:dblclick="folderOpen(folder.name)"
                     v-on:click.stop="select($event)"
                     data-selected=false>
                    <object v-bind:data="icons.folder" class="flx-table-row-item" data-type="icon"></object>
                    <div class="flx-table-row-item" data-type="name">{{folder.name}}</div>
                    <div class="flx-table-row-item">{{folder.type}}</div>
                    <div class="flx-table-row-item"></div>
                    <div class="flx-table-row-item"></div>
                </div>
                <div class="flx-table-row"
                     v-for="file in systemObjects.files"
                     v-bind:key="file.id"
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
                }
            }
        },
        computed: {

            ...mapState({

                currentPath: state => path.win32.normalize(state.filePath.currentPath),
                tryPath: state => path.win32.normalize(state.filePath.try, '.'),
                modalMsg: state => state.windowData.modalMsg,
                modalOpen: state => state.windowData.showModal
            }),

            systemObjects() {

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

                            sizeString = sizeString.split('').reverse().join('')
                            // if (sizeString.charAt(sizeString.length - 1) === ' ') sizeString = sizeString.substring(0, sizeString.length - 2)

                            sizeString += ' KB'

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
            }
        },
        methods: {

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

            }

        },
        watch: {

            tryPath: function() {

                if (fs.existsSync(this.tryPath)) this.$store.dispatch('sendTo', this.tryPath)
                else this.$electron.shell.beep()
                
            }

        },
        mounted() {
            
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

