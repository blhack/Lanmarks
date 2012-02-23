var lat;
var lng;
lat = 33.4408588173593;
lng = -111.916703983604;
accu = 0;
old_accu = 0;
main_dropped = 0;
center_count = 0;
markers = new Array();
info_windows = {};
var opened_tag = "";
settled = 0;
top_lat = 0;
top_lng = 0;
bottom_lat = 0;
bottom_lng = 0;
width = screen.width;
auth = 0;
token = "";

function geo_success(position) {
	//console.log("Geo Success.  Settled = " + settled);
        if (settled < 6) {
		old_accu = accu;
		accu = position.coords.accuracy;
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		if (accu < 25000 && accu > 0) {
			settled++;
			//console.log("About to drop main.");
			//drop_main();
			populate_nearby();
			}
		else {
			//console.log("Not Dropping Main.  Settled = " + settled);
			}
		if (old_accu != accu) {
			update_position(lat, lng)
			}
		update_bounds();
		}
	}

function geo_error(error) {
        //console.log("Well....shit.");
        }


function update_position(lat, lng) {
	latlng = new google.maps.LatLng(lat, lng);
	if (settled < 4) {
        	map.setCenter(latlng);
		}
}

function update_bounds()
	{
	//console.log("Updating bounds accu: " + accu);
	var bounds = map.getBounds();
	if (!(typeof bounds === "undefined"))
		{
		top_lat = bounds.getNorthEast().lat();
		bottom_lat = bounds.getSouthWest().lat();
		top_lng = bounds.getNorthEast().lng();
		bottom_lng = bounds.getSouthWest().lng();
		populate_nearby();
		}
	else {
		//console.log("Bounds was undefined");
		}
	}

