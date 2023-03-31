<template>
    <div class="dialog" v-if="showDialog">
        <transition name="dialog-fade">
            <div class="dialog-bg" v-if="showDialog" @click="confirmHide"></div>
        </transition>

        <transition name="dialog-show">
            <div class="dialog-box" v-if="showDialog">
                <div class="dialog-main" v-html="content"></div>
                <div class="dialog-button">
                    <div class="dialog-confirm-cancel" @click="clickCancel" v-if="!hideCancle">{{cancelText || '取消'}}</div>
                    <div class="dialog-confirm-button" @click="clickConfirm" v-if="!hideConfirm">{{okText || '好'}}</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    export default{
        data(){
            return{}
        },
        props: ['showDialog','content','okText','cancelText','hideConfirm','hideCancle'],
        methods: {
            clickCancel() {
                this.$emit('cancel');
            },
            clickConfirm() {
                this.$emit('confirm');
            },
            confirmHide(){
                this.$emit('confirmhide')
            }
        }
    }
</script>
