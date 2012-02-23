function ajax_submit_comment(item_id,token)
        {
        var xmlhttp;
        var comment_text = document.getElementById('comment_text').value;
        var comment = encodeURIComponent(comment_text);
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
				console.log("Token now is: " + token);
				console.log("Getting a new tokan...");
				token = get_token("comment_" + item_id);
				console.log("New token is: " + token);
				document.getElementById('comment_text').value = "";
				document.getElementById('submit_comment').disabled=false;
				document.getElementById('token').value = token;
				}
                        }           
                }           
        var cgi = "/cgi-bin/ajax_comment.cgi?item_id=" + item_id + "&comment=" + comment + "&token=" + token
        xmlhttp.open("GET",cgi,true);
        xmlhttp.send(null);
        }
