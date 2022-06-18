jQuery(document).ready(function($) {




    //--Check List
    var checklist_score = 0;
    $('#start-now a').on('click', function (start) {
        start.preventDefault();
        hide_start_checklist();
        show_checklist_q(0);
        scroll_to_top_checklist();
    });


    $('#skip-now a').on('click', function (skip) {
        skip.preventDefault();
        hide_start_checklist();
        show_checklist_share_result();
    });



    $( ".checklist-q a" ).on('click', function (c) {
        c.preventDefault();
        var ans = $(this).find('.elementor-button-text').text();
        var current_index = $(this).closest('.checklist-q').index() - 2;

        if(ans == 'Yes'){
            checklist_score += 1;
        }

        if(ans == '有'){
            checklist_score += 1;
        }

        if(ans == 'Ya'){
            checklist_score += 1;
        }

        if(ans == 'ஆம்'){
            checklist_score += 1;
        }

        if(ans == 'No'){
            
        }
        if(ans == '没有'){
            
        }
        if(ans == 'Tidak'){
            
        }
        if(ans == 'இல்லை'){
            
        }

        if( current_index > ($('.checklist-q').length - 3) ){
            console.log('result');
            hide_checklist_q(current_index);
            if(checklist_score>0){
                $('.score-dynamic u').text(checklist_score);
                show_result(2);
            }else{
                show_result(1);
            }
            show_checklist_share_result();
        }else{
            hide_checklist_q(current_index);
            show_checklist_q(current_index+1);
        }

 
        scroll_to_top_checklist();

    });


    function show_checklist_q(screen){
        $('.checklist-q').eq(screen).fadeIn(1500);
    }

    function hide_checklist_q(screen){
        $('.checklist-q').eq(screen).fadeOut(300);
    }

    function hide_start_checklist(){
        $('#start-checklist').fadeOut(300);
    }
    function show_checklist_share_result(){
        $('.checklist-share-result').fadeIn(1500);
    }
    function show_result(result){
        if(result == 1){
            $('.checklist-a1').fadeIn(1500);
        }
        if(result == 2){
            $('.checklist-a2').fadeIn(1500);
        }
    }

    function scroll_to_top_checklist(){
        var header_height = $('div[data-elementor-type="header"]').height();
        $('html, body').animate({
            scrollTop: $('div[data-id="eed4719"]').offset().top - header_height
        }, 500, 'linear');
    }



    //--end Check List



    var theLanguage = $('html').attr('lang');



    // let lang = document.documentElement.lang.toLowerCase().includes('zh') ?'cn':'en';



    //--Kidney Matter
    var correct_or_wrong_text;
    $('.review-answer-btn .elementor-widget-button a').on('click', function (r) {

        r.preventDefault();

        var parent = $(this).closest('.elementor-widget-button');
        var sp_container = parent.closest('.kidney-matter-q')
        var button_value_c = $(this).find('.elementor-button-text').text();
        var button_value_w = parent.siblings().find('.elementor-button-text').text();
        var answer_id = sp_container.find('.review-answer').attr('data-id');

        
        //for true answer
        if( parent.hasClass("true")) {
            // console.log('d');

            if(theLanguage == 'zh-CN'){
                correct_or_wrong_text = '答<span class="correct-color">对</span>了, 答案是 <span class="correct-color">'+button_value_c+'!</span>';
             }else if(theLanguage == 'ta-IN'){
                correct_or_wrong_text = 'உங்கள் பதில்<span class="correct-color">சரி, </span><span class="correct-color">'+button_value_c+'!</span>என்பதே பதில்!';
             }else if(theLanguage == 'ms-MY'){
                correct_or_wrong_text = 'Anda <span class="correct-color">Betul</span>, jawapannya ialah <span class="correct-color">'+button_value_c+'!</span>';
             }else {
                correct_or_wrong_text = 'You are <span class="correct-color">Correct</span>, the answer is <span class="correct-color">'+button_value_c+'!</span>';
             }

            $(this).toggleClass('correct-true');
        }else{
            // console.log('c');
            if(theLanguage == 'zh-CN'){
                correct_or_wrong_text = '答<span class="fault-color">错</span>了, 答案是 <span class="fault-color">'+button_value_w+'!</span>';
             }else if(theLanguage == 'ta-IN'){
                correct_or_wrong_text = 'உங்கள் பதில்<span class="fault-color">தவறு, </span><span class="fault-color">'+button_value_w+'!</span>என்பதே பதில்!';
             }else if(theLanguage == 'ms-MY'){
                correct_or_wrong_text = 'Anda <span class="fault-color">Salah</span>, jawapannya ialah <span class="fault-color">'+button_value_w+'!</span>';
             }else {
                correct_or_wrong_text = 'You are <span class="fault-color">Wrong</span>, the answer is <span class="fault-color">'+button_value_w+'!</span>';
             }
            $(this).toggleClass('wrong-fault');
        }

        //prevent changing answer
        sp_container.find('.review-answer-btn').css({
            'pointer-events':'none',
        });

        sp_container.find('.answer-label .elementor-heading-title').html(correct_or_wrong_text);
        sp_container.find('.review-answer').fadeIn();
        scroll_to_next_matter(answer_id);

    });


    function scroll_to_next_matter(answer_id){
        var header_height = $('div[data-elementor-type="header"]').height();
        $('html, body').animate({
            scrollTop: $('section[data-id="'+answer_id+'"]').offset().top - header_height
        }, 500, 'linear');
    }
    // --End Kidney Matter




    //same height
    $(window).on('load', function () {
        $('.nkf-same-height-img').matchHeight({
            property: 'min-height',
        });	
        $('.nkf-same-height-img .elementor-icon-box-wrapper').matchHeight({
            property: 'min-height',
        });	
        
        $('.nkf-same-height-content').matchHeight({
            property: 'min-height',
        });	

        $('.same-height-text .elementor-widget-text-editor').matchHeight({
            property: 'min-height',
        });
    });



    //popupfix

//    $('.popupfix .uael-modal-action.elementor-clickable.uael-trigger').on('click', function (pop) {
//        var data_id = $(this).closest('.elementor-widget-uael-modal-popup').attr('data-id');
//        var data_modal =$(this).attr('data-modal');
//        console.log(data_id);
//        console.log(data_modal);
//     //    alert('');
//    });

//    $(window).on('load', function () {

//     var data_id, data_modal;
//         $('.popupfix  .elementor-widget-uael-modal-popup').each(function(i, obj) {
//             data_id = $(this).attr('data-id');
//             data_modal = $(this).find('.uael-modal-action.elementor-clickable.uael-trigger').attr('data-modal');
//             $(this).attr('data-id',data_id+i);
//             $(this).find('.uael-modal-action.elementor-clickable.uael-trigger').attr('data-modal',data_modal+i);
//         });
//         $('.uael-modal-parent-wrapper.uael-module-content').each(function(i, obj) {
//             data_id = $(this).attr('id');
//             data_modal = $(this).find('.uael-modal').attr('id');
//             $(this).attr('id',data_id+i);
//             $(this).find('.uael-modal').attr('id',data_modal+i);
//         });     
//     });



});
