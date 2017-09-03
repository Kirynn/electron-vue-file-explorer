<template>
    <div class="view-controller">
        <nav class="">
            <ul>
                
            </ul>
        </nav>
        <nav>

        </nav>
    </div>
</template>

<script>
    export default {
        name: 'view-controller'
    }
</script>

<style lang="scss">

    .view-controller {

        width: 100%;
        height: 5em;
        display: block;
        position: absolute;
        z-index: 10000;
        background: white;

        & + * {

            margin-top: 5em;
        }
    }
</style>



