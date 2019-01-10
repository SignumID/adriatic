SnTUtils.Loader.Html = '<div class="loader-full-container" id="loader"><div class="lightbg"></div><div class="loader-content"><h3>Molimo pričekajte trenutak...</h3><p>Vaš zahtjev se obrađuje</p><img src="/webResources/images/ostalo/loader.gif"></div></div>';
SnTUtils.Loader.CssClass = 'loader-full-container';

$(document).ready(function () {

    try {
        $(".over-trigger-fixed").overlay({mask: {color: '#000', loadSpeed: 150, opacity: 0.5}, speed: 50, fixed: true, top: 'center', left: 'center'});
        $(".over-trigger").overlay({mask: {color: '#000', loadSpeed: 150, opacity: 0.5}, speed: 50, fixed: false, top: 'center', left: 'center'});
    } catch (e) { console.log(e); }

    

    $(".accordion-toggler").on( "click", function() {
        $(this).parents('.subsection-accordion').toggleClass("open");
    });

    var url = window.location.href;
    if(url.indexOf("?") > -1) {
        var scrollTo = SnTUtils.QueryString.Items['scrollto'];
        if (scrollTo !== undefined && scrollTo !== null && scrollTo !== '' && $("#" + scrollTo).length > 0) {
            $('html, body').animate({
                scrollTop: $("#" + scrollTo).offset().top
            }, 1000);
            
        }
    }

});


SnTUtils.Loader.BeforeShow = function () {
    try {
        PopUpLayer.hide();
    } catch (e) {
        SnTUtils.HandleException(e);
    }
};
SnTUtils.MessageControl.ShowLoaderOnRedirect = true;
$(function () {

    $.ajaxSetup({
        cache: false,
        statusCode: {
            404: function () {
                window.location.href = "/404.html"
            }
        },
        beforeSend: function (xhr) {
            //if($.browser.msie)
            {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Pragma", "no-cache");
            }
        }
    });

    $('.showLoaderOnClick:not(.noLoader):not(select)').live("click", SnTUtils.Loader.Show);
    $('select.showLoaderOnClick:not(.noLoader)').live("change", SnTUtils.Loader.Show);
});

SnTUtils.Confirm = function (message) {
    var confirm = window.confirm(message);
    if (!confirm) {
        SnTUtils.Loader.Hide();
    }
    return confirm;
}

$(document).ready(function () {

    /***cookies notification***/
    $('#cookies-notification-accept-cookie').click(function () {
        clearTimeout(cookieTimeout);
        $('.cookies-notification').fadeOut(200);

        var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Consents.ConsentService.asmx");
        if (service) {
            service.Invoke("SaveCookieConsent", { "level": 2 },
                function (res) { console.log(">> Success!"); },
                function (e) { alert("Dogodila se greška prilikom spremanja postavki"); console.error(">> Error! ConsentService call failed!"); });
        }

    });

    var cookieConsentValue = readCookie("CookieConsent");
    console.log('>> cookieConsentValue: ' + cookieConsentValue);
    if (!cookieConsentValue || cookieConsentValue === "0") {
        if (window.location.href.indexOf("kolacici-pravila") >= 0) {
            console.log(">> Not showing notification -> Cookie policy page opened!");
            return;
        }
        $('.cookies-notification').delay(1000).slideDown(600);
        var cookieTimeout = setTimeout(function () {
            $('.cookies-notification').slideUp(600);
        }, 60000);
    }
});

/* Cookie Handling */
function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function RegisterVirtualServiceNew() {
    PopUpLayer.display(document.getElementById("windowModalAddService"), "popup_background", 50, document.getElementById("modal_add_new_service_close"));
}

