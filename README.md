# SmartHome
智能家居控制系统（小程序端）课程设计  
界面：  
![image](https://github.com/dwardchan/SmartHome/blob/master/1.png)  
空调和台灯的调节功能:  
![image](https://github.com/dwardchan/SmartHome/blob/master/2.gif)  
  
  
var aliyunInfo = {  
		productKey: '设备三元组信息',   
		deviceName: '设备三元组信息',   
		deviceSecret: '设备三元组信息',  
		regionId: 'cn-shanghai',   
		pubTopic: '/sys/a1786pIjqSZ/WechatP/thing/service/property/post', //发布消息的主题  
		subTopic: '/sys/a1786pIjqSZ/WechatP/thing/service/property/set', //订阅消息的主题  
			  };  
在aliyunInfo中填写阿里云三元组信息和订阅发布的topic，然后引入阿里云算法包对其进行解析  
const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js');  
然后利用解析后的三元组和host进行mqtt协议的连接  

                let host = 'wxs://' + clientOpt.host;  
			this.options.clientId = clientOpt.clientId;  
			this.options.password = clientOpt.password;  
			this.options.username = clientOpt.username;  
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

