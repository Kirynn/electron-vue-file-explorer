<template>
    <div class="flx-table-row system-entry"
    ref="entryData.name"
    data-selected=false>
        <object class="flx-table-row-item" v-bind:data="entryData.icon" data-type="icon"></object>
        <div class="flx-table-row-item" data-type="name">
            <input v-if="rename" v-bind:placeholder="entryData.name"></span>                        
            <span v-if="!rename">{{entryData.name}}</span>
        </div>
        <div class="flx-table-row-item">{{entryData.type}}</div>
        <div class="flx-table-row-item" data-type="size">{{entryData.size}}</div>
        <div class="flx-table-row-item"></div>
    </div>
</template>

<script>
export default {
    name: "file",
    props: ['entryData'],
    data() {
        return {
            rename: false
        }
    },
    computed: {

        el() {

            return document.querySelectorAll(`data-path="${this.entryData.name}"`)[0]
        }
    },
    mounted() {

        this.$events.on(this.entryData.name.toString(), () => {

            window.addEventListener('click', (event) => {

                event.stopPropagation
                event.preventDefault
            })
            this.rename = true

            console.log(document.querySelectorAll(`data-path="${this.entryData.name}"`)[0])
        })

    },
    watch: {
    }
}
</script>

<style lang="scss">

    .flx-table-row-item{
        
        &[data-type="name"] > * {

            width: 90%;
            display: block;
        }
    }
</style>