// TopNavigation
$(document).ready(function() {
    var $window = jQuery(window),
        timeoutId,
        timeoutId2;

    jQuery('#master-main-nav .page-control > li').mouseover(function () {
        var $this = $(this);

        if ($this.children('#main-nav-search').length > 0 && jQuery('#master-main-nav .page-control > li > .visible').length > 0) {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId2);
        }

        if ($window.width() > 767) {
            $this.children('a').addClass('active');
            if (jQuery('#main-nav-search.visible').length > 0 && !$this.children('#main-nav-search').length > 0) {
                timeoutId2 = setTimeout(function () {
                    $this.children('.dropdown').removeClass('hidden').addClass('visible');
                }, 300);
            } else {
                $this.children('.dropdown').removeClass('hidden').addClass('visible');
            }
        }
    }).mouseleave(function () {
        var $this = $(this);
        if ($window.width() > 767) {
            if ($this.children('#main-nav-search.visible').length > 0) {
                timeoutId = setTimeout(function () {
                    $this.children('a').removeClass('active');
                    $this.children('.dropdown').addClass('hidden').removeClass('visible');
                }, 300);
            } else {
                $this.children('a').removeClass('active');
                $this.children('.dropdown').addClass('hidden').removeClass('visible');
            }

        }
    }).on('click', function () {
        var $this = $(this);
        if ($window.width() > 767) {
            $this.children('a').addClass('active');
            $this.children('.dropdown').removeClass('hidden');
            $('#q').focus();
        }
    });


    jQuery('#master-main-nav .page-control > li > div.dropdown').mouseleave(function () {
        var $this = $(this);
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
        if ($window.width() > 767) {
            $this.prev().removeClass('active');
            $this.addClass('hidden').removeClass('visible');
        }
    });


    jQuery('#master-header').mouseleave(function () {
        clearTimeout(timeoutId2);
    });

    jQuery('#master-main-nav .page-switch').mouseover(function () {
        clearTimeout(timeoutId2);
    });

    /* Mobilna verzija */
    var loginUrl = $('#user-shortcuts-toggler').attr('href');
    $window.resize(function () {
        if ($window.width() <= 767) $('#user-shortcuts-toggler').attr('href', 'javascript:void(0);');
        else $('#user-shortcuts-toggler').attr('href', loginUrl);
    });
    $('.level-1-ul.page-control > li > a').click(function () {
        if ($window.width() <= 767) {
            $(this).toggleClass('active').parent().siblings().children('a').removeClass('active').nextAll('.dropdown').addClass('hidden');
            if ($(this).hasClass('main-menu-trigger')) {
                $('.section-nav-2014').toggleClass('shown');
            } else {
                $('.section-nav-2014').removeClass('shown');
                $(this).nextAll('.dropdown').toggleClass('hidden');
                if ($(this).attr('id') === 'search-form-toggler' && $(this).hasClass('active')) {
                    $('#q').focus();
                }
            }
        }
    });
});




$(document).ready(function() {

        
    var $chatoverTrigger = $(".chatover-trigger");
    if ($chatoverTrigger.length > 0) {
        $chatoverTrigger.overlay({
            mask: {
                color: '#000',
                loadSpeed: 150,
                opacity: 0.5
            },
            speed: 50,
            fixed: false,
            top: 'center',
            left: 'center'
        });
    }    

    if (window.location.pathname.split('/')[1] == 'poslovni') {
        $("input[value=posl]").attr('checked', 'checked');
        showlabels();
    } else {
        $("input[value=priv]").attr('checked', 'checked');
        showlabels();
    }
    $("input[name=chatkorisnik]").click(showlabels);

    $("#chatpitanje-submit").click(function () {
        var reason = 0;

        //required
        polja = $("#offlinechatbox").find("input").not(":radio");
        if (polja.length > 0) {
            $.each(polja, function () {
                $(this).removeClass("error");
                if ($(this).val().length < 6) {
                    $(this).addClass("error");
                    reason = 1;
                }
            });
        }

        //mail
        $("#chatemail").removeClass("error");
        var mailadr = $("#chatemail").val();
        var atpos = mailadr.indexOf("@");
        var dotpos = mailadr.lastIndexOf(".");
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= mailadr.length) {
            $("#chatemail").addClass("error");
            reason = 5;
        }

        if (reason == 0) {

            $("#chaterror-box").hide();

            $.ajax({
                type: 'GET',
                url: "https://tc.t-com.hr/iframes/offline-chat.asp",
                data: {
                    ime: $("#chatime").val(),
                    kontakt: $("#chatkontakt").val(),
                    email: $("#chatemail").val(),
                    pitanje: $("#chatpitanje").val(),
                    ktip: $("input[name=chatkorisnik]:checked").val()
                },
                dataType: "jsonp",
                crossDomain: true,
                cache: false,
                success: function (data) {
                    $("#chatformfields").hide();
                    $("#chatpitanje-done").show();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //alert(errorThrown);
                    alert("Došlo je do greške prilikom upisa.");
                }
            });

        } else {

            //error
            $("#chaterror-box").show();
            return false;
        }

    });
});

function showlabels() {
    if ($("input[name=chatkorisnik]:checked").val() == "posl") {
        $("label[for=chatime]").text("Naziv firme");
    } else {
        $("label[for=chatime]").text("Ime i prezime");
    }
}

