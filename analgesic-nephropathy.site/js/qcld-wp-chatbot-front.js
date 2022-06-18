jQuery(function ($) {
    "use strict";
    //Global object passed by admin
    var wpChatBotVar = wp_chatbot_obj;

    var slick_wrapper = $('.wpbot_carousel_wraper');

    var slick_settings = {
     slidesToShow: 8,
     slidesToScroll: 1,
     autoplay: true,
     autoplaySpeed: 3000,
     dot: false,
     arrows: false,
     responsive: [
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 6,
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 4,
          }
        },
    ]
    }

    var LoadwpwBotPlugin = 0;
    var textEditorHandler = 0;
    var exitintentcount = 0;
    if( typeof(openingHourIsFn) !='undefined'){
        var openingHourIs = openingHourIsFn;
    }else{
        var openingHourIs = 0;
    }

    var OnchatWindow = false;
    var justOpen = true;

    $(document).on({
            mouseenter:function(){
                OnchatWindow = true;

                if(wpChatBotVar.auto_hide_floating_button==1 && !justOpen){
                    $('#wp-chatbot-integration-container').fadeIn(500);
                    $('#wp-chatbot-desktop-close').fadeIn(500);
                    $('#wp-chatbot-desktop-reload').fadeIn(500);
                }
            },
            mouseleave:function(){
                OnchatWindow = false;

                if(wpChatBotVar.auto_hide_floating_button==1 && !justOpen){
                    setTimeout(function(){
                        if(!OnchatWindow){
                            $('#wp-chatbot-integration-container').fadeOut(500);
                            $('#wp-chatbot-desktop-close').fadeOut(500);
                            $('#wp-chatbot-desktop-reload').fadeOut(500);
                        }

                    }, 3000)
                }
            },
        },
    '.slimScrollDiv'
    );

    wpChatBotVar.exit_intent_handler = 0;
    wpChatBotVar.scroll_open_handler = 0;
    wpChatBotVar.auto_open_handler = 0;
    wpChatBotVar.re_target_handler = 0;


    $(window).load(function() {
        if(wpChatBotVar.enable_wp_chatbot_open_initial==1 && !localStorage.getItem("wpwHitory")){

            if($('.active-chat-board').length==0){
                jQuery('#wp-chatbot-chat-container').removeClass('wpbot_hide_floating_icon');
                $('.wp-chatbot-ball').trigger( "click" );
            }
        }

        if(wpChatBotVar.template=='template-06' || wpChatBotVar.template=='template-07'){
            if(jQuery('#menuItems').find('.wp-chatbot-integration-button-container').children().length==0){
                jQuery('#menuItems').hide();
                jQuery('#menuTrigger').hide();
            }
        }


        if(wpChatBotVar.wp_keep_chat_window_open==1){
            if($.cookie('bot_window_open') == 'yes' && $('.active-chat-board').length<1){
                $('.wp-chatbot-ball').trigger( "click" );
            }
        }


    });

    $(document).ready(function () {


        $(document).keydown(function(e) {

            e = e || window.event;
            var key = e.which || e.keyCode; // keyCode detection
            var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

            if ( key == 66 && ctrl ) {
                $('.wp-chatbot-ball').trigger( "click" );
            }

        })


	function dailogAIOAction(text){

        //=========

        if(!localStorage.getItem('botsessionid')){

            var number = Math.random() // 0.9394456857981651
            number.toString(36); // '0.xtis06h6'
            var id = number.toString(36).substr(2); // 'xtis06h6'

            localStorage.setItem('botsessionid', id);

        }

        if(wpChatBotVar.df_api_version=='v1'){
            return  jQuery.ajax({
                type : "POST",
                url :"https://api.dialogflow.com/v1/query?v=20170712",
                contentType : "application/json; charset=utf-8",
                dataType : "json",
                headers : {
                    "Authorization" : "Bearer "+wpChatBotVar.obj.ai_df_token
                },

                data: JSON.stringify( {
                    query: text,

                    lang : wpChatBotVar.df_agent_lan,
                    sessionId: localStorage.getItem('botsessionid')?localStorage.getItem('botsessionid'):'wpwBot_df_2018071'
                } )
            });
        }else{
            return jQuery.post(wpChatBotVar.ajax_url, {
                'action': 'qcld_wp_df_api_call',
                'dfquery': text,
                'sessionid': localStorage.getItem('botsessionid')?localStorage.getItem('botsessionid'):'wpwBot_df_2018071'
            });
        }

        //=========
    }



	function df_reply(response){

		//checking for facebook platform
        var i = 0;
        var html = '';
        var responses = [];

        if(wpChatBotVar.df_api_version=='v1'){
            var messages = response.result.fulfillment.messages;
            var action = response.result.actionIncomplete;
            jQuery.each( messages, function( key, message ) {
                html = '';
                i +=1;
                if(message.type==2){

                    html += "<p>" + message.title + "</p>";
                    html += "<div class=\"wpb-quick-reply-wrapper\">";
                    var index = 0;
                    for (index; index<message.replies.length; index++) {
                        html += "<span class=\"wpb-quick-reply qcld-chat-common\">"+ message.replies[index] +"</span>";
                    }
                    html +="</div>";


                }
                //check for default reply
                else if(message.type==0 && message.speech!=''){

                    html += message.speech;

                }else if(message.type==1){

                    html +='<div class="wpbot_card_wraper">';
                        html+='<div class="wpbot_card_image">';
                            if(message.imageUrl!=''){
                                html+='<img src="'+message.imageUrl+'" />';
                            }
                            html+='<div class="wpbot_card_caption">';
                            if(message.title!=''){
                                html+='<h2>'+message.title+'</h2>';
                            }
                            if(message.subtitle!=''){
                                html+='<p>'+message.subtitle+'</p>';
                            }
                            html+='</div>';
                        html+='</div>';
                        if(typeof message.buttons !== 'undefined'){
                            if(message.buttons.length>0){
                                jQuery.each( message.buttons, function( k, btn ) {
                                    html+='<a href="'+btn.postback+'" target="_blank"><i class="fa fa-external-link"></i> '+btn.text+'</a>';
                                })
                            }
                        }

                    html +='</div>';

                }else if(message.type=='simple_response'){
                    html += message.textToSpeech;
                }

                if(html!=''){
                    responses.push(html);
                }

            })
        }else{



            var messages = response.queryResult.fulfillmentMessages;
            var actioncomplete = response.queryResult.allRequiredParamsPresent;

            console.log(messages);

            jQuery.each( messages, function( key, message ) {

                html = '';
                i +=1;
                //handeling quickreplies
                if(typeof message.quickReplies !=="undefined"){
                    if(typeof message.quickReplies.title !=="undefined"){
                        html += "<p>" + message.quickReplies.title + "</p>";
                    }
                    if(typeof message.quickReplies.quickReplies !=="undefined" ){
                       html += "<div class=\"wpb-quick-reply-wrapper\">";

                        var index = 0;
                        for (index; index<message.quickReplies.quickReplies.length; index++) {
                            html += "<span class=\"wpb-quick-reply qcld-chat-common\">"+ message.quickReplies.quickReplies[index] +"</span>";
                        }

                        html += "</div>";

                    }

                }
                //handleing default response
                else if(typeof message.text !=="undefined"){
                    if(typeof message.text.text !=="undefined" && message.text.text.length>0){
                        html += "<span class=\"wpb-text\">"+ message.text.text[0] +"</span>";
                    }
                }
                else if(typeof message.card !=="undefined"){

                    html +='<div class="wpbot_card_wraper">';
                        html+='<div class="wpbot_card_image">';
                            if(typeof message.card.imageUri !=="undefined" && message.card.imageUri!=''){
                                html+='<img src="'+message.card.imageUri+'" />';
                            }
                            html+='<div class="wpbot_card_caption">';
                            if(typeof message.card.title !=="undefined" && message.card.title !=""){
                                html+='<h2>'+message.card.title+'</h2>';
                            }
                            if(typeof message.card.subtitle !=="undefined" && message.card.subtitle !=""){
                                html+='<p>'+message.card.subtitle+'</p>';
                            }
                            html+='</div>';
                        html+='</div>';

                        if(typeof message.card.buttons !== 'undefined'){
                            if(message.card.buttons.length>0){
                                jQuery.each( message.card.buttons, function( k, btn ) {
                                    html+='<a href="'+btn.postback+'" target="_blank"><i class="fa fa-external-link"></i> '+btn.text+'</a>';
                                })
                            }
                        }

                    html +='</div>';

                }

                else if(typeof message.payload !=="undefined"){
                   if(typeof message.payload.thumbnail_quickreply !=="undefined"){
                     var index = 0;
                     for (index; index<message.payload.thumbnail_quickreply.length; index++) {
                        html +='<div class="wpbot_card_wraper wpb-quick-reply2">';
                             html+='<div class="wpbot_card_image">';
                                 if(message.payload.thumbnail_quickreply[index].image !=="undefined" && message.payload.thumbnail_quickreply[index].image!=''){
                                     html+='<img src="'+message.payload.thumbnail_quickreply[index].image+'" />';
                                 }
                                 html+='<div class="wpbot_card_caption">';
                                 if(message.payload.thumbnail_quickreply[index].text !=="undefined" && message.payload.thumbnail_quickreply[index].text !=""){
                                     html+='<span class=\"wpb-quick-reply\">'+message.payload.thumbnail_quickreply[index].text+'</span>';
                                 }
                                 html+='</div>';
                             html+='</div>';

                        html +='</div>';
                     }
                   }
                }

                if(html!=''){
                    responses.push(html);
                }

            })

        }


        return responses;

    }


    function qcwp_auto_hide_floating_buttons(){
        setTimeout(function(){

            if(!OnchatWindow){
                $('#wp-chatbot-integration-container').fadeOut(500);
                $('#wp-chatbot-desktop-close').fadeOut(500);
                $('#wp-chatbot-desktop-reload').fadeOut(500);

            }else{
                $('#wp-chatbot-integration-container').fadeIn();
                $('#wp-chatbot-desktop-close').fadeIn();
                $('#wp-chatbot-desktop-reload').fadeIn();
            }
            justOpen = false;
        }, 3000)
    }

	$(document).on('click', '#wpbot_back_to_home', function(event){
		$('.wp-chatbot-container').show();
		$("#wp-chatbot-board-container").addClass('active-chat-board');
      $("#wp-chatbot-chat-container").addClass('active-chat');
      $("html").addClass('chat-open');
		$(".wpbot-saas-live-chat").hide();

    })




    if(wpChatBotVar.disable_wp_chatbot_history==1){

        localStorage.removeItem('shopper');
        localStorage.removeItem('wpwHitory');
        localStorage.setItem("wildCard",  0);
        localStorage.setItem("aiStep", 0);
    }

    if(typeof(clickintent) !=="undefined" && clickintent !=''){
        wpChatBotVar.clickintent = clickintent;
    }

        $(document).on('click', '.qc_wpbot_chat_link', function(e){
            e.preventDefault();
            var clickintent = $(this).attr('data-intent');
            wpChatBotVar.clickintent = clickintent;
            $('#wp-chatbot-chat-container').show();
            $('.fb_dialog').show();

            if($('.active-chat-board').length==0){
                jQuery('#wp-chatbot-chat-container').removeClass('wpbot_hide_floating_icon');
                $('.wp-chatbot-ball').trigger( "click" );

                if(localStorage.getItem('wpwHitory')){

                    if(clickintent=='Faq'){
                        globalwpw.wildCard=1;
                        globalwpw.supportStep='welcome';
                        wpwAction.bot('from wildcard support');
                        //keeping value in localstorage
                        localStorage.setItem("wildCard",  globalwpw.wildCard);
                        localStorage.setItem("supportStep", globalwpw.supportStep);

                    }else if(clickintent=='Email Subscription'){
                        globalwpw.wildCard=3;
                        globalwpw.subscriptionStep='welcome';
                        wpwTree.subscription();
                        localStorage.setItem("wildCard",  globalwpw.wildCard);
                        localStorage.setItem("supportStep", globalwpw.supportStep);

                    }else if(clickintent=='Site Search'){

                        if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                            var shopperName=  wp_chatbot_obj.shopper_demo_name;
                        }else{
                            var shopperName=globalwpw.hasNameCookie;
                        }
                        var askEmail= wpwKits.randomMsg(wp_chatbot_obj.asking_search_keyword)

                        wpwMsg.single(askEmail.replace("#name", shopperName));
                        //Now updating the support part as .
                        globalwpw.supportStep='search';
                        globalwpw.wildCard=1;
                        //keeping value in localstorage
                        localStorage.setItem("wildCard",  globalwpw.wildCard);
                        localStorage.setItem("supportStep",  globalwpw.supportStep);

                    }else if(clickintent=='Send Us Email'){

                        if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                            var shopperName=  wp_chatbot_obj.shopper_demo_name;
                        }else{
                            var shopperName=globalwpw.hasNameCookie;
                        }
                        var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_email);
                        wpwMsg.single(askEmail);
                        //Now updating the support part as .
                        globalwpw.supportStep='email';
                        globalwpw.wildCard=1;
                        //keeping value in localstorage
                        localStorage.setItem("wildCard",  globalwpw.wildCard);
                        localStorage.setItem("supportStep",  globalwpw.supportStep);

                    }else if(clickintent=='Leave A Feedback'){

                        if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                            var shopperName=  wp_chatbot_obj.shopper_demo_name;
                        }else{
                            var shopperName=globalwpw.hasNameCookie;
                        }
                        var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_email);
                        wpwMsg.single(askEmail);
                        //Now updating the support part as .
                        globalwpw.supportStep='email';
                        globalwpw.wildCard=1;
                        //keeping value in localstorage
                        localStorage.setItem("wildCard",  globalwpw.wildCard);
                        localStorage.setItem("supportStep",  globalwpw.supportStep);

                    }else if(clickintent == 'Request Callback'){
                        if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                            var shopperName=  globalwpw.settings.obj.shopper_demo_name;
                        }else{
                            var shopperName=globalwpw.hasNameCookie;
                        }
                        var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_phone);
                        setTimeout(function(){
                            wpwMsg.single(askEmail);
                            //Now updating the support part as .
                            globalwpw.supportStep='phone';
                            globalwpw.wildCard=1;
                            //keeping value in localstorage
                            localStorage.setItem("wildCard",  globalwpw.wildCard);
                            localStorage.setItem("supportStep",  globalwpw.supportStep);
                        },1000)
                    }else if(clickintent!=''){

                        globalwpw.initialize=1;
                        globalwpw.ai_step=1;
                        globalwpw.wildCard=0;
                        wpwAction.bot(clickintent);

                    }

                }

            }
        })

        $(document).on('click', '#wp-chatbot-notification-container', function(e){
            e.preventDefault();
            if(e.target.className=='wp-chatbot-notification-close'){
                $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-disable');
                        //clearInterval(notificationInterval);
                sessionStorage.setItem('wpChatbotNotification', 'removed');
            }else{



            var clickintent = $(this).attr('data-intent');

            if(e.target.className=='qcwp_notification_nav'){
                clickintent = e.target.innerText.trim();
            }

            // console.log(clickintent);

            if(clickintent!='' && typeof clickintent !='undefined'){
                wpChatBotVar.clickintent = clickintent;
                $('#wp-chatbot-chat-container').show();
                $('.fb_dialog').show();

                if($('.active-chat-board').length==0){
                    jQuery('#wp-chatbot-chat-container').removeClass('wpbot_hide_floating_icon');
                    $('.wp-chatbot-ball').trigger( "click" );

                        if(localStorage.getItem('wpwHitory')){

                            if(clickintent=='Faq'){
                                globalwpw.wildCard=1;
                                globalwpw.supportStep='welcome';
                                wpwAction.bot('from wildcard support');
                                //keeping value in localstorage
                                localStorage.setItem("wildCard",  globalwpw.wildCard);
                                localStorage.setItem("supportStep", globalwpw.supportStep);

                            }else if(clickintent=='Email Subscription'){
                                globalwpw.wildCard=3;
                                globalwpw.subscriptionStep='welcome';
                                wpwTree.subscription();
                                localStorage.setItem("wildCard",  globalwpw.wildCard);
                                localStorage.setItem("supportStep", globalwpw.supportStep);

                            }else if(clickintent=='Site Search'){

                                if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                                    var shopperName=  wp_chatbot_obj.shopper_demo_name;
                                }else{
                                    var shopperName=globalwpw.hasNameCookie;
                                }
                                var askEmail= wpwKits.randomMsg(wp_chatbot_obj.asking_search_keyword)

                                wpwMsg.single(askEmail.replace("#name", shopperName));
                                //Now updating the support part as .
                                globalwpw.supportStep='search';
                                globalwpw.wildCard=1;
                                //keeping value in localstorage
                                localStorage.setItem("wildCard",  globalwpw.wildCard);
                                localStorage.setItem("supportStep",  globalwpw.supportStep);

                            }else if(clickintent=='Send Us Email'){

                                if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                                    var shopperName=  wp_chatbot_obj.shopper_demo_name;
                                }else{
                                    var shopperName=globalwpw.hasNameCookie;
                                }
                                var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_email);
                                wpwMsg.single(askEmail);
                                //Now updating the support part as .
                                globalwpw.supportStep='email';
                                globalwpw.wildCard=1;
                                //keeping value in localstorage
                                localStorage.setItem("wildCard",  globalwpw.wildCard);
                                localStorage.setItem("supportStep",  globalwpw.supportStep);

                            }else if(clickintent=='Leave A Feedback'){

                                if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                                    var shopperName=  wp_chatbot_obj.shopper_demo_name;
                                }else{
                                    var shopperName=globalwpw.hasNameCookie;
                                }
                                var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_email);
                                wpwMsg.single(askEmail);
                                //Now updating the support part as .
                                globalwpw.supportStep='email';
                                globalwpw.wildCard=1;
                                //keeping value in localstorage
                                localStorage.setItem("wildCard",  globalwpw.wildCard);
                                localStorage.setItem("supportStep",  globalwpw.supportStep);

                            }else if(clickintent == 'Request Callback'){
                                if(typeof(globalwpw.hasNameCookie)=='undefined'|| globalwpw.hasNameCookie==''){
                                    var shopperName=  globalwpw.settings.obj.shopper_demo_name;
                                }else{
                                    var shopperName=globalwpw.hasNameCookie;
                                }
                                var askEmail=wp_chatbot_obj.hello+' '+shopperName+'! '+ wpwKits.randomMsg(wp_chatbot_obj.asking_phone);
                                setTimeout(function(){
                                    wpwMsg.single(askEmail);
                                    //Now updating the support part as .
                                    globalwpw.supportStep='phone';
                                    globalwpw.wildCard=1;
                                    //keeping value in localstorage
                                    localStorage.setItem("wildCard",  globalwpw.wildCard);
                                    localStorage.setItem("supportStep",  globalwpw.supportStep);
                                },1000)
                            }else if(clickintent!=''){

                                globalwpw.initialize=1;
                                globalwpw.ai_step=1;
                                globalwpw.wildCard=0;
                                wpwAction.bot(clickintent);

                            }

                        }


                }
            }else{
                $('.wp-chatbot-ball').trigger( "click" );
            }

        }
        })

        if ($('#wp-chatbot-shortcode-template-container').length == 0 && $('#wp-chatbot-chat-app-shortcode-container').length == 0) {
            //Main wpwbot area.
            //show it
            $('#wp-chatbot-ball-wrapper').css({
                'display': 'block',
            });
            //wpChatBot icon  position.
            $('#wp-chatbot-chat-container').css({
                'right': wpChatBotVar.wp_chatbot_position_x + wpChatBotVar.wp_chatbot_position_in,
                'bottom': wpChatBotVar.wp_chatbot_position_y + wpChatBotVar.wp_chatbot_position_in
            })
            //Facebook Messenger desktop
            setTimeout(function () {
                $('.fb_dialog').css({
                    'right': parseInt(55 + parseInt(wpChatBotVar.wp_chatbot_position_x)) + wpChatBotVar.wp_chatbot_position_in,
                    'bottom': parseInt(17 + parseInt(wpChatBotVar.wp_chatbot_position_y)) + wpChatBotVar.wp_chatbot_position_in,
                    'visibility': 'visible'
                });
            }, 3000);

            //wpchatbot icon animation disable or enable
            //Disable wpwBot icon Animation

            if (wpChatBotVar.disable_icon_animation == 1) {
                $('.wp-chatbot-ball').addClass('wp-chatbot-animation-deactive');
            } else {
                $('.wp-chatbot-ball').addClass('wp-chatbot-animation-active');


                var itemHide = function () {
                    $('.wp-chatbot-animation-active .wp-chatbot-ball-animation-switch').fadeOut(1000);
                };
                setTimeout(function () {
                    itemHide()
                }, 1000);

                //Click Animation
                $('.wp-chatbot-animation-active').on('click', function () {
                    $('.wp-chatbot-animation-active .wp-chatbot-ball-animation-switch').fadeIn(100);
                    setTimeout(function () {
                        itemHide()
                    }, 1000);
                });
            }

            //window resize.
            var widowH = $(window).height();
            var widowW = $(window).width();
            if (widowW > 767) {
                var ballConH = parseInt(widowH * 0.5);
                //$('.wp-chatbot-ball-inner').css({'height': ballConH + 'px'})
				$('.wpbot-saas-live-chat').css({'height': (ballConH+114) + 'px'})

                $(window).resize(function () {
                    var widowH = $(window).height();
                    var ballConH = parseInt(widowH * 0.5);
                    //$('.wp-chatbot-ball-inner').css({'height': ballConH + 'px'})
					$('.wpbot-saas-live-chat').css({'height': (ballConH+114) + 'px'})
                });
            };

			if(widowH==0){
				//$('.wp-chatbot-ball-inner').css({'height': 450 + 'px'})
			}
			$(window).resize(function () {
				if(widowH==0){
					//$('.wp-chatbot-ball-inner').css({'height': 450 + 'px'})
				}
			});

            var botimage = jQuery('#wp-chatbot-ball').find('img').attr('qcld_agent');

            $(document).on('click', '#wp-chatbot-ball', function (event) {

				if($('.wpbot-saas-live-chat').is(':visible')){
					$('#wpbot_back_to_home').trigger( "click" );
				}

                if (widowW <= 767 && wpChatBotVar.mobile_full_screen==1 && typeof insideIframe === 'undefined') {
                    $('.fb_dialog').hide();
                }


				if($('.active-chat-board').length>0){
                    if(wpChatBotVar.template=='template-06' || wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-ball').show();
                    }
					$('#wp-chatbot-ball').removeClass('wpbot_chatopen_iconanimation');
					$('#wp-chatbot-ball').addClass('wpbot_chatclose_iconanimation');
					$('#wp-chatbot-ball').find('img').attr('src', botimage)
                    $('.wp-chatbot-ball').css('background', '#ffffff');
                    if(wpChatBotVar.wp_keep_chat_window_open==1){
                        $.cookie('bot_window_open', 'no', { path: '/' });
                    }
                    setTimeout(function(){

                        var json = {
                            msg: 'chatbot_close',
                            val: (jQuery('#wp-chatbot-chat-container').height()+80)
                        }
                        sendMessageIframe(json);
                    },200)


				}else{

                    if(wpChatBotVar.auto_hide_floating_button==1){
                        justOpen = true;
                        qcwp_auto_hide_floating_buttons();
                    }

                    if(wpChatBotVar.template=='template-06' || wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-ball').hide();
                    }
					$('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
					$('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
					$('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
                    //$('.wp-chatbot-ball').css('background', 'unset');
                    if(wpChatBotVar.wp_keep_chat_window_open==1){
                        $.cookie('bot_window_open', 'yes', { path: '/' });
                    }


                    setTimeout(function(){
                        var json = {
                            msg: 'chatbot_open',
                            val: (jQuery('#wp-chatbot-chat-container').height()+80)
                        }
                        sendMessageIframe(json);
                    },200)

				}

                $("#wp-chatbot-board-container").toggleClass('active-chat-board');
                $("#wp-chatbot-chat-container").toggleClass('active-chat');
                $("html").toggleClass('chat-open');



                wpwbot_board_action();

                if(wpChatBotVar.is_operator_online==1 && wpChatBotVar.open_livechat_window_first==1){
                    if($('.active-chat-board').length>0){

                        if($('#wbca_signup_fullname').length>0){
                            if(localStorage.getItem('shopper')!==null){
                                $('#wbca_signup_fullname').val(localStorage.getItem('shopper'));
                            }
                            if(localStorage.getItem('shopperemail')!==null){
                                $('#wbca_signup_email').val(localStorage.getItem('shopperemail'));
                            }
                        }
                        $("#wp-chatbot-board-container").removeClass('active-chat-board');
                        $('.wp-chatbot-container').hide();
                        $('.wpbot-saas-live-chat').show();

                    }
                }


            });
            //wpwBot proActive start
            //Attention on
            if(wpChatBotVar.enable_meta_title==1 && wpChatBotVar.meta_label!="") {
                var MetaTitleInterval;
                var orginalTitle = document.title;
                $(document).on("mouseover", 'body', function (e) {
                    document.title = orginalTitle;
                    clearInterval(MetaTitleInterval);
                });
            }
            //Exit Intent
            if (wpChatBotVar.exit_intent_bargain_pro_single_page == 1 && wpChatBotVar.exit_intent_bargain_is_product_page ){
                window.addEventListener("mouseout", function (e) {
                    e = e ? e : window.event;

                    // If this is an autocomplete element.
                    if (e.target.tagName.toLowerCase() == "input")
                        return;

                    // Get the current viewport width.
                    var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

                    // If the current mouse X position is within 50px of the right edge
                    // of the viewport, return.
                    if (e.clientX >= (vpWidth - 50))
                        return;

                    // If the current mouse Y position is not within 50px of the top
                    // edge of the viewport, return.
                    if (e.clientY >= 50)
                        return;

                    // Reliable, works on mouse exiting window and
                    // user switching active program
                    var from = e.relatedTarget || e.toElement;
                    if (!from)
                    //if will open once if setup from backend.
                        var exitIntentOpen = true;
                    if ($.cookie('exit_intent') == 'yes' && wpChatBotVar.exit_intent_once == 1) {
                        exitIntentOpen = false;
                    }
                    if ( exitIntentOpen == true) {
                        if (wpChatBotVar.exit_intent_handler == 0) {

                           if($('.wp-saas-live-chat').is(':visible')){
                                return;
                            }

                            if($('.active-chat-board').length == 0){

                                $('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
                                $('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
                                $('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
                                //$('.wp-chatbot-ball').css('background', 'unset');
                                $("#wp-chatbot-board-container").addClass('active-chat-board');
                                $("#wp-chatbot-chat-container").addClass('active-chat');
                                $("html").addClass('chat-open');
                                if($('.chat_active').length>1){
                                    $('.wp-chatbot-ball').trigger( "click" );
                                }
                                if($('.wp-chatbot-tpl-4-chat-trigger').length>0){
                                    $('.wp-chatbot-tpl-4-chat-trigger').trigger( "click" );
                                }

                            }

                            setTimeout(function(){
                                $('.active-chat-board').addClass('animated tada');
                                $('.active-chat').addClass('animated tada');
                                setTimeout(function(){
                                    $('.active-chat-board').removeClass('animated tada');
                                    $('.active-chat').removeClass('animated tada');
                                }, 1000)
                            }, 200)


                            wpChatBotVar.exit_intent_handler++;
                            wpChatBotVar.re_target_handler = 9;
                            wpwbot_board_action();
                            //Shopper Name
                            if (localStorage.getItem('shopper')) {
                                var shopper = localStorage.getItem('shopper');
                            } else {
                                var shopper = wpChatBotVar.shopper_demo_name;
                            }
                            setTimeout(function () {
                                if (localStorage.getItem("wpwHitory")) {
                                    var confirmBtn='<span class="qcld-modal-bargin-confirm-exit-intent-btn"><span class="qcld-modal-bargin-bot-confirm-exit-intent" confirm-data="yes" >'+ wpChatBotVar.yes +'</span> <span> '+ wpChatBotVar.or +' </span><span class="qcld-chatbot-reset-btn qcld-chatbot-reset-btn-bargain"  reset-data="no">'+wpChatBotVar.no+'</span></span>';

                                    showing_proactive_msg(wpChatBotVar.ret_greet + ' ' + shopper + ', ' + wpChatBotVar.exit_intent_bargain_msg  + '<br><br>' + confirmBtn)

                                } else {
                                    var confirmBtn='<span class="qcld-modal-bargin-confirm-exit-intent-btn"><span class="qcld-modal-bargin-bot-confirm-exit-intent" confirm-data="yes" >'+ wpChatBotVar.yes +'</span> <span> '+ wpChatBotVar.or +' </span><span class="qcld-chatbot-reset-btn qcld-chatbot-reset-btn-bargain"  reset-data="no">'+wpChatBotVar.no+'</span></span>';

                                    showing_proactive_double_msg(wpChatBotVar.ret_greet + ' ' + shopper + ', ' + wpChatBotVar.exit_intent_bargain_msg + '<br><br>' + confirmBtn)

                                }
                                $.cookie('exit_intent', 'yes');
                                //pro active sound
                                proactive_retargeting_sound();
                                //Window foucus meta title change.
                                window_focus_change_meta_title();
                            }, 1000)
                        }
                    }
                });
            }else if(wpChatBotVar.enable_exit_intent == 1 && (wpChatBotVar.exitintent_all_page=='on' || wpChatBotVar.exitintent_pages.indexOf(wpChatBotVar.current_pageid)>-1)){
                window.addEventListener("mouseout", function (e) {
                    e = e ? e : window.event;


                    // If this is an autocomplete element.
                    if (e.target.tagName.toLowerCase() == "input")
                        return;

                    // Get the current viewport width.
                    var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

                    // If the current mouse X position is within 50px of the right edge
                    // of the viewport, return.
                    if (e.clientX >= (vpWidth - 50))
                        return;

                    // If the current mouse Y position is not within 50px of the top
                    // edge of the viewport, return.
                    if (e.clientY >= 50)
                        return;

                    // Reliable, works on mouse exiting window and
                    // user switching active program
                    var from = e.relatedTarget || e.toElement;
                    if (!from)
                       //if will open once if setup from backend.
                        var exitIntentOpen=true;
                        if($.cookie('exit_intent')=='yes' && wpChatBotVar.exit_intent_once==1) {
                            exitIntentOpen=false;
                        }



                        if (exitIntentOpen==true) {

                                if(wpChatBotVar.exit_intent_handler==0){

                                    if($('.active-chat-board').length == 0){
                                        $('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
                                        $('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
                                        $('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
                                        //$('.wp-chatbot-ball').css('background', 'unset');
                                        $("#wp-chatbot-board-container").addClass('active-chat-board');
                                        $("#wp-chatbot-chat-container").addClass('active-chat');
                                        $("html").addClass('chat-open');
                                        if($('.chat_active').length>1){
                                            $('.wp-chatbot-ball').trigger( "click" );
                                        }
                                        if($('.wp-chatbot-tpl-4-chat-trigger').length>0){
                                            $('.wp-chatbot-tpl-4-chat-trigger').trigger( "click" );
                                        }
                                    }

                                    setTimeout(function(){
                                        $('.active-chat-board').addClass('animated tada');
                                        $('.active-chat').addClass('animated tada');
                                        setTimeout(function(){
                                            $('.active-chat-board').removeClass('animated tada');
                                            $('.active-chat').removeClass('animated tada');
                                        }, 1000)
                                    }, 200)

                                wpChatBotVar.exit_intent_handler++;
                                wpChatBotVar.re_target_handler = 1;
                                wpwbot_board_action();
                                setTimeout(function(){
                                    var json = {
                                        msg: 'chatbot_open',
                                        val: (jQuery('#wp-chatbot-chat-container').height()+80)
                                    }
                                    sendMessageIframe(json);
                                },200)
                                //Shopper Name
                                if(localStorage.getItem('shopper')){
                                    var shopper=localStorage.getItem('shopper');
                                }else{
                                    var shopper=wpChatBotVar.shopper_demo_name;
                                }


                                setTimeout(function () {

                                    if(wpChatBotVar.exit_intent_custom_intent!=''){

                                        var dfReturns=dailogAIOAction(wpChatBotVar.exit_intent_custom_intent);
                                        dfReturns.done(function( response ) {

                                            if(wpChatBotVar.df_api_version=='v2'){

                                                response = $.parseJSON(response);

                                            }

                                            var msgcontent = df_reply(response);

                                            // console.log(msgcontent);

                                            jQuery.each( msgcontent, function( key, value ) {

                                                if (localStorage.getItem("wpwHitory")) {
                                                    showing_proactive_msg( wpChatBotVar.ret_greet+' '+shopper +', '+value);
                                                } else {
                                                    showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+value)
                                                }

                                            });


                                            $.cookie('exit_intent','yes');
                                            //pro active sound
                                            proactive_retargeting_sound();
                                            //Window foucus meta title change.
                                            window_focus_change_meta_title();


                                        }).fail(function (error) {

                                            if (localStorage.getItem("wpwHitory")) {
                                                showing_proactive_msg( wpChatBotVar.ret_greet+' '+shopper +', '+wpChatBotVar.exit_intent_msg);
                                            } else {
                                                showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+wpChatBotVar.exit_intent_msg)
                                            }
                                            $.cookie('exit_intent','yes');
                                            //pro active sound
                                            proactive_retargeting_sound();
                                            //Window foucus meta title change.
                                            window_focus_change_meta_title();
                                        });

                                    }else if(wpChatBotVar.exit_intent_email==1){

                                        //globalwpw.wildCard=3;
                                        globalwpw.subscriptionStep='welcome';
                                        wpwTree.subscription('test');
                                        $.cookie('exit_intent','yes');
                                        //pro active sound
                                        proactive_retargeting_sound();
                                        //Window foucus meta title change.
                                        window_focus_change_meta_title();
                                    }else{

                                        if (localStorage.getItem("wpwHitory")) {
                                            showing_proactive_msg( wpChatBotVar.ret_greet+' '+shopper +', '+wpChatBotVar.exit_intent_msg);
                                        } else {
                                            showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+wpChatBotVar.exit_intent_msg)
                                        }
                                        $.cookie('exit_intent','yes');
                                        //pro active sound
                                        proactive_retargeting_sound();
                                        //Window foucus meta title change.
                                        window_focus_change_meta_title();

                                    }

                                }, 1000)
                            }
                        }
                });
            }
            if(wpChatBotVar.enable_scroll_open==1){

                $(document).on('scroll', function (event) {
                        var OpenScroll=true;
                        //if will open once if setup from backend.
                       if( $.cookie('scroll_open')=='yes' && wpChatBotVar.scroll_open_once==1) {
                           OpenScroll=false;
                       }
                        //it will be open only for single time.
                        if ( OpenScroll==true) {

                            if(wpChatBotVar.scroll_open_handler==0){

                                var scrollOpenVal = parseInt(($(document).height() * wpChatBotVar.scroll_open_percent) / 100);
                                if ($(window).scrollTop() + $(window).height() > scrollOpenVal) {

                                    if($('.active-chat-board').length ==0){

                                        $('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
                                        $('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
                                        $('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
                                        //$('.wp-chatbot-ball').css('background', 'unset');
                                       $("#wp-chatbot-board-container").addClass('active-chat-board');
                                       $("#wp-chatbot-chat-container").addClass('active-chat');
                                       $("html").addClass('chat-open');
                                       if($('.chat_active').length>1){
                                            $('.wp-chatbot-ball').trigger( "click" );
                                        }
                                        if($('.wp-chatbot-tpl-4-chat-trigger').length>0){
                                            $('.wp-chatbot-tpl-4-chat-trigger').trigger( "click" );
                                        }

                                    }

                                    setTimeout(function(){
                                        $('.active-chat-board').addClass('animated tada');
                                        $('.active-chat').addClass('animated tada');
                                        setTimeout(function(){
                                            $('.active-chat-board').removeClass('animated tada');
                                            $('.active-chat').removeClass('animated tada');
                                        }, 1000)
                                    }, 200)

                                    wpChatBotVar.scroll_open_handler++;
                                    wpChatBotVar.re_target_handler = 2;
                                    wpwbot_board_action();
                                    setTimeout(function(){
                                        var json = {
                                            msg: 'chatbot_open',
                                            val: (jQuery('#wp-chatbot-chat-container').height()+80)
                                        }
                                        sendMessageIframe(json);
                                    },200)
                                    //Shopper Name
                                    if(localStorage.getItem('shopper')){
                                        var shopper=localStorage.getItem('shopper');
                                    }else{
                                        var shopper=wpChatBotVar.shopper_demo_name;
                                    }
                                    setTimeout(function () {

										if(wpChatBotVar.scroll_open_custom_intent!=''){

											var dfReturns=dailogAIOAction(wpChatBotVar.scroll_open_custom_intent);
											dfReturns.done(function( response ) {

												if(wpChatBotVar.df_api_version=='v2'){

                                                    response = $.parseJSON(response);

                                                }

                                                var msgcontent = df_reply(response);
                                                // console.log(msgcontent);

                                                jQuery.each( msgcontent, function( key, value ) {

                                                    if (localStorage.getItem("wpwHitory")) {
                                                        showing_proactive_msg( wpChatBotVar.ret_greet+' '+shopper +', '+value);
                                                    } else {
                                                        showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+value)
                                                    }

                                                });

												$.cookie('scroll_open','yes');
												//pro active sound
												proactive_retargeting_sound();
												//Window foucus meta title change.
												window_focus_change_meta_title();


											}).fail(function (error) {

												if (localStorage.getItem("wpwHitory")) {
													showing_proactive_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.scroll_open_msg);
												} else {
													showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.scroll_open_msg)
												}
												$.cookie('scroll_open','yes');
												//pro active sound
												proactive_retargeting_sound();
												//Window foucus meta title change.
												window_focus_change_meta_title();
											});

										}else if(wpChatBotVar.scroll_open_email==1){
											globalwpw.wildCard=3;
											globalwpw.subscriptionStep='welcome';
											wpwTree.subscription('test');
											$.cookie('scroll_open','yes');
										   //pro active sound
											proactive_retargeting_sound();
											//Window foucus meta title change.
											window_focus_change_meta_title();
										}else{
											if (localStorage.getItem("wpwHitory")) {
												showing_proactive_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.scroll_open_msg);
											} else {
												showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.scroll_open_msg)
											}
											$.cookie('scroll_open','yes');
											//pro active sound
											proactive_retargeting_sound();
											//Window foucus meta title change.
											window_focus_change_meta_title();
										}

                                    }, 1000)
                                }
                            }
                        }

                });
            }
            if(wpChatBotVar.enable_auto_open==1 ){
                //if will open once if setup from backend.
                var autoOpen=true;
                if($.cookie('auto_open')=='yes' && wpChatBotVar.auto_open_once==1) {
                    autoOpen=false;
                }
                if( autoOpen==true) {
                    setTimeout(function (e) {
                        if (wpChatBotVar.auto_open_handler == 0) {
							if ($('.active-chat-board').length == 0) {
                                $('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
                                $('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
                                $('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
                                //$('.wp-chatbot-ball').css('background', 'unset');

                                $("#wp-chatbot-board-container").addClass('active-chat-board');
                                $("#wp-chatbot-chat-container").addClass('active-chat');
                                $("html").addClass('chat-open');
                                if($('.chat_active').length>1){
                                    $('.wp-chatbot-ball').trigger( "click" );
                                }
                                if($('.wp-chatbot-tpl-4-chat-trigger').length>0){
                                    $('.wp-chatbot-tpl-4-chat-trigger').trigger( "click" );
                                }
                            }

                            setTimeout(function(){
                                $('.active-chat-board').addClass('animated tada');
                                $('.active-chat').addClass('animated tada');
                                setTimeout(function(){
                                    $('.active-chat-board').removeClass('animated tada');
                                    $('.active-chat').removeClass('animated tada');
                                }, 1000)
                            }, 200)

                            wpChatBotVar.auto_open_handler++;
                            wpChatBotVar.re_target_handler = 3;
                            wpwbot_board_action();
                            setTimeout(function(){
                                var json = {
                                    msg: 'chatbot_open',
                                    val: (jQuery('#wp-chatbot-chat-container').height()+80)
                                }
                                sendMessageIframe(json);
                            },200)
                            //Shopper Name
                            if(localStorage.getItem('shopper')){
                                var shopper=localStorage.getItem('shopper');
                            }else{
                                var shopper=wpChatBotVar.shopper_demo_name;
                            }
                            setTimeout(function () {

								if(wpChatBotVar.auto_open_custom_intent!=''){

									var dfReturns=dailogAIOAction(wpChatBotVar.auto_open_custom_intent);
									dfReturns.done(function( response ) {

										if(wpChatBotVar.df_api_version=='v2'){

                                            response = $.parseJSON(response);

                                        }

                                        var msgcontent = df_reply(response);
                                        // console.log(msgcontent);

                                        jQuery.each( msgcontent, function( key, value ) {

                                            if (localStorage.getItem("wpwHitory")) {
                                                showing_proactive_msg( wpChatBotVar.ret_greet+' '+shopper +', '+value);
                                            } else {
                                                showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+value)
                                            }

                                        });
										$.cookie('auto_open','yes');
										//pro active sound
										proactive_retargeting_sound();
										//Window foucus meta title change.
										window_focus_change_meta_title();


									}).fail(function (error) {

										if (localStorage.getItem("wpwHitory")) {
											showing_proactive_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.auto_open_msg);
										} else {
											showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+wpChatBotVar.auto_open_msg)
										}
										$.cookie('auto_open','yes');
										//pro active sound
										proactive_retargeting_sound();
										//Window foucus meta title change.
										window_focus_change_meta_title();
									});

								}else if(wpChatBotVar.auto_open_email==1){
									globalwpw.wildCard=3;
									globalwpw.subscriptionStep='welcome';
									wpwTree.subscription('test');
									$.cookie('auto_open','yes');
								   //pro active sound
									proactive_retargeting_sound();
									//Window foucus meta title change.
									window_focus_change_meta_title();
								}else{
									if (localStorage.getItem("wpwHitory")) {
										showing_proactive_msg(wpChatBotVar.ret_greet+' '+ shopper+', '+wpChatBotVar.auto_open_msg);
									} else {
										showing_proactive_double_msg(wpChatBotVar.ret_greet+' '+shopper+', '+wpChatBotVar.auto_open_msg)
									}
									$.cookie('auto_open','yes');
									//pro active sound
									proactive_retargeting_sound();
									//Window foucus meta title change.
									window_focus_change_meta_title();
								}



                            }, 1000)
                        }
                    }, parseInt(wpChatBotVar.auto_open_time * 1000));
                }
            }
            //Retargeting for Cart to complete checkout.
            if(wpChatBotVar.enable_ret_user_show==1 && localStorage.getItem("wpwHitory") && $.cookie('return_user')!='yes') {

                $.cookie('return_user','yes');
                var data = {'action': 'qcld_wb_chatbot_only_cart'};
                jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                    if (response.items > 0) {
                        if ($('.active-chat-board').length == 0) {
                            setTimeout(function () {
								$('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
									$('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
									$('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
									//$('.wp-chatbot-ball').css('background', 'unset');
                                $("#wp-chatbot-board-container").addClass('active-chat-board');
                                $("#wp-chatbot-chat-container").addClass('active-chat');
                                $("html").addClass('chat-open');


                                setTimeout(function(){
                                    $('.active-chat-board').addClass('animated tada');
                                    $('.active-chat').addClass('animated tada');
                                    setTimeout(function(){
                                        $('.active-chat-board').removeClass('animated tada');
                                        $('.active-chat').removeClass('animated tada');
                                    }, 1000)
                                }, 200)

                                wpwbot_board_action();
                                setTimeout(function(){
                                    var json = {
                                        msg: 'chatbot_open',
                                        val: (jQuery('#wp-chatbot-chat-container').height()+80)
                                    }
                                    sendMessageIframe(json);
                                },200)
                                showing_proactive_msg(wpChatBotVar.checkout_msg);
                                setTimeout(function () {
                                    showing_proactive_msg(response.html);
                                    //Window foucus meta title change.
                                    window_focus_change_meta_title();
                                }, 2000);
                            }, 1000);
                        }
                    }
                });
            }

            if(wpChatBotVar.enable_inactive_time_show==1 && localStorage.getItem("wpwHitory") ) {
                var timeoutID;

                function setup() {
                    /*jQuery(document).on("mousemove", resetTimer, false);
                    jQuery(document).on("mousedown", resetTimer, false);
                    jQuery(document).on("keypress", resetTimer, false);
                    jQuery(document).on("DOMMouseScroll", resetTimer, false);
                    jQuery(document).on("mousewheel", resetTimer, false);
                    jQuery(document).on("touchmove", resetTimer, false);
                    jQuery(document).on("MSPointerMove", resetTimer, false);
                    */
                    startTimer();
                }
                setup();

                function startTimer() {
                    // wait as set from admin seconds before calling goInactive
                    timeoutID = window.setTimeout(goInactive, parseInt(wpChatBotVar.inactive_time*1000));
                }

                function resetTimer(e) {
                    window.clearTimeout(timeoutID);

                    goActive();
                }

                function goInactive() {
                    if(wpChatBotVar.ret_inactive_user_once==1 && $.cookie('return_inactive_user')!='yes') {
                        $.cookie('return_inactive_user','yes');
                        var data = {'action': 'qcld_wb_chatbot_only_cart'};
                        jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                            if (response.items > 0) {
                                if ($('.active-chat-board').length == 0) {
                                    setTimeout(function () {
										$('#wp-chatbot-ball').removeClass('wpbot_chatclose_iconanimation');
									$('#wp-chatbot-ball').addClass('wpbot_chatopen_iconanimation');
									$('#wp-chatbot-ball').find('img').attr('src', wpChatBotVar.imgurl+'wpbot-close-icon.png');
									//$('.wp-chatbot-ball').css('background', 'unset');
                                        $("#wp-chatbot-board-container").addClass('active-chat-board');
                                        $("#wp-chatbot-chat-container").addClass('active-chat');
                                        $("html").addClass('chat-open');


                                        setTimeout(function(){
                                            $('.active-chat-board').addClass('animated tada');
                                            $('.active-chat').addClass('animated tada');
                                            setTimeout(function(){
                                                $('.active-chat-board').removeClass('animated tada');
                                                $('.active-chat').removeClass('animated tada');
                                            }, 1000)
                                        }, 200)

                                        wpwbot_board_action();
                                        showing_proactive_msg(wpChatBotVar.checkout_msg);
                                        setTimeout(function () {
                                            showing_proactive_msg(response.html);
                                            //Window foucus meta title change.
                                            window_focus_change_meta_title();
                                        }, 2000);
                                    }, 2000);
                                }
                            }
                        });
                    }
                }

                function goActive() {
                    // do something

                    startTimer();
                }
            }
            //Proactive retargeting sound for auto open. scroll open and
            function proactive_retargeting_sound() {
                if(wpChatBotVar.enable_ret_sound==1){
                    var promise = document.querySelector('#wp-chatbot-proactive-audio').play();
                    if (promise !== undefined) {
                        promise.then(function (success) {
                            //success to play
                        }).catch(function (error) {
                            //some error

                        });
                    }
                }
            }

            //When user will be out of window and news retargetting will be shown. where opening hour, title and meta need to be set.
            function window_focus_change_meta_title() {
                if(wpChatBotVar.enable_meta_title==1 && wpChatBotVar.meta_label!=""  && openingHourIs==0) {
                    var showInactive = 0;
                    MetaTitleInterval = setInterval(function () {
                        if (showInactive == 0) {
                            document.title = wpChatBotVar.meta_label;
                            showInactive = 1;
                        } else {
                            document.title = orginalTitle;
                            showInactive = 0;
                        }
                    }, 1000);
                }
            }

            //wpwBot proActive end
            function wpwbot_board_action() {
                if (widowW <= 767 && wpChatBotVar.mobile_full_screen==1 && typeof insideIframe === 'undefined') {//For mobile
                    if ($('#wp-chatbot-mobile-close').length <= 0 && wpChatBotVar.template!='template-05') {
                        $('.wp-chatbot-board-container').append('<div id="wp-chatbot-mobile-close">X</div>');
                        $('.wp-chatbot-header').hide();
                    }
					if(wpChatBotVar.template=='template-05'){

						// $('.wp-chatbot-ball-inner').slimScroll({
						// 	height: '100%',
						// 	start: 'bottom',
                  //    wheelStep: 5,
						// }).parent().find('.slimScrollBar').css({'top': $('.wp-chatbot-ball-inner').height() + 'px'});

					}else{

						// $('.wp-chatbot-ball-inner').slimScroll({
						// 	height: '100%',
						// 	start: 'bottom',
                  //    wheelStep: 5,
						// }).parent().find('.slimScrollBar').css({'top': $('.wp-chatbot-ball-inner').height() + 'px'});

						$('#wp-chatbot-chat-container').css({'bottom': '0', 'left': '0', 'right': '0'});
						$('#wp-chatbot-ball').hide();
						//Maintain inner chat box height
						var widowH = $(window).height();
						var headerH = $('.wp-chatbot-header').outerHeight();
						var footerH = $('.wp-chatbot-footer').outerHeight();
						var AppContentInner = widowH - footerH - headerH;

						//$('.wp-chatbot-ball-inner').css({'height': AppContentInner + 'px'})
						$(this).hide();

					}

                } else {
                    //$('.wp-chatbot-header').append('<div id="wp-chatbot-desktop-close">X</div>');
                    // $('.wp-chatbot-ball-inner').slimScroll({
                    //     height: '100%',
                    //     start: 'bottom',
                    //     wheelStep: 5,
                    // }).parent().find('.slimScrollBar').css({'top': $('.wp-chatbot-ball-inner').height() + 'px'});
                }


                //Here is the Plugin  to be load only for once.

                if (LoadwpwBotPlugin == 0) {

                    $.wpwbot({obj: wpChatBotVar, editor_handler: textEditorHandler, preLoadingTime: wpChatBotVar.botpreloadingtime});
                    LoadwpwBotPlugin++;

                    var data = {'action': 'qcld_wb_chatbot_session_count'};
                    jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                       //
                    });

                }
                //If product detials is open then it will be closed.
                $('.wp-chatbot-product-container').removeClass('active-chatbot-product-details');
                //Show and close notification message on ball click

                if ($('.active-chat-board').length != 0) {
                    $('#wp-chatbot-notification-container').removeClass('wp-chatbot-notification-container-sliding');
                    //chatbox will be open and notificaion will be closed
                    $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-disable');
                    //clearInterval(notificationInterval);
                } else {
                    if (!sessionStorage.getItem('wpChatbotNotification')) {
                        $('#wp-chatbot-notification-container').removeClass('wp-chatbot-notification-container-disable');
                        $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-sliding');

                    }
                    /// clearInterval(notificationInterval);
                }
                //Messenger handling.
                if ($('.active-chat-board').length > 0) {
                    $('#wp-chatbot-integration-container').show();
                    if(wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-integration-container-07').hide();
                    }
                } else {
                    $('#wp-chatbot-integration-container').hide();
                    if(wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-integration-container-07').show();
                    }
                }
            }
            function showing_proactive_msg(msg){
                //first open then chatboard
                if(localStorage.getItem("wpwHitory") && ! $('.wp-chatbot-operation-option[data-option="chat"]').parent().hasClass('wp-chatbot-operation-active')){
                    $('.wp-chatbot-messages-wrapper').html(localStorage.getItem("wpwHitory"));
                    $('.wp-chatbot-operation-option').each(function(){
                        if($(this).attr('data-option')=='chat'){
                            $(this).parent().addClass('wp-chatbot-operation-active');
                        }else{
                            $(this).parent().removeClass('wp-chatbot-operation-active');
                        }
                    });
                }
                var msgContent='<li class="wp-chatbot-msg">' +
                    '<div class="wp-chatbot-avatar">'+
                    '<img src="'+wpChatBotVar.agent_image_path+'" alt="">'+
                    '</div>'+
                    '<div class="wp-chatbot-agent">'+ wpChatBotVar.agent+'</div>'
                    +'<div class="wp-chatbot-paragraph"><img class="wp-chatbot-comment-loader" src="'+wpChatBotVar.image_path+'comment.gif" alt="Typing..." /></div></li>';
                    if($('.wp-chatbot-comment-loader').length<1){
						$('#wp-chatbot-messages-container').append(msgContent);
					}
                //Scroll to the last message
                $('.wp-chatbot-ball-inner').animate({ scrollTop: $('.wp-chatbot-messages-wrapper').prop("scrollHeight")}, 'slow').parent().find('.slimScrollBar').css({'top':$('.wp-chatbot-ball-inner').height()+'px'});
                setTimeout(function(){
                    $('#wp-chatbot-messages-container li:last .wp-chatbot-paragraph').html(msg).css({'background-color':wpChatBotVar.proactive_bg_color});
                    //scroll to the last message
                    $('.wp-chatbot-ball-inner').animate({ scrollTop: $('.wp-chatbot-messages-wrapper').prop("scrollHeight")}, 'slow').parent().find('.slimScrollBar').css({'top':$('.wp-chatbot-ball-inner').height()+'px'});
                }, 2000);
            }
            function  showing_proactive_double_msg(secondMsg) {
                //first open then chatboard
                if(localStorage.getItem("wpwHitory")){
                    $('.wp-chatbot-messages-wrapper').html(localStorage.getItem("wpwHitory"));
                    $('.wp-chatbot-operation-option').each(function(){
                        if($(this).attr('data-option')=='chat'){
                            $(this).parent().addClass('wp-chatbot-operation-active');
                        }else{
                            $(this).parent().removeClass('wp-chatbot-operation-active');
                        }
                    });
                }
                var fristMsg="<strong>"+wpChatBotVar.agent+" </strong> "+wpChatBotVar.agent_join[0];
                var msgContent='<li class="wp-chatbot-msg">' +
                    '<div class="wp-chatbot-avatar">'+
                    '<img src="'+wpChatBotVar.agent_image_path+'" alt="">'+
                    '</div>'+
                    '<div class="wp-chatbot-agent">'+ wpChatBotVar.agent+'</div>'
                    +'<div class="wp-chatbot-paragraph"><img class="wp-chatbot-comment-loader" src="'+wpChatBotVar.image_path+'comment.gif" alt="Typing..." /></div></li>';
                $('#wp-chatbot-messages-container').append(msgContent);
                //Scroll to the last message
                $('.wp-chatbot-ball-inner').animate({ scrollTop: $('.wp-chatbot-messages-wrapper').prop("scrollHeight")}, 'slow').parent().find('.slimScrollBar').css({'top':$('.wp-chatbot-ball-inner').height()+'px'});

                setTimeout(function(){
                    $('#wp-chatbot-messages-container li:last .wp-chatbot-paragraph').html('fristMsg');
                    //Second Message with interval
                    $('#wp-chatbot-messages-container').append(msgContent);
                    //Scroll to the last message
                    $('.wp-chatbot-ball-inner').animate({ scrollTop: $('.wp-chatbot-messages-wrapper').prop("scrollHeight")}, 'slow').parent().find('.slimScrollBar').css({'top':$('.wp-chatbot-ball-inner').height()+'px'});
                     setTimeout(function(){
                        $('#wp-chatbot-messages-container li:last .wp-chatbot-paragraph').html(secondMsg).css({'background-color':wpChatBotVar.proactive_bg_color});
                        //Scroll to the last message
                         $('.wp-chatbot-ball-inner').animate({ scrollTop: $('.wp-chatbot-messages-wrapper').prop("scrollHeight")}, 'slow').parent().find('.slimScrollBar').css({'top':$('.wp-chatbot-ball-inner').height()+'px'});

                    }, 2000);

                }, 2000);
            }
            $(document).on('click', '#wp-chatbot-mobile-close, #wp-chatbot-desktop-close, #wp-chatbot-desktop-close1', function (event) {
                $("#wp-chatbot-board-container").toggleClass('active-chat-board');
                $("#wp-chatbot-chat-container").toggleClass('active-chat');
                $("html").toggleClass('chat-open');
                $("#wp-chatbot-notification-container").removeClass('wp-chatbot-notification-container-disable').addClass('wp-chatbot-notification-container-sliding');
                $('#wp-chatbot-chat-container').css({
                    'right': wpChatBotVar.wp_chatbot_position_x + 'px',
                    'bottom': wpChatBotVar.wp_chatbot_position_y + 'px',
                    'top': 'auto', 'left': 'auto'
                });
                $('.fb_dialog').show();
                $('#wp-chatbot-ball').show();
                //Facebook Messenger.
                if ($('.active-chat-board').length > 0) {
                    $('#wp-chatbot-integration-container').show();
                    if(wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-integration-container-07').hide();
                    }

                } else {
                    $('#wp-chatbot-integration-container').hide();
                    if(wpChatBotVar.template=='template-07'){
                        $('#wp-chatbot-integration-container-07').show();
                    }
                    if(wpChatBotVar.template=='template-06'){
                        $('#wp-chatbot-ball').show();
                    }
                    $('#wp-chatbot-ball').removeClass('wpbot_chatopen_iconanimation');
					$('#wp-chatbot-ball').addClass('wpbot_chatclose_iconanimation');
					$('#wp-chatbot-ball').find('img').attr('src', botimage)
					$('.wp-chatbot-ball').css('background', '#ffffff');
                }

                if(wpChatBotVar.wp_keep_chat_window_open==1){
                    $.cookie('bot_window_open', 'no', { path: '/' });
                }


				setTimeout(function(){

					var json = {
						msg: 'chatbot_open',
						val: (jQuery('#wp-chatbot-chat-container').height()+80)
					}
					sendMessageIframe(json);

				},200)

            });


            $("#qcld-wp-chatbot-shortcode-style-css").attr("disabled", "disabled");
            /***
             * Notification Message
             */
            if ($('#wp-chatbot-notification-container').length > 0) {
                if (sessionStorage.getItem('wpChatbotNotification') && sessionStorage.getItem('wpChatbotNotification') == 'removed') {
                    //if remove on the session.
                    $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-disable');
                } else {
                    //Notification comes with slideIn effect
                    $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-sliding');
                    //handling welcome & return user welcome msg.

                    var welcomeMsg = '';

                    if ($.cookie("shopper")) {
                        var shopper = $.cookie("shopper");
                         welcomeMsg = wpChatBotVar.welcome_back[0] + ' <strong>' + shopper + '!</strong>';
                    } else {
                         welcomeMsg = wpChatBotVar.welcome[0] + ' <strong>' + wpChatBotVar.host + '!</strong>';

                    }
                    $('.wp-chatbot-notification-welcome').html(welcomeMsg);
                    //Notifications msgs handling.
                    var notifications = wpChatBotVar.notifications;
                    var notification_intents = wpChatBotVar.notification_intents
                    if (notifications.length > 1) {
                        var totalNotMsg = wpChatBotVar.notifications.length;
                        var notMsgIndex = 0;
                        var intervalTime = parseInt(wpChatBotVar.notification_interval) * 1000;
                        var notificationInterval = setInterval(function (e) {
                            notMsgIndex++;
                            if (totalNotMsg <= notMsgIndex) {
                                notMsgIndex = 0;
                            }
                            //show new notification time after every intervalTime

                            $('.wp-chatbot-notification-message').css({'opacity': 1}).html(notifications[notMsgIndex]);
                            if(notification_intents[notMsgIndex]!='' && typeof notification_intents[notMsgIndex] !='undefined'){
                                $('#wp-chatbot-notification-container').attr('data-intent', notification_intents[notMsgIndex]);
                            }else{
                                $('#wp-chatbot-notification-container').removeAttr('data-intent');
                            }


                        }, intervalTime);
                    }

                    $(".wp-chatbot-notification-close").on('click', function () {
                        $('#wp-chatbot-notification-container').addClass('wp-chatbot-notification-container-disable');
                        //clearInterval(notificationInterval);
                        sessionStorage.setItem('wpChatbotNotification', 'removed');
                    });
                }
            }
        }
        else if ($('#wp-chatbot-shortcode-template-container').length > 0) { //Page shortcode area.
            $('#wp-chatbot-chat-container').css({'display': 'none'});
            $('#wp-chatbot-ball').hide();
            //Add Scroll to chat ui
            $('.wp-chatbot-ball-inner').slimScroll({
                height: '60hv',
                start: 'bottom',
                wheelStep: 5,
            }).parent().find('.slimScrollBar').css({'top': $('.wp-chatbot-ball-inner').height() + 'px'});
            //Add scroll to cart part
            var recentViewHeight = $('.wp-chatbot-container').outerHeight();
            if ($('.chatbot-shortcode-template-02').length == 0) {
                $('.wp-chatbot-cart-body').slimScroll({height: '200px', start: 'top'});
                $('.wp-chatbot-widget .wp-chatbot-products').slimScroll({height: '435px', start: 'top'});
            }

            //Remove style of template
            $("#qcld-wp-chatbot-style-css").attr("disabled", "disabled");
            //Here is the Plugin  to be load only for once.
            if (LoadwpwBotPlugin == 0) {
                $.wpwbot({obj: wpChatBotVar, editor_handler: textEditorHandler});
                LoadwpwBotPlugin++;
                var data = {'action': 'qcld_wb_chatbot_session_count'};
                    jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                       //
                    });
            }


        }
        else if ($('#wp-chatbot-chat-app-shortcode-container').length > 0) {  //App shortcode area.

            textEditorHandler = 1;
            //App UI (ball inner)
            setTimeout(function () {
                var widowH = $(window).height();

                var footerH = $('.wp-chatbot-footer').outerHeight();

                var AppContentInner = widowH - footerH;

                $//('#wp-chatbot-chat-app-shortcode-container .wp-chatbot-ball-inner').css({'height': AppContentInner + 'px'})
            }, 300);
            $(window).resize(function () {
                setTimeout(function () {
                    var widowH = $(window).height();

                    var footerH = $('.wp-chatbot-footer').outerHeight();
                    var AppContentInner = widowH - footerH;

                    //$('#wp-chatbot-chat-app-shortcode-container .wp-chatbot-ball-inner').css({'height': AppContentInner + 'px'})
                }, 300)
            });

            $('#wp-chatbot-ball').hide();
            //Add Scroll to chat ui
            $("#qcld-wp-chatbot-shortcode-style-css").attr("disabled", "disabled");
            $("#wp-chatbot-board-container").addClass('active-chat-board');
            $("#wp-chatbot-chat-container").addClass('active-chat');
            $("html").addClass('chat-open');
            $('.wp-chatbot-ball-inner').slimScroll({
                height: '100%',
                start: 'bottom',
                wheelStep: 5,
            }).parent().find('.slimScrollBar').css({'top': $(window).height() + 'px'});
            if (LoadwpwBotPlugin == 0) {
                $.wpwbot({obj: wpChatBotVar, editor_handler: textEditorHandler});
                LoadwpwBotPlugin++;
                var data = {'action': 'qcld_wb_chatbot_session_count'};
                    jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                       //
                    });
            }
            //Handling app cart and checkout
            $('#wp-chatbot-cart-short-code').hide();
            $('#wp-chatbot-checkout-short-code').hide();
            $(document).on('click', '.wp-chatbot-cart-link', function (event) {
                $('.wp-chatbot-messages-wrapper').hide();
                $('#wp-chatbot-checkout-short-code').hide();
                $('#wp-chatbot-cart-short-code').show();
                event.preventDefault();
                $('#wp-chatbot-cart-short-code').html('<img class="wp-chatbot-comment-loader" src="' + wpChatBotVar.image_path + 'comment.gif" alt="..." />');
                var data = {'action': 'qcld_wb_chatbot_cart_page'};
                jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                    $("#wp-chatbot-cart-short-code").html(response);
                });
            });
            $(document).on('click', '.wp-chatbot-checkout-link, .checkout-button', function (event) {
                event.preventDefault();
                $('.wp-chatbot-messages-wrapper').hide();
                $('#wp-chatbot-cart-short-code').hide();
                $('#wp-chatbot-checkout-short-code').show();


                $('#wp-chatbot-checkout-short-code').html('<img class="wp-chatbot-comment-loader" src="' + wpChatBotVar.image_path + 'comment.gif" alt="..." />');
                var data = {'action': 'qcld_wb_chatbot_checkout_page'};
                jQuery.post(wpChatBotVar.ajax_url, data, function (response) {
                    if (response.status == 'yes') {
                        window.location.href = response.html;
                    } else {
                        $("#wp-chatbot-checkout-short-code").html(response.html);
                    }

                });
            });
            //Preventing url redirect from cart page.
            $(document).on('click', '#wp-chatbot-chat-app-shortcode-container .woocommerce-cart-form a', function (e) {
                e.preventDefault();
            });
        }
        //For variable product configuration
        $(document).on('change', "#wp-chatbot-product-variable select ", function () {
            var variations = JSON.parse($("#wp-chatbot-variation-data").attr('data-product-variation'));
            var item_conditions = [];

            var totalAttr = $("#wp-chatbot-product-variable select").length;
            var i = 1;
            $("#wp-chatbot-product-variable select").each(function (index, element) {
                var myVal = $(this).find('option:selected').val();
                if (myVal != "") {
                    item_conditions.push({
                        'left': 'item["variation_data"]["' + $(this).attr('name') + '"][0]',
                        'right': myVal
                    })
                }
            });
            var newVariation = [];
            for (var a = 0; variations.length > a; a++) {
                var item = variations[a];
                var item_condition = "";
                for (var i = 0; item_conditions.length > i; i++) {

                    if (i > 0) {
                        item_condition += ' && ' + '"' + eval(item_conditions[i].left).toLowerCase() + '"' + '==' + '"' + item_conditions[i].right.toLowerCase() + '"';
                    } else {
                        item_condition += '"' + eval(item_conditions[i].left).toLowerCase() + '"' + '==' + '"' + item_conditions[i].right.toLowerCase() + '"';
                    }
                }
                if (eval(item_condition)) {
                    newVariation[0] = item;
                }
            }
            if (newVariation.length > 0) {
                $('#wp-chatbot-variation-add-to-cart').attr('variation_id', newVariation[0]['variation_id']);
                var priceSets = "";
                if (newVariation[0]['variation_data']['_sale_price'][0] != "") {
                    priceSets += '<strike>' + wpChatBotVar.currency_symbol + newVariation[0]['variation_data']['_regular_price'][0] + '</strike>  <strong>' + wpChatBotVar.currency_symbol + newVariation[0]['variation_data']['_sale_price'][0] + '</strong>'
                } else {
                    priceSets += '<strong>' + wpChatBotVar.currency_symbol + newVariation[0]['variation_data']['_regular_price'][0] + '</strong>';
                }
                $('#wp-chatbot-product-price').html(priceSets);
            }
        });

        if ($('.active-chat-board').length > 0) {
            $('#wp-chatbot-integration-container').show();
            if(wpChatBotVar.template=='template-07'){
                $('#wp-chatbot-integration-container-07').hide();
            }
        } else {
            $('#wp-chatbot-integration-container').hide();
            if(wpChatBotVar.template=='template-07'){
                $('#wp-chatbot-integration-container-07').show();
            }
        }
        //Facebook Messenger Integration

        //skype
        if (wpChatBotVar.enable_skype == 1) {
            $(document).on('click', '.inetegration-skype-btn', function (e) {
                $('#wp-chatbot-board-container').removeClass('active-chat-board');

                $('#wp-chatbot-integration-container').hide();
                if(wpChatBotVar.template=='template-07'){
                    $('#wp-chatbot-integration-container-07').show();
                }
            });

        }


    });

	// Create IE + others compatible event handler
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

	// Listen to message from child window
	eventer(messageEvent,function(e) {
        // console.log(e.data);

        if(e.data.msg == 'parent'){
            $('#wp-chatbot-chat-container').css({
                'right': '50px',
                'bottom': '50px'
            })
        }

        // $('.wpbot_carousel_wraper').not('.slick-initialized').slick(slick_settings);

        // setTimeout(function () {
        //    $('.wpbot_carousel_wraper').slick(slick_settings);
        // }, 3000);



	},false);

	function sendMessageIframe(json){
		parent.postMessage(json,"*");
    }


});
