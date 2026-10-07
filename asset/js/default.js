/*!
 * agile-generic-theme v2.0.0-dev
 * Base Omeka theme and front-end development system.
 * (c) 2026 
 * MIT License
 * https://github.com/agile-humanities/AgileBaseOmekaTheme.git
 */

/**
 *  @file 00_omekaGeneral.js
 *
 *  Modifications to the PTD form elements
 *
 */



// Apply aspect ratio attributes to images in the following containers. Works with imageRatio.js in themesystem core.
const imageARScope = 'body > header, body > footer, main, #splash, #title';

/* eslint-disable max-len, no-underscore-dangle, no-console, no-control-regex*/

/*
 *    @file 01_masonryCardGrid.js
 *    @description  Adds the masonry library to card grid presentations.
 *    @usage  Add a .masonry-grid class to the card container. Only applies to desktop breakpoints by default
 *      adjust the masonryBreakpoint to breakpoint_mobile or breakpoint_tablet or 0 to change
 */

(function jQ($) {

    $(document).ready(function masonry() {
        let gridGapSize = 16; // should be value of rv($grid_gap_factor), in pixels

        let style = getComputedStyle(document.body);

        const masonryBreakpoint = breakpoint_desktop;

        // Grid gap size is set as a root variable in sass/40_ui/_browser_ui_definitions
        // It is used to ensure that masonry’s calculations work correctly

        if (typeof style.getPropertyValue('--grid-gap-size') !== 'undefined') {
            gridGapSize = parseInt(style.getPropertyValue('--grid-gap-size'));
        }

        const masonryContext = [
          ".masonry-grid"
        ];

        masonryContext.forEach(function masonryEach(selector) {

            let _this = $(selector);

            // Reroll masonry on resize. Works by toggling an attribute on the #collection-list element to trigger
            // the MutationObserver below, which then initializes / resets Masonry.
            // @todo: this should be debounced, but debounce functions aren't working as expected. Masonry may have its
            //   own resize flood control, or there may be some conflicts with the mututationObserver. Either way debounce
            //   functions didn't seem to be called.

            $(window).on("resize", function masonryResize() {
                if (_this.length > 0) {
                    let attr = _this.attr("resize");
                    if (typeof attr !== "undefined" && attr !== false) {
                        _this.removeAttr("resize");
                    } else {
                        _this.attr("resize", "");
                    }
                }
            });

            if (_this.length > 0) {

                function initCollectionBrowserGrid() {

                    if (_this.hasClass("grid") && window.outerWidth >= masonryBreakpoint) {
                        _this.imagesLoaded(function() {
                            _this.masonry({
                                "itemSelector": ".card",
                                "percentPosition": true,
                                "horizontalOrder": true,
                                "gutter": gridGapSize
                            });
                        });
                    }

                    if (_this.hasClass("list") || window.outerWidth < masonryBreakpoint) {

                        if (typeof _this.masonry === "function") {

                            // Note: masonry logs an error here but it's trapped and will not affect subsequent scripts
                            // @todo: figure out how to properly test to see if masonry is initialized

                            _this.masonry("destroy");

}

}

}

                initCollectionBrowserGrid();

                // The “grid” class is added via Javascript, so we need to watch for attribute changes to apply
                // masonry.

                let observer = new MutationObserver(initCollectionBrowserGrid);

                observer.observe(_this[0], {
                    "attributes": true
                });

}

});


    });

}(jQuery));

/**
 *  @file advancedSearchSupport.js
 *  @description Supports the transformation of the advanced search module’s UI into the Agile Collection Browser interface
 *
 */


const searchViewType = localStorage.getItem('search_view_type')

if (searchViewType === null) {
  localStorage.setItem('search_view_type', 'grid');
}