function showofflinechat() {
    $("#chatformfields").find("input:not(:radio), textarea").val("");
    $("#chatformfields").show().siblings("div").hide();
    $("#offlineactivator").overlay().load();
}

$(document).ready(function() {

	/* always on
    if ($('.atss').length > 0) {
        var chatTimeout = null,
            chatCounter = 0;
            $callButton = $('.atss .service1'),
            $chatButton = $('.atss .service2');

        var checkChat = function () {
			//only sales
			if ( lpTag.section.indexOf("ht-service")=="-1" ) {
				
				if ($chatButton.find('img[src*="chat-me.png"]').length > 0) {
					$callButton.removeClass('hidden');
					//$chatButton.find('img[src*="chat-init-button.png"]').attr('src', 'https://www.hrvatskitelekom.hr/webresources/live-person-chat/chat-me.png')
					$chatButton.removeClass('hidden');
					clearTimeout(chatTimeout);
				} else if ($chatButton.find('img[src*="pitajte-nas-busy.png"]').length > 0) {
					$callButton.removeClass('hidden');
					clearTimeout(chatTimeout);
				} else if ($chatButton.find('img[src*="pitajte-nas-online.png"]').length > 0) {
					$callButton.removeClass('hidden');
					$chatButton.find('img[src*="pitajte-nas-online.png"]').attr('src', 'https://www.hrvatskitelekom.hr/webresources/live-person-chat/chat-me.png')
					$chatButton.removeClass('hidden');
					clearTimeout(chatTimeout);
				}
				 else if ($chatButton.find('img[src*="pitajte-nas-offline.png"]').length > 0) {
					$callButton.removeClass('hidden');
					clearTimeout(chatTimeout);
				} else if (chatCounter > 50) {
					$callButton.removeClass('hidden');
					clearTimeout(chatTimeout);
				} else {
					chatCounter++;
					chatTimeout = setTimeout(checkChat, 500);
				}
				
			}
        }

        checkChat();
		
		$('.atss .feedback').removeClass('hidden');
    }
	*/
 
    $(".js-callback-submit").click(function () {

        var $this = $(this),
            $form = $($(this).attr('rel')),
            windowLocationHref = window.location.href,
            ime = $form.find('.js-callback-name').val(),
            kontakt = $form.find('.js-callback-phone').val();
            email = '',
            pitanje = $(this).attr('rel') === '#callback-form' ? 'Callback forma.' : 'Callback overlay.',
            ktip = windowLocationHref.indexOf('/poslovni') < 0 ? 'priv' : 'posl',
            callbackCookie = SnTUtils.Web.Cookies.Get('callback');

        $form.find(".js-callback-name-error").addClass('hidden').parent().removeClass('field-error');
        $form.find(".js-callback-phone-error").addClass('hidden').parent().removeClass('field-error');

        if (ime.length < 1 && (kontakt.length < 1 || isNaN(kontakt))) {
            $form.find(".js-callback-name-error").removeClass('hidden').parent().addClass('field-error');
            $form.find(".js-callback-phone-error").removeClass('hidden').parent().addClass('field-error');
            return;
        } else if (ime.length < 1 ) {
            $form.find(".js-callback-name-error").removeClass('hidden').parent().addClass('field-error');
            return;
        } else if (kontakt.length < 1|| isNaN(kontakt)) {
            $form.find(".js-callback-phone-error").removeClass('hidden').parent().addClass('field-error');
            return;
        }

        if (callbackCookie === kontakt) {
            $form.find(".js-callback-form").addClass('hidden').parent().removeClass('field-error');
            $form.find(".js-callback-done").removeClass('hidden').parent().addClass('field-error');
            return;
        } else {
            SnTUtils.Web.Cookies.Set('callback', kontakt, 1);
        }



        $.ajax({
            type: 'GET',
            url: "https://tc.t-com.hr/iframes/offline-callback17.asp",
            data: {
                ime: ime,
                kontakt: kontakt,
                email: email,
                pitanje: pitanje,
				/* BT */
				kampanja: $("#txtCampaign").val(),
                ktip: ktip
            },
            dataType: "jsonp",
            crossDomain: true,
            cache: false,
            success: function (data) {
                $form.find(".js-callback-form").hide();
                $form.find(".js-callback-done").show();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Došlo je do greške prilikom upisa.");
            }
        });

    });
	
	
	//feedback
	
    $(".js-comment-submit").click(function () {


        var $this = $(this),
            $form = $($(this).attr('rel')),
            windowLocationHref = window.location.href,
            komentar = $form.find('.js-comment').val();

        $form.find(".js-comment-error").addClass('hidden').parent().removeClass('field-error');

        if ( komentar.length < 10 ) {
            $form.find(".js-comment-error").removeClass('hidden').parent().addClass('field-error');
            return;
        }


        $.ajax({
            type: 'GET',
            url: "https://tc.t-com.hr/iframes/sas-anketa.asp",

            data: {
                komentar: komentar
            },

            dataType: "jsonp",
            crossDomain: true,
            cache: false,
            success: function (data) {
                $form.find(".js-comment-form").hide();
                $form.find(".js-comment-done").show();
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert("Došlo je do greške prilikom upisa.");
            }

        });

    });
	
});


