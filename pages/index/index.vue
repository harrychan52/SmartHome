<template>
	<view class="container">
		<!-- <pop ref="pop"></pop> -->
		<h2>智能家居</h2>
		<image src="../../static/homePic.jpg" mode="widthFix"></image>
		<view class="switch" >
			<view class="switchBtn" v-for="(item, index) in list" :key="index"
			@click="inputFocus(index)">
				<view :class="item.icon"></view>
				<button type="default" @click.stop="changeState(index)">{{item.name}}</button>
				<text>{{item.state}}</text>
			</view>
			<view class="switchWatch" >
				<view class="watcher" v-for="(item, index) in list2" :key="index">
					<view :class="item.icon"></view>
					<view class="info">{{item.info}}</view>
					<button type="default">{{item.name}}</button>
					<text>{{item.location}}</text>
				</view>
			</view>
		</view>
		<view v-for="(item, index) in list" :key="index">
			<view class="cover" v-if="item.click" @click="inputBlur(index)"></view>
		</view>
		<!-- 滑块 -->
		<slider v-if="sliderT" block-color="#007AFF"
		activeColor="#007AFF" show-value="true" />
		<view v-if="sliderK" class="sliderK">
			<slider  min="16" max="30" step="1" block-color="#007AFF"
			activeColor="#007AFF" show-value="true" @change="sliderChange"/>
		</view>
	</view>
</template>

<script>
	import mqtt from'../../utils/mqtt.js';
	const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js');
	export default {
		data() {
			const list = [{
				name: "台灯",
				symbol: "LightSwitch",
				icon: "iconfont icon-taideng",
				state: "关",
				open: false,
				click: false
			},
			{
				name: "空调",
				symbol: "KTkey",
				icon: "iconfont icon-airCondition",
				state: "关",
				open: false,
				click: false
			},
			{
				name: "窗帘",
				icon: "iconfont icon-deng",
				state: "关",
				open: false,
				click: false
			},
			{
				name: "智能灯",
				icon: "iconfont icon-deng",
				state: "关",
				open: false,
				click: false
			}];
			const list2 = [{
				name: "温度",
				info: Number,
				icon: "iconfont icon-wendu",
				location: "客厅"
			},
			{
				name: "湿度",
				info: Number,
				icon: "iconfont icon-humidity",
				location: "客厅"
			},
			{
				name: "PM2.5",
				icon: "iconfont icon-app_icons--",
				location: "客厅"
			}
			];
			var options = {
				protocolVersion: 4, //MQTT连接协议版本
				clean: false,
				reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
				connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
				resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
				clientId: '',
				password: '',
				username: '',
			  };
			  var aliyunInfo = {
				productKey: 'a1786pIjqSZ', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
				deviceName: 'WechatP', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
				deviceSecret: 'b0dd037d0de6429a990235a5aaa8f792', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
				regionId: 'cn-shanghai', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
				pubTopic: '/sys/a1786pIjqSZ/WechatP/thing/service/property/post', //发布消息的主题
				subTopic: '/sys/a1786pIjqSZ/WechatP/thing/service/property/set', //订阅消息的主题
			  };
			return {
				list: list,
				list2: list2,
				sliderT:false,
				sliderK:false,
				client:null,
				receiveMessage: '',
				reconnectCounts:0,
				options: options,
				aliyunInfo: aliyunInfo
			}
		},
		mounted() {
			let clientOpt = aliyunOpt.getAliyunIotMqttClient({
			  productKey: this.aliyunInfo.productKey,
			  deviceName: this.aliyunInfo.deviceName,
			  deviceSecret: this.aliyunInfo.deviceSecret,
			  regionId: this.aliyunInfo.regionId,
			  port: this.aliyunInfo.port,
			});
			// console.log(clientOpt);
			// console.log("get data:" + JSON.stringify(clientOpt));
			let host = 'wxs://' + clientOpt.host;
			// console.log("get data:" + JSON.stringify(clientOpt));
			this.options.clientId = clientOpt.clientId;
			this.options.password = clientOpt.password;
			this.options.username = clientOpt.username;
			// console.log("this.options host:" + host);
			// console.log("this.options data:" + JSON.stringify(this.options));
		
			this.client = mqtt.connect(host, this.options);
			this.client.on('connect', () => {
			  wx.showToast({
			          title: '连接成功'
			        })
			  console.log('连接成功')
			  this.client.subscribe(this.aliyunInfo.subTopic, error => {
				  if (error){
					  console.log(error)
				  }
			  })
			});
			this.client.on('message', (topic, message) => {
				console.log('收到来自' + topic + '的消息' + message.toString());
				this.list2[0].info = JSON.parse(message).items.temperature.value
				this.list2[1].info = JSON.parse(message).items.humidity.value
				console.log(this.receiveMessage)
			});
			this.client.on('reconnect', error => {
				uni.hideLoading();
				wx.showToast({
				        title: '正在重连'
				      })
			
			});
			this.client.on('error', error => {
				uni.hideLoading();
				wx.showToast({
				        title: '连接失败'
				      })
			});
			//服务器连接异常的回调
			this.client.on("offline",  error => {
			  console.log(" 服务器offline的回调")
			})
		},
		methods: {
			changeState(e) {
				if(this.list[e].open == false) {
					this.list[e].state = "开";
					this.list[e].open = true
					this.sendCommond('set', 1, this.list[e].symbol)
				}else {
					this.list[e].state = "关";
					this.list[e].open = false
					this.sendCommond('set', 0, this.list[e].symbol)
				}
			},
			inputFocus(e) {
				if(e===0){
					this.sliderT = true;
				}else if(e===1){
					this.sliderK = true;
				}
				this.list[e].click = true
			},
			inputBlur(e) {
				if(e===0){
					this.sliderT = false;
				}else if(e===1){
					this.sliderK = false;
				}
				this.list[e].click = false
			},
			sliderChange(e) {
				this.value1 = e.detail.value
			},
			sendCommond(cmd, data, symbol) {
				let sendData = {
					cmd: cmd,
					data: data,
					symbol: symbol
				}
				if(this.client && this.client.connected) {
					this.client.publish(this.aliyunInfo.pubTopic, JSON.stringify(sendData))
				}else {
					wx.showToast({
						title: '请先连接服务器',
						icon: 'none',
						duration: 2000
					})
				}
			}
		}
	}