(function($) {

  $(document).ready(function() {
    const mobileFilterButton = $('#mobile-filter-button');
    const mobileCloseButton = $('#browser--mobile-close-btn');
    const mobileBrowseControls = $('#mobile-browse-controls');
    const facetSidebar = $('#browser-sidebar');
    const searchResultsHeader = $('.search-results-header');

    // Mobile browse controls

    mobileFilterButton.on('click',_toggleFilterOverlay);
    mobileCloseButton.on('click',_toggleFilterOverlay)
    // @todo: allow users to click off of filter overlay. To do this you must prevent propagation if a user selects a control element via event.stopPropagation()
    /*
    $('aside.search-facets').on('click',function(){
        if (window.outerWidth <= breakpoint_desktop) {
            _toggleFilterOverlay()
        }
    })
    */


    // Hide filter button if filter sidebar doesn’t exist

    if(facetSidebar.length === 0) {
      mobileFilterButton.hide();
    }

    // Position Mobile Paginator
    if (mobileBrowseControls.length > 0) {
      $('.pagination--mobile').appendTo(mobileBrowseControls);
    }

    // Resets the sidebar display status when the window is resized

    $(window).on('resize',() => {
        facetSidebar.attr('style', null)
        mobileCloseButton.attr('style', null)
      });

    function _toggleFilterOverlay() {
      // Set a delay to avoid animation race conditions
      const delay = () => {
        setTimeout(()=>{},window.heartbeat)
      }

      if (facetSidebar.length > 0) {
        facetSidebar.is(':hidden') ?
          facetSidebar.fadeIn(window.heartbeat,delay) :
          facetSidebar.fadeOut(window.heartbeat,delay);
      }
      if (searchResultsHeader.length > 0) {
        searchResultsHeader.is(':hidden') ?
          searchResultsHeader.fadeIn(window.heartbeat,function() { $(this).css('display','flex'); delay()}) :
          searchResultsHeader.fadeOut(window.heartbeat,delay);
      }
    }

    // Collection browser support

    let browseViewMode = localStorage.getItem('search_view_type');


    // theme templates now supply the user-configured default mode as a data attribute

    const itemBrowser =$('.item-browser');


    if (browseViewMode === null && itemBrowser.length > 0) {
      browseViewMode = itemBrowser.attr('data-gridlistmode') ?? null;
    }

    if (browseViewMode !== null) {
      const browserUIbuttons =  $('.search-results-header .search-view-type');
      browserUIbuttons.each(function(){
        // Manage active state classes and icons.
        $(this).removeClass('active');
        $(this).find('img').trigger('switchtoinactive').removeClass('active'); // custom trigger in js/rollover.js

        // (Advanced Search Module) browse mode is handled via Javascript. This swaps the icons.

        $(this).on('click',function(e){
          $(this).find('img').trigger('switchtoactive').addClass('active');
          $(this).siblings().each(function(){
            // @todo: img.trigger('switchtoinactive') should work, but it does not.
            const img = $(this).find('img');
            img.attr('src',img.attr('data-src'));
            img.removeClass('active');
          });
        });

        if ($(this).hasClass('search-view-type-' + browseViewMode)) {
          $(this).addClass('active');
          $(this).find('img').trigger('switchtoactive').addClass('active'); // custom trigger in js/rollover.js
        }

      });
    }


    // Modify browse collection search button to conform to design
    //$('#form-search').find('button.search-submit').attr('aria-describedby','Submit search request').html('');

    $('#form-search').find('> .field').wrapAll('<div class="search-fields-wrapper">');

    // Reset button is not fully implemented. See advanced search module search.js
    $('#facets-reset, #search-reset').on('click', function () {
      const url = window.location.href;
      window.history.pushState({}, '', url.split(/[?#]/)[0]);
      window.location.reload();
    });

    // Open facet details if an item is checked.

    $('.search-facet details').each(function() {
      var open = false;
      $(this).find('input').each(function() {
        if ($(this).is(':checked')) {
          open = true;
        }
      });

      if(open === true) {
        $(this).attr('open','');
      }
    })

    // See more/less facet options

    $('.facet').each(function (i) {
      const facet = $(this);
      const visibleOptions = parseInt(facet.attr('data-visible-options'));
      const facetOptions = facet.find('.search-facet-items > *');

      // All items are marked inactive by default
      // Show active options
      if (visibleOptions > 0) {
        facetOptions.each(function (i) {
          if (i<visibleOptions) {
            $(this).css('display','flex');
            $(this).removeClass('inactive');
          }
        });
      } else {
        facetOptions.css('display','flex');
      }

      const facetExpandBtn = facet.find('.facet--expand');
      const facetCollapseBtn = facet.find('.facet--collapse');

      // Show a set of options on click

      facetExpandBtn.on('click',function(e) {
        facet.find('.inactive').each(function (i) {
          if (i<visibleOptions) {
            $(this).css('display','flex');
            $(this).removeClass('inactive');
          }
        });

        // Hide button if there are no more inactive options to show
        if(facet.find('.inactive').length == 0) {
          $(this).hide();
        }

        // Show the “Fewer options” button
        facetCollapseBtn.show()

      })

      // Hide a set of options on click
      facetCollapseBtn.on('click',function(e) {
        const activeOptions = facetOptions.not('.inactive');
        const activeCount = activeOptions.length;
        activeOptions.each(function (i) {
          if (i > activeCount - visibleOptions) {
            $(this).addClass('inactive');
            $(this).css('display','none');
          }
        });

        // Hide collapse button if the minimal set of options are visible
        if(facetOptions.not('.inactive').length <= visibleOptions) {
          $(this).hide();
        }

        // Make sure the “More options” is visible
        facetExpandBtn.show()

      })

    });

    /* Apply Select2 to Advanced Search Filters when dynamically created. */

    let observer = new MutationObserver(mutations => {

      for(let mutation of mutations) {

        for(let node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          updateSelect(node);
          // Check to see if child nodes of newly created element are select elements.
          if (node.hasChildNodes()) {
            for (const childNode of node.childNodes) {
              if (!(childNode instanceof HTMLElement)) continue;
              updateSelect(childNode);
            }
          }
        }
      }

    });

    function updateSelect(element) {
      // Ignore non-select elements
      if (element.tagName != "SELECT") {
        return;
      }

      const select = $(element);

      if (!select.data('select2')) { // Only update if not already a select2 element
        if (!select.hasClass('no-select2')) {
          select.select2({
            width: 'element',
            minimumResultsForSearch: 40
          });
        }
      }
    }

    const searchFilters = document.getElementById("search-filters");

    if(searchFilters instanceof Node) {
      observer.observe(searchFilters, {childList: true, subtree: true});
    }
  });

})(jQuery);

// clears the search form on click of the "x" icon
(function($) {   
  $(document).ready(function(){
    
    function clearSearchForm(searchForm) {
      if (searchForm.length) {
        const clearSearchBtn = searchForm.siblings(".search-form-clear");
        const searchTextInput = searchForm.children("input[type='text']");
        
        clearSearchBtn.on('click', function() {
          searchTextInput.val("");
        });
      };
    };
    
    const welcomeSearchForm = $('#welcome-search #search-form');
    const navSearchForm = $('#nav-search #search-form');
    
    clearSearchForm(welcomeSearchForm);
    clearSearchForm(navSearchForm);

  });
})(jQuery);
/**
 *  @file extendTextUI.js
 *
 *  A mechanism to show and hide additional flowed text
 *
 */   
(function($) {   
  $(document).ready(function() {      
    $('.extended-text').each(function(){
      var bio = $(this).find('.body');
            
      if (bio.length > 0) {
        
        if(bio.children().length > 1) {
          
          
          var first = bio.children().first().clone();
                    
          bio.children().first().remove();
          bio.children().wrapAll('<div class="extended"></div>');
          bio.prepend(first);
          
          var extended = bio.find('.extended');
                    
        
          var expand = $("<a class='extend-ui expand'>Read more</a>");
          var collapse = $("<a class='extend-ui collapse'>Close</a>");
          
          expand.on('click tap',function(){
            extended.slideDown(window.animation.slideTransition);
            expand.fadeOut(window.animation.slideTransition,function(){
              collapse.fadeIn(window.animation.slideTransition).css('display','flex'); // defaults to display: inline ??
            });
          });
          
          collapse.on('click tap',function(){
            extended.slideUp(window.animation.slideTransition);
            collapse.fadeOut(window.animation.slideTransition,function() {
              expand.fadeIn(window.animation.slideTransition);
            });
          });
          
         extended
            .after(expand)
            .after(collapse);
          
        }
      }
      
    });
  });
})(jQuery);

/**
 *  @file formElements.js
 *
 *  Modifications to the PTD form elements
 *
 */

(function($) {

    $(document).ready(function() {
        // Apply Select2 library to select elements.
        // @todo: Need to remove contextual search from multiple select elements

        $('select').each(function() {
          const select = $(this);

          if (!select.hasClass('no-select2')) {
            $(this).select2({
              width: 'element',
              minimumResultsForSearch: 40
            });
          }
        });
    });

})(jQuery);

(function ($) {
    $(document).ready(function () {
	    var body = $('body');
	    
	    if ($('#user-bar').length > 0) {
		    body.addClass('has-admin-bar');
	    }
	    
	    if ($('#homepage-splash').length === 0) {
		    body.addClass('has-top-nav');
	    }
    });
    
})(jQuery);




/**
 *  @file menuSuperfish.js
 *
 *  Applies the Superfish menu library to Omeka’s main navigation.
 *  The superfish library is added via npm and its supporting js/css rolled into the asset folder via gulp build.
 *
 */

(function($) {
  $(document).ready(function() {

    // Use superfish for desktop only

    const mainMenu = $('#main-nav > ul');
    mainMenu.addClass('sf-menu');  // Adds default superfish styles

    if (mainMenu.length > 0) {
      mainMenu.superfish({});
    }

  });

})(jQuery);

(function($) {
  $(document).ready(function() {
    
    var mobileNavIcon = $('#mobile-menu--button, #mobile-menu--close');
    var mobileMenu = $('#mobile-menu--container');
 
    mobileNavIcon.on('click', function () {
    mobileMenu.slideToggle("fast");
  });

  });
  
})(jQuery);




/**
 *  @file omekaAgileMediaDownloadSupport.js
 *
 *  Moves download buttons in the Media Item resource block to the Item header.
 *  See AgileThemeTools/src/Media/FileRenderer/TextRenderer render() for backend.
 */

(function($) {
  $(document).ready(function() {
    if ($('.item-viewer .download-media').length > 0 && $('.item-info .download').length > 0) {
      $('.item-viewer .download-media').each(function() {
        $(this).appendTo($('.item-info .download'));
      });
    }
  })})(jQuery);


(function($) {
  $(document).ready(function() {

    const wrappingClasses = ['full-width','inset','inset-text','wide','extra-wide','section-list-cards'];

    $('#content-stack > * > *').each(function() {
      const _this = $(this);
      const children = _this.find('> *');

      children.each(function(){
        const child = $(this);
        wrappingClasses.map(function(className) {
          if (child.hasClass(className)) {
            _this.addClass(className);
          }
        });
      })

    });

  });
})(jQuery);

(function($) {
  $(document).ready(function() {

    const panelNames = ['description', 'metadata', 'transcription'];
    const panelMinHeight = 400;

    // Each tab container is handled on its own, so its tabs only switch its own panels.

    $('.container-with-tabs-and-panels').each(function() {

      const container = $(this);
      const tabs = container.find('a.tab-ui--control');
      const panels = {};

      panelNames.forEach(function(name) {
        panels[name] = container.find('.' + name + '-panel');
      });

      if (panels.metadata.length === 0) {
        return;
      }

      function showPanel(name) {
        panelNames.forEach(function(panelName) {
          panels[panelName].toggle(panelName === name);
        });
        tabs.each(function() {
          $(this).toggleClass('active', $(this).hasClass(name + '-tab'));
        });
      }

      showPanel('description');

      tabs.on('click', function(e) {
        e.preventDefault();
        const tab = $(this);
        const name = panelNames.find(function(panelName) {
          return tab.hasClass(panelName + '-tab');
        });
        if (name) {
          showPanel(name);
        }
      });

      // Legacy Item Header only: hold the panels to the viewer's height and scroll them.
      // The Item Summary block lets its panels size to their content.

      const itemInfo = container.closest('.item-info');

      if (itemInfo.length === 0) {
        return;
      }

      const itemViewer = $('.item-viewer');
      const descriptionPanel = panels.description;
      const metadataPanel = panels.metadata;

      function setPanelHeight() {
        if ($(window).width() < breakpoint_desktop) {
          descriptionPanel.css('height','auto');
          metadataPanel.css('height','auto');
          descriptionPanel.css('overflow-y', 'auto');
          metadataPanel.css('overflow-y', 'auto');
        } else {
          let panelOffset =  descriptionPanel.offset().top - itemInfo.offset().top - 20; // offset needs fudge factor – margin issues?
          let panelBaseHeight = itemViewer.length > 0 && itemViewer.height() > panelMinHeight ? itemViewer.height() : (descriptionPanel.height() > panelMinHeight ? descriptionPanel.height() : panelMinHeight);
          let panelHeight = panelBaseHeight - panelOffset;
          descriptionPanel.height(panelHeight);
          metadataPanel.height(panelHeight);
          descriptionPanel.css('overflow-y', 'scroll');
          metadataPanel.css('overflow-y', 'scroll');
        }
      }

      setPanelHeight();

      $(window).resize($.debounce(100,setPanelHeight));
    });
  });

})(jQuery);

/**
 *  @file ctcMiradorAriaSupport.js
 *
 *  Adds an aria-describedby label to Mirador viewer that points to descriptive text.
 */

(function($) {
  $(document).ready(function() {
    $('#mirador-1').attr('aria-describedby','viewer-description');
  })})(jQuery);

(function ($) {
    $(document).ready(function () {
        const markers = $('.pagination--bullets');

        if (markers.length > 0) {

            // Data from hidden Omeka paginator fields

            const perPage = parseInt($('.per-page').first().text());
            const totalItems = parseInt($('.number-of-items').first().text());
            const endItemCounter = parseInt($('.end-item-counter').first().text());
            const pageCount = parseInt($('.pagination--count').first().text());
            const activePage = parseInt(markers.find('a.active').attr('data-pagenumber'));

            // An array that lists the markers that should be visible. Shows the first two pages, the last two pagesm
            // and one page around active pages.

            const visibleMarkers = [...new Set([1, 2, activePage, activePage - 1, activePage + 1, pageCount, pageCount - 1])].sort((a,b) => a-b);

            // Indicates where the gaps in the paginator are by comparing values in (sorted) visibleMarkers
            // with the previous one. A value difference of more than 1 indicates a gap.

            const gaps = visibleMarkers.map((a,i) => {
                const prev = i - 1 > -1 ? visibleMarkers[i-1] : null;
                return prev !== null &&  a - prev !== 1 ? a - 1 : null;
            }).filter((a) => a !== null);

            markers.find('li').each(function () {
                const item = $(this);
                const marker = item.find('> a');
                const page = parseInt(marker.attr('data-pagenumber'));
                if (gaps.includes(page)) {
                    item.after("<li class='pagination--gap'>...</li>");
                }

                item.hide();

                if (visibleMarkers.includes(page)) {
                    item.show();
                }

            });
        }

        // change color of diamond marker representing current page
        // var s = $('.start-item-counter').first().text();
        //var t = (s/perPage);
        //var u = Math.ceil(t);
        //$('.bullet-pages > li > a').removeClass('active');
        //$('.bullet-pages').find('> li:nth-of-type(' + u.toString() + ') > a').addClass('active');

    });
})(jQuery);

// add the "has-three-cards" class in the featured exhibits block
// when there are three attachments
(function($) {
  $(document).ready(function(){
    const featuredExhibitsBlock = $('.site-link-cards');

    if (featuredExhibitsBlock.length) {
      featuredExhibitsBlock.each(function() {
        const NUMBER_OF_ATTACHMENTS = 3;
        const cards = $(this).children('.link-card');

        if (cards.length === NUMBER_OF_ATTACHMENTS) {
          $(this).addClass('has-three-cards');
        }
      });
    }

    const scrollDownBtn = $('.scroll-down-btn');

    scrollDownBtn.on('click', function() {
      $('html, body').animate({
        scrollTop: featuredExhibitsBlock.offset().top
      });
    });


  });
})(jQuery);

// Adds "slide-full-screen" class to the slideshow on click of the full screen button
(function($) {  
  $(document).ready(function() {
    const slideshow = $('.slideshow');
    
    if (slideshow.length) {
      // function that takes the browser specific full screen event 
      // and document property to access the element in full screen mode
      function changeSlideToFullScreen(fullScreenEvent, fullScreenElementProperty) {
        $(document).on(fullScreenEvent, function(){
          const slickTrack = $('.slick-track');
          
          if (document[fullScreenElementProperty]) {
            const slideshowIsFullscreen = document[fullScreenElementProperty].classList.contains('slideshow');
            
            if (slideshowIsFullscreen) {
              slideshow.slick('reinit');
              slickTrack.addClass('slide-fullscreen');
            };
          };
          
          if (!document[fullScreenElementProperty]) {
            slickTrack.removeClass('slide-fullscreen');
            slideshow.slick('reinit');
          };
        });
      };

      changeSlideToFullScreen('fullscreenchange', 'fullscreenElement');
      // for safari fullscreen
      changeSlideToFullScreen('webkitfullscreenchange', 'webkitFullscreenElement');
   
    };

  });  
})(jQuery);

// handles replacing standard html select box 
(function($) {    
  $(document).ready(function() {
    var mobile = true;
    var toggle = true;
    var $marginLefty = $("#contact")

    $('#splash-contact-btn').click(function(){ 
      var win = window.innerWidth; 
      if (win <= 767) {       
          mobile = true;
          setContact();
      }
      if (win >= 768) {       
          mobile = false; 
          setContact();
      }
    });
function setContact() {
  if (mobile === true){
    $marginLefty.css("margin-left", "unset");
    $marginLefty.css("width", "100%");
    $("#contact").animate({height:'toggle'},350);
    $("#splash-contact-btn").css("opacity", "0.3");
    toggle = toggle === true ? false : true;
  }
  else {
    $("#contact").css("display", "block");
    $("body").css("overflow-x", toggle === true ? "hidden" : "unset");
    $marginLefty.animate({ marginLeft: parseInt($marginLefty.css('marginLeft'),10) == 0 ? $marginLefty.outerWidth() : 0 }).promise()
    .done(function(){hideSplashContact()});
    $("#splash-contact-btn").css("opacity", toggle === true ? "0.3" : "1");
    $("#welcome-block").css("background-position",  parseInt($marginLefty.css('height'),10) == 0 ?  " -9999px" : "right bottom" );
    $("#welcome-block").css("background-position",  parseInt($marginLefty.css('marginLeft'),10) == 0 ?  "right bottom" : "-9999px" );
    toggle = toggle === true ? false : true;
  }
}
      var win = window.innerWidth;
      if (win <= 767) {       
          mobile = true;
          $marginLefty.css("margin-left", "unset");
          $marginLefty.css("width", "100%");
      }
      if (win>= 768) {       
          mobile = false;  
          $marginLefty.css({ marginLeft: parseInt($marginLefty.css('marginLeft'),10) == 0 ? $marginLefty.outerWidth() : 0 });
      }

    $('#contact .close_btn').click(function(){ 
      var win = window.innerWidth;
      if (win <= 767) {       
          mobile = true;
               }
      if (win >= 768) {       
          mobile = false;    
      }
      if (mobile === true){
        $("#contact").animate({height:'toggle'},350);
      }
      else {
        $marginLefty.animate({ marginLeft: parseInt($marginLefty.css('marginLeft'),10) == 0 ? $marginLefty.outerWidth() : 0 }).promise();
      }
      toggle = toggle === true ? false : true;
      $("#splash-contact-btn").css("opacity", "1");
    });

    function hideSplashContact(){
      $("#contact").css("display", parseInt($marginLefty.css('marginLeft'),10) == 0  ? "block" : "none");
    }
  });  
})(jQuery);