$(document).ready(function() {

    $('.level-1-li > .menu-trigger').click(function () {
        $(this).toggleClass('active').nextAll('.level-2-ul').toggle();
        $(this).parent().siblings().children('.menu-trigger').removeClass('active').nextAll('.level-2-ul').hide();
    });

    $('.section-nav-2014 .level-1-li.level-1-li-has-children').mouseenter(function () {
        var trigerID = $(this);
        var trigerUrl = $(trigerID).children('a').data('url');
        if ($(window).width() > 767) {
            setTimeout(function () {
                $(trigerID).children('a').attr('href', trigerUrl);
            }, 200);
        } else {
            $(trigerID).children('a').attr('href', trigerUrl);
        }
    }).mouseleave(function () {
        $(this).children('a').removeAttr('href');
    });

    $('div.section-nav-2014 > ul.level-1-ul > li.level-1-li > a').each(function () {
        if ($(this).data('url') && $(this).data('url').split('/')[1] == 'poslovni') {
            if (window.location.pathname.indexOf("google-adwords") > 1) {
                $("#main-menu-item-internet").addClass('current');
            } else {
                //default
                if ($(this).data('url').split('/')[2] == window.location.pathname.split('/')[2]) {
                    $(this).parent().addClass('current');
                }
            }
        } else {
            if ($(this).data('url') && $(this).data('url').split('/')[1] == window.location.pathname.split('/')[1]) {
                $(this).parent().addClass('current');
            }
        }
    });
    
});


(function (window, document, $, SnTUtils) {

    "use strict";

    function SetNotificationStatus(isUserNotified, notificationType) {
        var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Notification.NotificationService.asmx");
        service.Invoke("SetNotificationStatus", {
            isUserNotified: isUserNotified,
            notificationType: notificationType
        }, function () {}, function () { console.log('User Notification Error'); }, {
            Loader: false
        });
    }
    
    $(document).ready(function() {
        var $userNotification = $('#modal_user_notification'),
            userNotificationType = $userNotification.data('notificationtype');
            
        if ($userNotification.length > 0) {
            SetNotificationStatus(true, userNotificationType);
            $userNotification.overlay({
                mask: {
                    color: '#000',
                    loadSpeed: 150,
                    opacity: 0.5
                },
                speed: 50,
                fixed: false,
                top: 'center',
                left: 'center'
            });
            $userNotification.overlay().load();
        }
    });

}(window, document, jQuery, SnTUtils));

/* Fake Overlay Close Button */

