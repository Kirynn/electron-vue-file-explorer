<template>
    <section class="main-view">
        {{currentPath}}
        <ul>
            <li v-for="folder of systemObjects.folders" :key="folder.id" v-on:dblclick="readPath(folder.name)"><i class="fa fa-folder"></i>{{folder.name}}</li>
            <li v-for="file of systemObjects.files" :key="file.id" v-on:dblclick="openFile(file.name)"><i class="fa fa-file"></i>{{file.name}}</li>
        </ul>
    </section>
</template>

<script>
    
    import {mapState} from 'vuex'
    const fs = require('fs')

    export default {
        name: "main",
        data() {
            return {
                systemObjects: {
                    files: [],
                    folders: []
                },
                path: this.$store.state.filePath.currentPath
            }
        },
        computed:
        {
            currentPath() {

                let newPath = this.$store.state.filePath.currentPath

                this.readPath(newPath, true)
                return newPath
            }
        },
        methods: {

            readPath(path, overwrite = false) {

                let listOfFiles = []
                let listOfFolders = []

                let usePath;

                if (overwrite) {

                    usePath = path
                } 
                else {

                    this.$store.dispatch('updatePath', this.$store.state.filePath.currentPath + `${path}\\`)
                    usePath = this.$store.state.filePath.currentPath
                }

                // console.log(usePath)

                fs.readdir(usePath, (err, files) => {

                    if (err) throw(err)

                    let id = 1

                    for (let file of files) {

                        fs.stat(usePath + file, (err, stats) => {

                            if (err) throw(err)

                            if (stats.isDirectory()) listOfFolders.push({name: file, id: id})
                            else listOfFiles.push({name: file, id: id})
                        })

                        id++
                    }

                })
            
            
                this.systemObjects.files = listOfFiles
                this.systemObjects.folders = listOfFolders
            },

            openFile(file) {
            
                this.$electron.shell.openItem(file)

            }
        },
        mounted() {

            this.readPath('D:\\Dev\\Complex\\my-project\\', true)
        },
        watch: {

            // path: () => {
                
            //     console.log(this.path)
            //     this.readPath(this.path, true)
            // }
        }
    }
</script>

<style lang="scss">

    .main-view {

        ul {

            li {

                cursor: default;
            }
        }
    }

</style>


