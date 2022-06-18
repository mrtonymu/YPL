jQuery(document).ready(function($) {
	// console.log('HELLOO');

	$(window).load(function() {
		$("#menu-item-7659 .uael-has-submenu-container>a").trigger("click");
		  
		$('.toggle-openbydefault .elementor-tab-title').removeClass('elementor-active');
		$('.toggle-openbydefault .elementor-tab-title').addClass('elementor-active');
		$('.toggle-openbydefault .elementor-tab-content').css( 'display', 'block' );

		$(".kfp-left").click(function(){
			$( ".kfp-carousel .elementor-swiper-button-prev" ).trigger( "click" );
		});
		$(".kfp-right").click(function(){
			$( ".kfp-carousel .elementor-swiper-button-next" ).trigger( "click" );
		});

				  
	});

	// Add space for Elementor Menu Anchor link
	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addFilter( 'frontend/handlers/menu_anchor/scroll_top_distance', function( scrollTop ) {
			return scrollTop - 40;
		} );
	} );
});