(function (window, document, $) {

    "use strict";
    $(document).ready(function(){
        var $closeLink = $('.back-link-x'),
            $backLink = $('[data-backurl]'),
            documentReferrer = document.referrer,
            currentURL = window.location.href,
            backUrl = SnTUtils.QueryString.Items['backurl'];

        $closeLink.on('click', function () {
            if (backUrl !== undefined && backUrl !== null && backUrl !== '') {
                window.location.href = backUrl;
            } else if (currentURL.indexOf('//www.hrvatskitelekom.hr/sso/maxtv-prijava') > 0 || currentURL.indexOf('test.hrvatskitelekom.hr/sso/maxtv-prijava') > 0 || currentURL.indexOf('staging.hrvatskitelekom.hr/sso/maxtv-prijava') > 0) {
                if (window.history.length > 1 && (SnTUtils.QueryString.Items['categoryname'] !== undefined || SnTUtils.QueryString.Items['process'] !== undefined)) {
                    window.history.back();
                } else if (SnTUtils.QueryString.Items['categoryname'] === 'MAXtv-SAT-paket') {
                    window.location = '/televizija/maxtv-sat';
                } else if (SnTUtils.QueryString.Items['categoryname'] === 'MAXtv-IP-TV-paket') {
                    window.location = '/televizija/maxtv';
                }  else {
                    window.location = '/';
                }
            } else if (currentURL.indexOf('//www.hrvatskitelekom.hr/webshop/televizija/programski-paketi/aktivacija') > 0 || currentURL.indexOf('test.hrvatskitelekom.hr/webshop/televizija/programski-paketi/aktivacija') > 0 || currentURL.indexOf('staging.hrvatskitelekom.hr/webshop/televizija/programski-paketi/aktivacija') > 0) {
                if (SnTUtils.QueryString.Items['categoryname'] === 'MAXtv-SAT-paket') {
                    window.location = '/televizija/maxtv-sat';
                } else if (SnTUtils.QueryString.Items['categoryname'] === 'MAXtv-IP-TV-paket') {
                    window.location = '/televizija/maxtv';
                }  else {
                    window.location = '/';
                }
            } else if(documentReferrer.indexOf('//www.hrvatskitelekom.hr') > 0 || documentReferrer.indexOf('test.hrvatskitelekom.hr') > 0 || documentReferrer.indexOf('staging.hrvatskitelekom.hr') > 0) {
                if (window.history.length > 1) {
					
					//skip sso
					if (documentReferrer.indexOf('/sso/') > 0) {
						
						if (documentReferrer.indexOf("BackUrl") > 0) {
							var targetstr = documentReferrer.substring(documentReferrer.indexOf("BackUrl"));
							window.location = decodeURIComponent(targetstr.substring(8, targetstr.indexOf("&")));
						}else{
							window.history.go(-2);
						}
						
					}else{
						window.history.back();
					}
					
					//window.history.back();
                } else {
                    window.location = documentReferrer;
                }
            } else if ($backLink.data('backurl')) {
                window.location = $backLink.data('backurl');
            } else if (currentURL.indexOf('//www.hrvatskitelekom.hr/poslovni') > 0) {
                window.location = '/poslovni';
            } else {
                window.location = '/';
            }
            return false;
        });

        $backLink.on('click', function () {
            var backLinkUrl = $(this).data('backurl');
            history.pushState("", document.title, backLinkUrl);
        });
    });

}(window, document, jQuery, SnTUtils));

/* Copyright the year */

(function (window, document, $) {
    var year = new Date().getFullYear();
    $(document).ready(function(){
        $('#the-year').html(year);
    });
}(window, document, jQuery));

/* Xmass 2015 */

/*

(function (window, document, $, SnTUtils) {

    "use strict";
        
    var redirect = true,
        currentUrl = window.location.href,
        redirectUrl = currentUrl.indexOf('//www.hrvatskitelekom.hr/poslovni') > 0 ? '/poslovni/blagdanski-izlog' : '/blagdanski-izlog';

    if (currentUrl.indexOf('//www.hrvatskitelekom.hr/poslovni/ict/upit') > 0) {
        redirect = false;
    } else if (currentUrl.indexOf('//www.hrvatskitelekom.hr/blagdanski-izlog') > 0 || currentUrl.indexOf('//www.hrvatskitelekom.hr/poslovni/blagdanski-izlog') > 0) {
        SnTUtils.Web.Cookies.Set('blagdanski-izlog', 'true', 90, '/');
        redirect = false;
    }

    if (SnTUtils.Web.Cookies.Get('blagdanski-izlog') !== "true" && redirect === true) {
        SnTUtils.Web.Cookies.Set('blagdanski-izlog', 'true', 90, '/');
        window.location = redirectUrl;
    }

}(window, document, jQuery, SnTUtils));

*/

