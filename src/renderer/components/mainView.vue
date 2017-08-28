<template>
    <main>
        <modal></modal>
        <div class="table-container">
            <section class="flx-table">
                <div class="flx-table-row flx-table-header">
                    <div class="flx-table-row-item" data-type="name">Name</div>
                    <div class="flx-table-row-item">Type</div>
                    <div class="flx-table-row-item">Size</div>
                </div>
                <div class="flx-table-row" v-for="folder in systemObjects.folders" v-bind:key="folder.id">
                    <div class="flx-table-row-item" data-type="name">{{folder.name}}</div>
                    <div class="flx-table-row-item">{{folder.type}}</div>
                    <div class="flx-table-row-item"></div>
                </div>
                <div class="flx-table-row" v-for="file in systemObjects.files" v-bind:key="file.id">
                    <div class="flx-table-row-item" data-type="name">{{file.name}}</div>
                    <div class="flx-table-row-item">{{file.type}}</div>
                    <div class="flx-table-row-item">{{file.size}}</div>
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
        data() {

            return {

                lockedFile: ['System Volume Information', 'pagefile.sys']
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

                console.log(this.currentPath)

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

                            listOfFiles.push({

                                id: id,
                                name: fileData.name,
                                type: fileData.ext.substring(1),
                                size: Math.ceil(stats.size / 1000000) + 'mb'
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
        }
    }

</style>