</script>

<style>
	@import url("../../static/iconfont/iconfont.css");
	.container {
		position: relative;
		padding: 42rpx;
		font-size: 14px;
		line-height: 24px;
	}
	.container>h2 {
		position: absolute;
		top: 2rpx;
	}
	.container>image {
		top: 40rpx;
		width: 100%;
		height: 100%;
	}
	.container>.switch{
		position: absolute;
		top: 420rpx;
		width: 700rpx;
		height: 800rpx;
	}
	.switchBtn{
		float: left;
		position: relative;
		margin: 20rpx 28rpx 0 0;
		width: 200rpx;
		height: 290rpx;
		border: #3B4144 solid 1px;
		border-radius: 20rpx;
	}
	.switchBtn .iconfont{
		position: absolute;
		left: 50%;
		top: 14%;
		margin-left: -40rpx;
		font-size: 70rpx;
	}
	button{
		background: transparent;
		font-size: 16rpx;
		top: 60%;
		width: 100%;
		height: 30%;
	}
	button::after{ border: none; }
	.switchWatch {
		float: left;
		position: relative;
		margin: 20rpx 28rpx 0 0;
		width: 430rpx;
		height: 290rpx;
		border: #3B4144 solid 1px;
		border-radius: 20rpx;
	}
	.watcher{
		position: relative;
		width: 33%;
		height: 290rpx;
		float: left;
	}
	.watcher .iconfont{
		position: absolute;
		left: 50%;
		top: 40%;
		margin-left: -28rpx;
		font-size: 50rpx;
	}
	.watcher .info{
		position: absolute;
		left: 50%;
		top: 15%;
		margin-left: -28rpx;
		font-size: 50rpx;
	}
	text {
		position: absolute;
		font-size: 14rpx;
		left: 50%;
		top: 73%;
		color: #555555;
		margin-left: -16rpx;
	}
	.cover {
		display: block;
		/* z-index: 2; */
		position:fixed;
		left:0;
		top:0;
		width:100%;
		height:100%;
		background-image: radial-gradient(rgba(0,0,0,0) 0%,rgba(0,0,0,0.5) 100%),radial-gradient(rgba(0,0,0,0) 33%,rgba(0,0,0,0.3) 166%);
		transition:all .25s
	}
	
</style>