(function (window, document, $, SnTUtils) {

    'use strict';
    $(document).ready(function() {
        var debugUserServices = SnTUtils.QueryString.Items['debuguserservices'] === 'True' ? '?debuguserservices=True' : '',
            contentURL = '/ajax/user/logged-in-user-services?' + debugUserServices,
            container = 'active-service-options',
            $userServices = $('#' + container),
            $servicesFullyLoaded = $userServices.find('span[data-verified=Verified]'),
            handleVPNPriService = function () {
                var $VPNPriMyAccountActiveServices = $userServices.find('input[data-isvpnpri=true], input[data-ismyaccount=true]'),
                    $VPNPriMyAccountSelectedService = $userServices.find('input[data-isvpnpri=true]:checked, input[data-ismyaccount=true]:checked'),
                    $VPNPriActiveServiceToSelect = $userServices.find('input[data-isvpnpri=true], input[data-ismyaccount=true]').first(),
                    mojRacunURL = '/vpn/moj-racun',
                    odabirBrojaURL = '/vpn/odabir-broja';

                if ($VPNPriMyAccountActiveServices.length === 1 && $VPNPriMyAccountSelectedService.length === 0) {
                    SelectRegisteredService($VPNPriActiveServiceToSelect.data('idtoken'), mojRacunURL, false);
                } else if ($VPNPriMyAccountActiveServices.length > 1 && $VPNPriMyAccountSelectedService.length === 0) {
                    SnTUtils.HttpContext.Response.Redirect(odabirBrojaURL);
                }
            },
            handleServices = function () {
                $servicesFullyLoaded = $userServices.find('span[data-verified=Verified]');
                var $VPNPriMyAccountServices = $userServices.find('input[data-isvpnpri=true], input[data-ismyaccount=true]'),
                    PINService = $userServices.data('ispinservice'),
                    currentURL = window.location.href;

                if (currentURL.indexOf("/vpn") > -1 || currentURL.indexOf("/webshop/moj-racun") > -1) {
                    if ($VPNPriMyAccountServices.length > 0) {
                        handleVPNPriService();
                    } else if (PINService !== true) {
                        setTimeout(function () {
                            SnTCms.MessageControl.ShowError('Nemate registriran niti jedan VPN broj.');
                        }, 1000);
                    }
                } else if ($servicesFullyLoaded.length === 0) {
                    setTimeout(insertLoggedInUserServices, 2000);
                }
            },
            insertLoggedInUserServices = function () {
                SnTUtils.Ajax.InsertContent({
                    Url: contentURL,
                    ShowLoader: false,
                    OnAjaxStop: handleServices
                }, container);
            };

        if ($userServices.length > 0) {
            handleServices();
        }

    });

}(window, document, jQuery, SnTUtils));


/* To Top Button */

$(document).ready(function(){
    
    var offset = 300,
        offset_opacity = 1200,
        scroll_top_duration = 700,
        $back_to_top = $('.cd-top');
    $(window).scroll(function(){
        ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if( $(this).scrollTop() > offset_opacity ) { 
            $back_to_top.addClass('cd-fade-out');
        }
    });
    
    $('a.cd-top[href^="#"]').on('click',function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 400, 'swing', function () {
            window.location.hash = target;
        });
    });

});

/* Search */

$(document).ready(function() {
    $("#search-start").click(function() {
        if($("#q").val().length > 1) {
            window.location="https://www.hrvatskitelekom.hr/rezultati-pretrazivanja/?q="+$("#q").val();
        }
    });
    $("#q").keyup(function(event){
        if(event.keyCode == 13){
            window.location="https://www.hrvatskitelekom.hr/rezultati-pretrazivanja/?q="+$("#q").val();
        }
    });
});


/* accordion remove #id */

$(document).ready(function () {
    $('.accordion-toggler').click(function () {
        var curentLocation = window.location.href,
            thisHref = $(this).attr('href');
        if (curentLocation.indexOf(thisHref) > 0) {
            history.pushState("", document.title, window.location.pathname);
        }
        return;
    });
});


(function($) {

  /**
   * Copyright 2012, Digital Fusion
   * Licensed under the MIT license.
   * http://teamdf.com/jquery-plugins/license/
   *
   * @author Sam Sehnert
   * @desc A small plugin that checks whether elements are within
   *     the user visible viewport of a web browser.
   *     only accounts for vertical position, not horizontal.
   */

  $.fn.visible = function(partial) {

      var $t            = $(this),
          $w            = $(window),
          viewTop       = $w.scrollTop(),
          viewBottom    = viewTop + $w.height(),
          _top          = $t.offset().top,
          _bottom       = _top + $t.height(),
          compareTop    = partial === true ? _bottom : _top,
          compareBottom = partial === true ? _top : _bottom;

    return ((compareBottom <= viewBottom) && (compareTop >= viewTop));

  };

})(jQuery);

$(document).ready(function(){
    var win = $(window);
    var allSections = $('.section');

    // Already visible modules
    allSections.each(function(i, el) {
      var el = $(el);
      if (el.visible(true)) {
        el.addClass('already-visible'); 
      } 
    });

    win.scroll(function(event) {
      allSections.each(function(i, el) {
        var el = $(el);
        if (el.visible(true)) {
          el.addClass('activate-animation'); 
        } 
      });
    });
});

