<template>
    <table v-if="treeData.name">
        <tr>
            <td :colspan="Array.isArray(treeData.children) ? treeData.children.length * 2 : 1"
                :class="{parentLevel: Array.isArray(treeData.children) && treeData.children.length, extend: Array.isArray(treeData.children) && treeData.children.length && treeData.extend}"
            >
                <div :class="{node: true, hasMate: treeData.mate}">
                    <div class="people_x">
                        <div class="tips">
                            <b class="more" v-if="treeData.id" @click="$open(1, treeData.id)">查看</b>
                            <div class="namex">{{treeData.name}}</div>
                            <div class="li">{{sexArr[treeData.sex || 0]}}，{{treeData.clan || '_'}}族</div>
                            <div class="li">生于：{{$dayjs(parseInt(treeData.birthAt)).format('YYYY-MM-DD')}}</div>
                            <div class="li" v-if="treeData.deathAt">殁于：{{$dayjs(parseInt(treeData.deathAt)).format('YYYY-MM-DD')}}</div>
                        </div>
                        <div class="name"
                             :class="{root:treeData.root, sex0:treeData.sex === 0, inset: treeSet && treeSet.id && treeSet.id === treeData.id, link: treeSet && treeSet.id && treeSet.id === treeData.id && treeSet.type != treeData.type, godson: treeData.godson}"
                             @click="$emit('click-node', treeData); $emit('click-mate', false);"
                        >
                            {{treeData.name}}
                        </div>
                    </div>
                    <template v-if="Array.isArray(treeData.mate) && treeData.mate.length">
                        <div class="people_x" v-for="(mate, mateIndex) in treeData.mate" :key="treeData.name+mateIndex"
                        >
                            <div class="tips">
                                <b class="more" v-if="mate.id" @click="$open(1, mate.id)">查看</b>
                                <div class="namex">{{mate.name}}</div>
                                <div class="li">{{sexArr[mate.sex || 0]}}，{{mate.clan || '_'}}族</div>
                                <div class="li">生于：{{$dayjs(parseInt(mate.birthAt)).format('YYYY-MM-DD')}}</div>
                                <div class="li" v-if="mate.deathAt">殁于：{{$dayjs(parseInt(mate.deathAt)).format('YYYY-MM-DD')}}</div>
                            </div>
                            <div class="name mate"
                                 :class="{sex0:mate.sex === 0, inset: treeSet && treeSet.id && treeSet.id === mate.id}"
                                 @click="$emit('click-node', mate); $emit('click-mate', true);">{{mate.name}}</div>
                        </div>
                    </template>
                </div>
                <div class="extend_handle" v-if="Array.isArray(treeData.children) && treeData.children.length" @click="toggleExtend(treeData)"></div>
            </td>
        </tr>
        <tr v-if="Array.isArray(treeData.children) && treeData.children.length && treeData.extend">
            <td v-for="(children, index) in treeData.children" :key="index" colspan="2" class="childLevel">
                <TreeChart :json="children" :treeSet="treeSet" @click-node="$emit('click-node', $event)" @click-mate="$emit('click-mate', $event)"/>
            </td>
        </tr>
    </table>
</template>

<script>
import CONT from "../utils/const";

export default {
    name: "TreeChart",
    props: ["json", "treeSet"],
    data() {
        return {
            sexArr: CONT.sexArr,
            treeData: {}
        }
    },
    watch: {
        json: {
            handler: function(Props){
                let extendKey = function(jsonData){
                    jsonData.extend = (jsonData.extend===void 0 ? true: !!jsonData.extend);
                    if(Array.isArray(jsonData.children)){
                        jsonData.children.forEach(c => {
                            extendKey(c)
                        })
                    }
                    return jsonData;
                }
                if(Props){
                    this.treeData = extendKey(Props);
                }
            },
            immediate: true
        }
    },
    methods: {
        toggleExtend: function(treeData){
            treeData.extend = !treeData.extend;
            this.$forceUpdate();
        }
    }
}
</script>

<style scoped>

</style>