/*
 * flickr.js
 * Copyright(c) 2007 
 */ 

var Flickr = {
	Gadget : function(){
		return this.initialize.apply(this, arguments);
	},
	Base : {
		top_url : 'http://flickr.com/',
		api_url : 'http://api.flickr.com/services/rest/?',
		api_key : '4faeeab50cc5eb89cd73cdc2350e52e4',
		user_id : '',
		user_name : '',
		view_num : 6,
		area : '',
		
		callJSONP : function(url){
			var head = document.getElementsByTagName('head').item(0);
			var s = document.createElement('script');
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			s.setAttribute('charset', 'UTF-8');
			head.appendChild(s);
		}
	},
	
	Func : {
		/*
		 * Wrap API : flickr.people.getPublicPhoto
		 */
		getPublicPhotos : function(user_id){
			var method = 'flickr.people.getPublicPhotos';
			var base = Flickr.Base;
			var url = base.api_url + 'api_key=' + base.api_key + '&method=' + method + '&user_id=' + user_id + '&format=json&jsoncallback=Flickr.Callback.getPublicPhotos';
			
			base.callJSONP(url);
		},
		
		/*
		 * Wrap API : flickr.people.findByUsername
		 */
		findByUsername : function(username){
			var method = 'flickr.people.findByUsername';
			var base = Flickr.Base;
			var url = base.api_url + 'api_key=' + base.api_key + '&method=' + method + '&username=' + username + '&format=json&jsoncallback=Flickr.Callback.findByUsername';
			
			base.callJSONP(url);
		}

		
	},
	
	Callback : {
		photoBox : [],
		html : '',
		imgCount : 1,

		/*
		 * callback from Flickr API : flickr.people.findByUsername
		 */
		findByUsername : function(data){
			if(!data.stat || data.stat!='ok'){
					return;
			}
			Flickr.Base.user_id = data.user.nsid;
			Flickr.Func.getPublicPhotos(data.user.nsid);
		
		},
		
		/*
		 * callback from Flickr API : flickr.people.getPublicPhotos
		 */
		getPublicPhotos : function(data){
			if(!data.stat || data.stat!='ok'){
					return;
			}
			var base = Flickr.Base;
			var photo = data.photos.photo;
			var maxCount = base.view_num;
			var method = 'flickr.photos.getSizes';
			for(var i=0; i<maxCount; i++){
				// save photo data
				var photoData = photo[i];
				var photoId = photoData.id;
				this.photoBox[photoId] = photoData;
				var url = base.api_url + 'api_key=' + base.api_key + '&method=' + method + '&photo_id=' + photo[i].id + '&format=json&jsoncallback=Flickr.Callback.getSizes';
				base.callJSONP(url);
			}
		},
		
		/*
		 * callback from Flickr API : getSize
		 */
		getSizes : function(data){
			if(!data.stat || data.stat!='ok'){
					return;
			}

			var sqData = data.sizes.size[0];
			var jpgSource = sqData.source;
			var jpgUrl = sqData.url;
			var user_name = Flickr.Base.user_name;
			var jpgId = jpgUrl.match(/(\d+)\/sizes/)[1];
			var photoData = this.photoBox[jpgId];
			var base = Flickr.Base;
			
			try{
				var title = photoData.title;
				
				var photo_page_url = base.top_url + 'photos/' + user_name + '/' + jpgId + '/';
				var photo_html = '<a href="' + photo_page_url + '"><img src="' + jpgSource + '" border="0" id="flickrimg' + this.imgCount + '" class="flickrimg" alt="' + title + '" /></a>';
				this.imgCount++;
				
				if(base.area!=undefined){
					base.area.innerHTML += photo_html;
				} else {
					document.write(photo_html);
				}			
			} catch (e){console.log(e)}
		}

	
	}
};

Flickr.Gadget.prototype = {
	
	initialize : function(param){
		if(typeof param != 'object') return;
		Flickr.Base.area = document.getElementById(param.area) || undefined;
		Flickr.Base.view_num = param.view_num || 6;
		Flickr.Base.user_name = param.username || '';
		Flickr.Func.findByUsername(param.username);
	}	
};