$(document).ready(function(){
    function BackgroundAnimation (options) {
      _this = this;
      
      this.options = $.extend({
        el: '.magenta',
        animationWidth: 180,
        animationOffsetX: 10,
        animationSteps: 38,
        animationTotalSteps: 100,
        speed: 50
      }, options);
      
      this.element = $(this.options.el);
      this.currentStep = 0;
      
        if ( $( window ).width() > 768 ) {
            this.bindEvents();
            this.startAnimation();  
        }
        
    }

    BackgroundAnimation.prototype.bindEvents = function () {
        this.element.on('mouseenter', _this.restartAnimation);
      };
      
    BackgroundAnimation.prototype.animation = function () {
      this.currentStep = this.currentStep < this.options.animationTotalSteps ? _this.currentStep + 1 : 0;
      
      if (this.currentStep < this.options.animationSteps) {
        this.element.css('background-position', '-' + ( ( this.options.animationWidth * this.currentStep ) + this.options.animationOffsetX ) + 'px 0');
      }
      
      this.animationTimeout = setTimeout(function () {
        _this.animation();
      }, _this.options.speed);
    };
      
    BackgroundAnimation.prototype.startAnimation = function () {
      this.currentStep = 0;
      this.animation();
    };

    BackgroundAnimation.prototype.restartAnimation = function () {
      if (_this.currentStep > _this.options.animationSteps) {
        clearTimeout(_this.animationTimeout);
        _this.startAnimation();
      }
    };

    if ($('#main-menu-item-magenta').length > 0) {
        var options = {
          el: '#main-menu-item-magenta',
          animationWidth: 180,
          animationOffsetX: 10,
          animationSteps: 38,
          animationTotalSteps: 200,
          speed: 50
        };

        new BackgroundAnimation(options);
    }
    
});

// eCommerce

(function (window, document, SnTUtils, $, undefined) {
    
    SnTUtils.RegisterNameSpace('HT.ga');

    HT.ga.productList = {
        'event': 'productImpressions',
        'ecommerce': {
            'currencyCode': 'HRK',
            'impressions': {}
        }
    }

    HT.ga.promotionList = {
        'event': 'promoView',
        'ecommerce': {
            'promoView': {
                'promotions': {}
            }
        }
    }

    HT.ga.pushProductList = function () {
        var impressions = [],
            $devices = $('#device-list .device-item, #device-list-outlet .device-item, #device-list-handset .device-item'),
            $device, name, id, price, brand, catogory, variant, list = 'Search Results';

        for (var ii = 0; ii < $devices.length; ii++) {
            $device = $($devices[ii]);
            name = $device.data('ga-name');
            id = $device.data('ga-id');
            price = $device.data('ga-price');
            brand = $device.data('ga-brand');
            category = $device.data('ga-category');
            variant = $device.data('ga-variant');
            list = $device.data('ga-list');
            
            impressions.push(
                {
                   'name': name,
                   'id': id,
                   'brand': brand,
                   'list': list,
                   'position': ii
                }
            );
        }

        HT.ga.productList['ecommerce']['impressions'] = impressions.slice(0,40);
        dataLayer.push(HT.ga.productList);

        HT.ga.productList['ecommerce']['impressions'] = impressions.slice(41,impressions.length);;
        dataLayer.push(HT.ga.productList);
    }

    HT.ga.pushPromotionList = function () {
        var promotions = [],
            $promotions = $('[data-ga-promotion=visible]'),
            $promotion, id, name, creative, position, dimension9;

            for (var ii = 0; ii < $promotions.length; ii++) {
                $promotion = $($promotions[ii]);
                id = $promotion.data('ga-id');
                name = $promotion.data('ga-name');
                creative = $promotion.data('ga-creative');
                position = $promotion.data('ga-position');
                dimension9 = $promotion.data('ga-dimension9');

                promotions.push(
                    {
                       'id': id,
                       'name': name,
                       'creative': creative,
                       'position': position,
                       'dimension9': dimension9
                    }
                );
            }
        HT.ga.promotionList['ecommerce']['promoView']['promotions'] = promotions;

        dataLayer.push(HT.ga.promotionList);
    }

    $(document).ready(function () {
        if ( $('[data-ga-promotion=visible]').length > 0 ) {
            HT.ga.pushPromotionList();
        }

        $('#device-list, #device-list-outlet, #device-list-handset').on('click', '.device-item a', function (e) {
            var $this = $(this);
            var $device = $this.parents('.device-item');

            //e.preventDefault();

            name = $device.data('ga-name');
            id = $device.data('ga-id');
            price = $device.data('ga-price');
            brand = $device.data('ga-brand');
            category = $device.data('ga-category');
            variant = $device.data('ga-variant');
            list = $device.data('ga-list');
            position = $('.list-device-box').index($device) - 1;

            dataLayer.push({
            'event': 'productClick',
            'ecommerce': {
              'click': {
                'actionField': {'list': list},      // Optional list property.
                'products': [{
                  'name': name,                      // Name or ID is required.
                  'id': id,
                  'price': price,
                  'brand': brand,
                  'category': category,
                  'variant': variant,
                  'position': position
                 }]
               }
             },
             'eventCallback': function() {
               //window.location = $this.attr('href');
             }
          });
        });

        $('[data-ga-promotion=visible]').on('click', function (e) {
            var $this = $(this);

            id = $this.data('ga-id');
            name = $this.data('ga-name');
            creative = $this.data('ga-creative');
            position = $this.data('ga-position');
            dimension9 = $this.data('ga-dimension9');

            dataLayer.push({
            'event': 'promotionClick',
            'ecommerce': {
              'promoClick': {
                'promotions': [{
                    'id': id,
                    'name': name,
                    'creative': creative,
                    'position': position,
                    'dimension9': dimension9
                 }]
               }
             }
          });
        });
    });


}(window, document, SnTUtils, jQuery));


