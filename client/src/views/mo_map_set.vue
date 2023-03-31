<template lang="pug">
    .amap
        .cont
            .head
                .fl(@click="back")
                    .icon-angle-left
                .tit {{zb.address||'未知地点，请尝试点击地图获取地址'}}
                .fl.fr
                    .btn.xs.jv(@click='getMap()') 定位
                    .btn.xs(@click='back(zb)') 确定
            .maps
                .loading(:class="{active:loading}")
                el-amap-search-box.search-box(:search-option='searchOption', :on-search-result='onSearchResult')
                el-amap(ref='map', vid='amapDemo', :amap-manager='amapManager', :plugin="plugin", :center='center', :zoom='zoom', :events='events')
                    el-amap-marker(v-for='marker in markers', :position='marker')


</template>

<script>
    import { AMapManager } from 'vue-amap';

    export default {

        name: 'mapSet',
        components:{
            // AMapManager
        },
        model: {
        },
        props: ['lat','lng','address'],
        data () {
            let self = this
            return {
                loading:false,
                amapManager:new AMapManager(),
                zoom: 14,
                center: [self.lng, self.lat],
                markers: [],
                searchOption: {
                    city: '',
                    citylimit: true
                },
                zb: {
                    lat:self.lat,
                    lng:self.lng,
                    address:self.address
                },
                zb2: {
                    lat:self.lat,
                    lng:self.lng,
                    address:null
                },
                plugin: [{
                    pName: 'Geolocation',
                    events: {
                        init(o) {
                            // o 是高德地图定位插件实例
                            o.getCurrentPosition((status, result) => {
                                if (result && result.position) {
                                    self.zb2.lng = result.position.lng;
                                    self.zb2.lat = result.position.lat;
                                    // self.center = [self.lng, self.lat];
                                    // self.loaded = true;
                                    // self.$nextTick();
                                }
                            });
                        }
                    }
                }],
                events: {
                    click(e) {
                        let { lng, lat } = e.lnglat;
                        // self.lng = lng;
                        // self.lat = lat;

                        // 这里通过高德 SDK 完成。

                        self.getAddr(lng,lat)
                    },
                    init: (o) => {
                        // console.log(o.getCenter())
                        // console.log(self.$refs.map.$$getInstance())
                        // o.getCity(result => {
                        //     console.log(result)
                        // })
                    },
                    moveend: () => {
                        // console.log(self.$refs.map.$$getCenter())
                        // self.getAddr(self.$refs.map.$$getCenter());
                    }
                },


            }
        },
        mounted(){
        },
        computed: {
        },
        methods:{
            getMap() {
                this.zb.lng = this.zb2.lng;
                this.zb.lat = this.zb2.lat;
                this.zb.address='';
                this.center=[this.zb.lng,this.zb.lat]
                // console.log(this.$refs.map.$$getCenter())
            },
            getAddr(lng,lat){
                // console.log('开始获取地址',lng,lat)
                this.loading = true;
                this.zb.lat = lat;
                this.zb.lng = lng;

                /* eslint-disable */
                let geocoder = new AMap.Geocoder({
                    radius: 1000,
                    extensions: "all"
                });
                /* eslint-disable */

                geocoder.getAddress([lng ,lat], (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        // console.log(result)
                        if (result && result.regeocode) {
                            this.zb.address = result.regeocode.formattedAddress;
                            // console.log(result.regeocode.addressComponent)
                            this.$setStorage('zbx', result.regeocode.addressComponent)
                            this.$nextTick();
                        }
                    // }else {
                        // console.log('google')
                        // 还要申请key
                        // var site = "maps.google.com";
                        // // if(winLang=="zh-cn") site = "ditu.google.cn";
                        // //https://maps.google.com/maps/api/geocode/json?latlng=23,44&sensor=false
                        // this.$get("https://"+site+"/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=false",{}).then((data)=>{
                        //     if(data.status == 'OK' && data.results){
                        //         console.log(data)
                        //         // call(data.results[0].formatted_address.replace("Unnamed Road, ",''));
                        //     }
                        // }).catch(error => {
                        //
                        // })
                    }
                    this.loading = false;
                });
            },
            back(t) {
                if(t && t.lat && t.lng){
                    t.lat = t.lat.toFixed(3)
                    t.lng = t.lng.toFixed(3)
                }
                this.$setStorage('zb',t)
                this.$emit('closeMap',t)
            },
            addMarker: function() {
                let lng = 121.5 + Math.round(Math.random() * 1000) / 10000;
                let lat = 31.197646 + Math.round(Math.random() * 500) / 10000;
                this.markers.push([lng, lat]);
            },
            onSearchResult(pois) {
                let latSum = 0;
                let lngSum = 0;
                // console.log('搜索地点4444');
                if (pois.length > 0) {
                    pois.forEach(poi => {
                        let {lng, lat} = poi;
                        lngSum += lng;
                        latSum += lat;
                        this.markers.push([poi.lng, poi.lat]);
                    });
                    let center = {
                        lng: lngSum / pois.length,
                        lat: latSum / pois.length
                    };
                    // console.log('搜索地点');
                    this.zb.lat = center.lat;
                    this.zb.lng = center.lng;
                    this.center = [center.lng, center.lat];
                    this.getAddr(center.lng, center.lat);
                }
            }
        },
        watch: {
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