function drop_pin(mouseEvent)
	{
	var myLatlng = mouseEvent.latLng;
	settled = 10;
	lat = myLatlng.lat();
	lng = myLatlng.lng();

	if (auth == 1) {
		contentString = '<div style="width:450px;"><h1>Take a note!</h1>'+
				'<form name="note" action="take_note.cgi" method=post>'+
				'<textarea class="pretty_forms" cols=50 rows=10 name=note maxlengh=10000 id=comment_text></textarea>'+
				'<br />'+
				'<textarea name=tags id=tags class=tags></textarea><br />'+
				'<input class="pretty_forms" type=hidden name=lat value=' + lat + '>'+
				'<input class="pretty_forms" type=hidden name=lng value=' + lng + '>'+
				'<input class="pretty_forms" type=hidden name=accu>'+
				'<input class="pretty_forms" type=hidden name=token value=' + token + '>'+
				'<input id=submit_note type="button" value="Submit" onclick="this.disabled=1; ajax_submit_note();">'+
				'</form>'+
				'</div>';
		//console.log(token);
		}
	else {
		contentString = '<div style="height:250px;"><h1>Tell me about something cool here</h1> A good hiking trail, or a good place to get something to eat.<br />  You can also click anywhere on the map to leave a note. <hr>First, log in by clicking the image below: <br /><br /><a href="https://graph.facebook.com/oauth/authorize?client_id=132363446871451&redirect_uri=http://www.lanmarks.com/cgi-bin/facebook-auth-new.cgi" style="text-decoration:none;"><img src="/images/fb.png" width=200 border=0></a><br />(This will be used to get your name and the people in your network)</div>';
		}

	var myOptions = {
	  zoom: 13,
	  center: myLatlng,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	info_windows[0] = new google.maps.InfoWindow({
		content: contentString
	});

	markers[0] = new google.maps.Marker({
	    position: myLatlng,
	    map: map,
	    title:"(lol)"
	});

	info_windows[0].open(map,markers[0]);
	google.maps.event.addListener(markers[0], 'click', function() {
		info_windows[1].open(map,markers[0]);
	});
	//console.log("Dropped main, going for bounds");
}

function open_tag(tag) {
	alert("Opening " + tag);
	opened_tag = tag;
	reset_map();
	}

function initialize_map(l_lat,l_lng,item_id,tag) {
	
	opened_tag = tag;

	if (l_lat != 0)	{
		lat = l_lat;
		lng = l_lng;
	}

        latlng = new google.maps.LatLng(lat, lng);
	var mapDiv = document.getElementById('map_canvas');
        var myOptions = {
                zoom: 13,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
                };
        map = new google.maps.Map(mapDiv,myOptions);
	//google.maps.event.addListener(map, 'bounds_changed', function() {
	//	alert(map.getBounds());
	//});
	//google.maps.event.addDomListener(mapDiv, 'click', update_bounds);
	google.maps.event.addListener(map, 'idle', update_bounds);
	google.maps.event.addListener(map, 'bounds_changed', function() {
		//console.log("Bounds Changed.");
		if (main_dropped == 1) {
			settled = 10;
			}
		});
	google.maps.event.addListener(map, 'click', function(mouseEvent)
		{
		close_windows();
		drop_pin(mouseEvent);
		$('textarea.tags').tagify();
		//$('textarea.tags').({addTagPrompt: 'Add tag, press enter'});
		}
	);
	//google.maps.event.addListener(map, 'zoom_changed', update_bounds);
	if (!(typeof navigator.geolocation === 'undefined') && (l_lat == 0))
		{
		//console.log("Running geolocator...");
		wpid=navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
		}
	else {
		//console.log("Not running geolocator");
		}
	token = get_token("take_note");
	setTimeout("update_bounds();", 5000);
}

function drop_main() {
	main_dropped = 1;
	if (typeof(main_marker) != "undefined")
		{
		main_marker.setMap();
		}
	var myLatlng = new google.maps.LatLng(lat,lng);
	var myOptions = {
	  zoom: 13,
	  center: myLatlng,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	if (auth == 1) {
		//console.log("Authed, dropping auth note...");
		contentString = '<div style="width:425px;"><h1>Take a note!</h1>'+
				'<form name="note" action="take_note.cgi" method=post>'+
				'<textarea class="pretty_forms" cols=50 rows=10 name=note maxlengh=10000 id=comment_text></textarea>'+
				'<br />'+
				'<input class="pretty_forms" type=hidden name=lat value=' + lat + '>'+
				'<input class="pretty_forms" type=hidden name=lng value=' + lng + '>'+
				'<input class="pretty_forms" type=hidden name=accu>'+
				'<input class="pretty_forms" type=hidden name=token value=' + token + '>'+
				'<input id=submit_note type="button" value="Submit" onclick="this.disabled=1; ajax_submit_note();">'+
				'</form>'+
				'</div>';
		}
	else {
		//console.log("Non-authed, prompting...");
		contentString = '<div style="height:250px;"><h1>Tell me about something cool here</h1> A good hiking trail, or a good place to get something to eat.<br />  Click anywhere on the map to leave a note. <hr>First, log in by clicking the image below: <br /><br /><a href="https://graph.facebook.com/oauth/authorize?client_id=132363446871451&redirect_uri=http://www.lanmarks.com/cgi-bin/facebook-auth-new.cgi" style="text-decoration:none;"><img src="/images/fb.png" width=200 border=0></a><br />(This will be used to get your name and the people in your network)</div>';
		}

	if (accu > 20000 && auth == 1) {
		contentString = "<h1>Tell me about something cool around here</h1> A good hiking trail, or a good place to get something to eat.<br />  You can click anywhere on the map to leave a note.<br /><br />"  
		}

	//main_infowindow = new google.maps.InfoWindow({
	info_windows[1] = new google.maps.InfoWindow({
		content: contentString

	});

	main_marker = new google.maps.Marker({
	    position: myLatlng,
	    map: map,
	    title:"(lol)"
	});

	info_windows[1].open(map,main_marker);
	google.maps.event.addListener(main_marker, 'click', function() {
		info_windows[1].open(map,main_marker);
	});
	update_bounds();
	//console.log("Dropped main, going for bounds");
}

function drop_note(n_lat,n_lng,item_id,user,image_url,text,age,mine) {
	var myLatlng = new google.maps.LatLng(n_lat,n_lng);
	var myOptions = {
	  zoom: 15,
	  center: myLatlng,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<div id="bodyContent">'+
	    //'<iframe src="/main_window.cgi?lat=' + lat + '&lng=' + lng + '" scrolling=no height=290 width=280 style="border:none;"></div>'+
	    '<img src="' + image_url + '" align=left height=100 style="padding:10px;"><span class=title>' + user + '</span><hr>' + text +
	    '<br /><a href="/i/' + item_id + '/">Permalink</a>'; 
	    if (mine == 'y')
	    	{
		//console.log("It was yours...");
	    	contentString = contentString + '&nbsp;&nbsp;<a href=\'#\' onclick="javascript:modal(\'/delete_item.cgi?item_id=' + item_id + '\');">Delete This</a>';
		//console.log(contentString);
	    	}
	    contentString = contentString + '<br />'+
	    '<span class=age>' + age + '</span><br />'+
	    '</div>'+
            '</div>';

	if (!(item_id in info_windows)) {
		info_windows[item_id] = new google.maps.InfoWindow({
		    content: contentString
		});

		markers[item_id] = new google.maps.Marker({
		    position: myLatlng,
		    map: map,
		    title:""
		});
	}	
	
	google.maps.event.addListener(markers[item_id], 'click', function() {
		close_windows();
		info_windows[item_id].open(map,markers[item_id]);
		//console.log("Going to open " + item_id);
	});

}

function close_windows() {
	if (!(typeof markers[0] === "undefined"))
		{	
		markers[0].setMap(null);
		}
	for (var key in info_windows)
		{
		info_windows[key].close();
		}
	}

function reset_map() {
	for (var marker in markers)
		{
		markers[marker].setMap(null);
		}
	info_windows = new Array;
	markers = new Array;

	}

function format_tags(tag_string) {
	var my_tags = tag_string.split(",");
	var pretty_string = "";
	console.log(my_tags);
	for (var i = 0; i < my_tags.length; i++) {
		tag = my_tags[i];
		tag = tag.replace(/ /g,'');
		pretty_string = pretty_string = vsprintf("<a href=# onclick=\"alert('tacos');\">%s</a>", [tag]);
		if (i < (my_tags.length - 1)) {
			pretty_string = pretty_string + ", ";
			}
		}
	return(pretty_string);
	}

function populate_nearby() {
	if (document.getElementById("all") != null) {
		if (document.getElementById("all").checked==true) {
			var all = 'y';
		}
		else {
			var all = 'n';
		}
	}
	else {
		all = 'y';
		}

        if (window.XMLHttpRequest)
        {
        xmlhttp=new XMLHttpRequest();
        }
        else
        {
        // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function()
                {
                if(xmlhttp.readyState==4)
                        {
                        var xmlDoc=xmlhttp.responseXML.documentElement;
                        xmlDoc=xmlhttp.responseXML;
			auth = xmlDoc.getElementsByTagName("auth")[0].childNodes[0].nodeValue;
			if (main_dropped == 0) {
				//console.log(auth);
				drop_main();
				}
                        var notes = xmlDoc.getElementsByTagName("note");
			document.getElementById("message_window").innerHTML = "<h1>Notes Near Here</h1>";
                        for (var i = 0; i < notes.length; i++)
                                {
				var n_lat = notes[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue;
				var n_lng = notes[i].getElementsByTagName("lng")[0].childNodes[0].nodeValue;
                                var item_id = notes[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
				var text = notes[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;
				var user = notes[i].getElementsByTagName("user")[0].childNodes[0].nodeValue;
				var image_url = notes[i].getElementsByTagName("image_url")[0].childNodes[0].nodeValue;
				var age = notes[i].getElementsByTagName("age")[0].childNodes[0].nodeValue;
				var mine = notes[i].getElementsByTagName("mine")[0].childNodes[0].nodeValue;
				var my_tags = notes[i].getElementsByTagName("tags")[0].childNodes[0].nodeValue;
				drop_note(n_lat,n_lng,item_id,user,image_url,text,age,mine)
				var message_html = document.getElementById("message_window").innerHTML;
				message_html = message_html + '<div onmouseover="this.style.cursor"=pointer"" onClick="close_windows(); info_windows[' + item_id + '].open(map,markers[' + item_id + ']);"><table><tr><td rowspan=2 valign=top><img src="' + image_url + '" align=left width=75 style="padding:0px;"></td><td rowspan=1><span class="title">' + user + '</span></td></tr><tr><td valign="top"><span class="body">' + text + "</span><br /><span class='age'>" + age + " " + format_tags(my_tags) + "</span></td></tr></table><hr></div>";
				document.getElementById("message_window").innerHTML=message_html;

                                }
                        //var new_count = xmlDoc.getElementsByTagName("count")[0].childNodes[0].nodeValue;
                        //var latest = xmlDoc.getElementsByTagName("latest")[0].childNodes[0].nodeValue;

                        }
                }
	if (opened_tag.length > 0) {
        	var cgi = "/cgi-bin/nearby_xml.cgi?top_lat=" + top_lat + "&top_lng=" + top_lng + "&bottom_lat=" + bottom_lat + "&bottom_lng=" + bottom_lng + "&all=" + all + "&tag=" + opened_tag;
        }
	else {
		var cgi = "/cgi-bin/nearby_xml.cgi?top_lat=" + top_lat + "&top_lng=" + top_lng + "&bottom_lat=" + bottom_lat + "&bottom_lng=" + bottom_lng + "&all=" + all;
		}
	xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
        }

function getAllMethods(object) {
    return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] == 'function';
    });
}

function get_token(action) {
	var xmlhttp;
	var action = encodeURIComponent(action);
        if (window.XMLHttpRequest)
                {
                xmlhttp=new XMLHttpRequest();
                }   
        else        
               {
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }   
        xmlhttp.onreadystatechange=function()
                {
		console.log("xmlhttp readyState: " + xmlhttp.readyState);
                if(xmlhttp.readyState==4)
                        {
        		var xmlDoc=xmlhttp.responseXML.documentElement;
                        xmlDoc=xmlhttp.responseXML;
        		token = xmlDoc.getElementsByTagName("token")[0].childNodes[0].nodeValue;
			document.getElementById("token").value = token;
			console.log("Current token value is: " + document.getElementById('token').value);
			return token;
                        }           
                }           
        var cgi = "/cgi-bin/generate_token.cgi?action=" + encodeURIComponent(action);
        xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
	}

function ajax_submit_note()
        {
	var xmlhttp;
        var note_text = document.getElementById('comment_text').value;
        var note_lat = lat;
	var note_lng = lng;	
	var comment = encodeURIComponent(comment_text);
	var tags = $('textarea.tags').tagify('serialize');
	tags = tags.replace(/,/g, "|");
        if (window.XMLHttpRequest)
                {
                xmlhttp=new XMLHttpRequest();
                }   
        else        
               {
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }   
        xmlhttp.onreadystatechange=function()
                {
                if(xmlhttp.readyState==4)
                        {
        		var xmlDoc=xmlhttp.responseXML.documentElement;
                        xmlDoc=xmlhttp.responseXML;
                        //document.getElementById(item_id).innerHTML=
                        var item_id = xmlDoc.getElementsByTagName("item_id")[0].childNodes[0].nodeValue;
        		var success = xmlDoc.getElementsByTagName("success")[0].childNodes[0].nodeValue;
        		if (success == 'y')
                                {
        			close_windows();
				update_bounds();
				token = get_token("take_note")
				info_windows[item_id].open(map,markers[item_id]);
        			}
                        }           
                }           
        var cgi = "/cgi-bin/ajax_take_note.cgi?lat=" + encodeURIComponent(lat) + "&lng=" + encodeURIComponent(lng) + "&note=" + encodeURIComponent(note_text) + "&token=" + encodeURIComponent(token) + "&tags=" + encodeURIComponent(tags);
        xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
	}

function popup(target) {
      my_window = window.open(target,
       "mywindow","status=1,width=700,height=400");
   }	

function close_popup() {
	if(false == my_window.closed) {
        	my_window.close ();
	}
}


function show_comments(item_id) {
	//console.log("Item Id: " + item_id);
        if (window.XMLHttpRequest)
        {
        xmlhttp=new XMLHttpRequest();
        }
        else
        {
        // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function()
                {
                if(xmlhttp.readyState==4)
                        {
                        var xmlDoc=xmlhttp.responseXML.documentElement;
                        xmlDoc=xmlhttp.responseXML;
                        var comments_xml = xmlDoc.getElementsByTagName("comment");
			document.getElementById("comments").innerHTML = "";
			//console.log(comments_xml.length);
			for (var i = 0; i < comments_xml.length; i++)
                                {
				//console.log("Element at: " + i);
				var comments_content = document.getElementById("comments").innerHTML;
				var image_url = comments_xml[i].getElementsByTagName("image_url")[0].childNodes[0].nodeValue;
				var comment_id = comments_xml[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
				var comment_body = comments_xml[i].getElementsByTagName("comment_body")[0].childNodes[0].nodeValue;
				var age = comments_xml[i].getElementsByTagName("age")[0].childNodes[0].nodeValue;
				var display_name = comments_xml[i].getElementsByTagName("display_name")[0].childNodes[0].nodeValue;
				//console.log(comment_id);
				var marked_comment = 	'<div id=comment_' + comment_id + '>'+
							'<table width=100%>'+
							'<tr>'+
							'<td valign=top width=50>'+
							'<img src=' + image_url + ' align=left height=50 style="padding-right:10px;">'+
							'</td>'+
							'<td valign=top>'+
							'<span class=title>' + display_name + '</span>'+
							'<hr>'+
							comment_body+
							'<br />'+
							'<span class=age>' + age + '</span>'+
							'</td>'+
							'</tr>'+
							'</div>'+
							'</table>';
				document.getElementById("comments").innerHTML = comments_content + marked_comment;
                                }
                        }
                }
        var cgi = "/cgi-bin/ajax_comments.cgi?item_id=" + item_id;
        xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
        }

function ajax_submit_comment(item_id)
        {
        var xmlhttp;
        var comment_text = document.getElementById('comment_text').value;
        var comment = encodeURIComponent(comment_text);
	var token = document.getElementById("token").value;
        if (window.XMLHttpRequest)
                {
                xmlhttp=new XMLHttpRequest();
                }
        else
                {
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
        xmlhttp.onreadystatechange=function()
                {
                if(xmlhttp.readyState==4)
                        {
                        var xmlDoc=xmlhttp.responseXML.documentElement;
                        xmlDoc=xmlhttp.responseXML;
                        //document.getElementById(item_id).innerHTML=
                        var success = xmlDoc.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                        var new_comment = xmlDoc.getElementsByTagName("comment")[0].childNodes[0].nodeValue;
                        if (success == 'y')
                                {
                                show_comments(item_id);
                                //console.log("Token now is: " + token);
                                //console.log("Getting a new tokan...");
                                token = get_token("comment_" + item_id);
                                //console.log("New token is: " + token);
                                document.getElementById('comment_text').value = "";
                                document.getElementById('submit_comment').disabled=false;
                                document.getElementById('comment_box').innerHTML = 	'Comment:<br>'+
											'<form action=/cgi-bin/ajax_comment.cgi method=POST>'+
											'<textarea cols=60 rows=5 name=comment maxlengh=10000 id=comment_text></textarea>'+
											'<br>'+
											'<div id="has_java" style="display: block"><input id=submit_comment type="button" value="Submit" onclick="this.disabled=1; ajax_submit_comment(' + item_id + ');"></div>'+
											'<input type=hidden id=token value=' + token + '>'+
											'</form>';
                                }
                        }
                }
        var cgi = "/cgi-bin/ajax_comment.cgi?item_id=" + item_id + "&comment=" + comment + "&token=" + token
        xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
        }

function modal(url) 
	{
	document.getElementById("modal_container").innerHTML="<a href='" + url + "' id='modal' rel='superbox[iframe][600x250]'></a>";
	$(function(){
		$.superbox();
		$('#modal').trigger('click');
	});	
	}

/*function format_tags()
	{
	var formatted_tags = "";
	for (var tag_i in open_tags) {
		var tag = open_tags[tag_i];
		formatted_tags = formatted_tags + "|" + tag
		}
	return(formatted_tags);
	}
*/

function add_tag(tag)
	{
	open_tags.push(tag);
	}