$(function () {
       $('#navigation-2016 > div > ul > li').on('click', function(e) {
      
      var $this = $(this);
      var $firstRowItems = $('#navigation-2016 > div > ul > li');
   
      var isOpen = $firstRowItems.hasClass('active');
      var isOpenAndActive = $this.hasClass('active');
      var isOpenAndActiveAndHasChildren = $('#navigation-2016 > div > ul > li.active > div > ul').length > 0;
      var hasChildren = $this.find('> div > ul').length > 0;
     var $closeButton = $('.nav2016-close-btn');
      
      $('#user-profile').removeClass('active').find('.bg-cont').slideUp();
      
      $firstRowItems.removeClass('active');
   
      if (isOpenAndActive) {
       $closeButton.hide();
         $firstRowItems.find('> div > ul').slideUp();
         return false;
      }
      
      $this.addClass('active');
      
      if(hasChildren) {
         if (isOpen && isOpenAndActiveAndHasChildren) {
            //$firstRowItems.find('> div > ul').fadeOut();
         $closeButton.hide();
            $this.siblings().find('> div > ul:visible').slideUp(500, function () {
               $this.find('> div > ul').slideDown(500, function () {
               $closeButton.show();
            });
            });
         } else {
            $this.find('> div > ul').slideDown( function () {
            $closeButton.show();
         });
         
         }
      } else {
         if (isOpen) {
         $closeButton.hide();
            $firstRowItems.find('> div > ul').slideUp();
         }
      }
     
      if ($(this).find('> a').attr('href') < 1 || $(this).find('> a').attr('href') === undefined) {
      return false;
     }

   });
   
   $('.search-2016').on('click', function () {
      $('#q').focus();
   });
   
   $('body').not('#navigation-2016').on('click', function (e) {
    if(e.target.localName !== 'img' && e.target.className !== 'active') {
        $('#navigation-2016 > div > ul > li').removeClass('active').find('> div > ul').slideUp();
        $('.nav2016-close-btn').hide();
    } 
   });
   
   $('#navigation-2016 > div > ul > li > div').on('click', function (e) {
      e.stopPropagation();
   });
   
   $('#navigation-2016 .close-nav').on('click', function (e) {
      $('#navigation-2016 > div > ul > li').removeClass('active').find('> div > ul').slideUp();
     $('.nav2016-close-btn').hide();
      return false;
   });
      
   $('.navbar-toggle').on('click', function () {
      $('#navigation-2016').slideToggle();   
   });
   
  $('#user-profile').on('click', function (e) {
      e.stopPropagation();
      
      $(this).toggleClass('active').find('.bg-cont').slideToggle();

       $('#navigation-2016 > div > ul > li').removeClass('active').find('> div > ul').slideUp();
       $('.nav2016-close-btn').hide();
      
   });
   
   $('body').not('#user-profile').on('click', function (e) {
      $('#user-profile').removeClass('active').find('.bg-cont').slideUp();
   });
});



