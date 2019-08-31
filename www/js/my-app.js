(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-37632211-1', 'auto');
ga('send', 'pageview');

//----- incognito mode bug ------------------------------------------
(function(){
    try {
        localStorage.setItem('_storage_test', 'test');
        localStorage.removeItem('_storage_test');
    } catch (exc){
		alert('Приложение может работать некорректно в данном режиме браузера.');
        var tmp_storage = {};
        var p = '__unique__';  // Prefix all keys to avoid matching built-ins
        Storage.prototype.setItem = function(k, v){
            tmp_storage[p + k] = v;
        };
        Storage.prototype.getItem = function(k){
            return tmp_storage[p + k] === undefined ? null : tmp_storage[p + k];
        };
        Storage.prototype.removeItem = function(k){
            delete tmp_storage[p + k];
        };
        Storage.prototype.clear = function(){
            tmp_storage = {};
        };
    }
})();
//----- incognito mode bug END------------------------------------------

var term = {
    name : null,
	title : null,
}

var cart= [];
if(!window.localStorage.getItem('cart'))
window.localStorage.setItem('cart', JSON.stringify(cart));
else
cart = JSON.parse(window.localStorage.getItem('cart'));

var qty = 0;
var total = 0;

var slides= [];
if(!window.localStorage.getItem('slides'))
    window.localStorage.setItem('slides', JSON.stringify(slides));
else
    slides = JSON.parse(window.localStorage.getItem('slides'));

var groups= [];
if(!window.localStorage.getItem('groups'))
window.localStorage.setItem('groups', JSON.stringify(groups));
else
groups = JSON.parse(window.localStorage.getItem('groups'));

var tovars= [];
if(!window.localStorage.getItem('tovars'))
window.localStorage.setItem('tovars', JSON.stringify(tovars));
else
tovars = JSON.parse(window.localStorage.getItem('tovars'));

var order=[];

var firstStart=1;

    // Wait for device API libraries to load
    //
    function onLoad() {
        document.addEventListener("deviceready", onDeviceReady, false);
    }

    // device APIs are available
    //
    function onDeviceReady() {
        document.addEventListener("pause", onPause, false);
		document.addEventListener("resume", onResume, false);
		document.addEventListener("backbutton", onBackKeyDown, false);


		if (parseFloat(window.device.version) === 7.0) {
          document.body.style.marginTop = "20px";
        }
    }


    // Handle the pause event
    //
    function onPause() {
    window.localStorage.setItem('cart', JSON.stringify(cart));
	window.localStorage.setItem('tovars', JSON.stringify(tovars));
    }

    // Handle the resume event
    //
    function onResume() {
    cart = JSON.parse(window.localStorage.getItem('cart'));
	tovars = JSON.parse(window.localStorage.getItem('tovars'));
	updateTovars();
	//updateGroups();
    }

	// Handle the back button
    //
    function onBackKeyDown() {
	//if(document.getElementById('#home')){
     //      e.preventDefault();
     //      navigator.app.exitApp();
     //  }
     //  else {
		     history.go(-1);
    navigator.app.backHistory();

     //  }
    }

document.addEventListener("deviceready", appReady, false);
function appReady(){
  document.addEventListener("backbutton", function(e){
    var page=myApp.getCurrentView().activePage;
    myApp.hidePreloader();
    if(page.name=="index"){
      e.preventDefault();
      if(confirm("Хотите выйти из приложения?")) {
        navigator.app.clearHistory();
        navigator.app.exitApp();
      }
    } else {
      navigator.app.backHistory()
    }
  }, false);
}
//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

var myApp = new Framework7({
  init: false //Disable App's automatica initialization
});

var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

// 1 Slide Per View, 50px Between
var mySwiper1 = myApp.swiper('.swiper-1', {
    pagination:'.swiper-1 .swiper-pagination',
    spaceBetween: 50
});

//Now we add our callback for initial page
myApp.onPageInit('index', function (page) {

	$$('.panel-left a[href="#dostavka"]').on('click', function () {
        mainView.router.loadContent($$('#dostavka-tpl').html());
    });
	$$('.panel-left a[href="#o-nas"]').on('click', function () {
        mainView.router.loadContent($$('#o-nas-tpl').html());
    });
    $$('.panel-left a[href="#contacts"]').on('click', function () {
        mainView.router.loadContent($$('#contacts-tpl').html());
    });
	$$('.panel-left a[href="#cart"]').on('click', function () {
        loadCart();
    });

	$$('.refresh-link').on('click', function () {
        updateGroups(loadGroups);
        updateSlides(loadGroups);
    });

//-- обновляем базу групп, если устарела --------------------------------------------------------------
	if(window.sessionStorage.getItem('updateGroupTime')) {
    var updateGroupTime = window.sessionStorage.getItem('updateGroupTime');
	var now = new Date();
        if(Math.round(now/1000)-updateGroupTime>300) {
            updateGroups(loadGroups);
            updateSlides(loadGroups);
        }
	    else if (firstStart) {
		     firstStart=0;
			 loadGroups();
		     }
	} else {
		   updateGroups(loadGroups);
           updateSlides(loadGroups);
	       }
//-- обновляем базу товаров, если устарела -------------------------------------------------------------
	if(window.sessionStorage.getItem('updateTime')) {
    var updateTime = window.sessionStorage.getItem('updateTime');
	var now = new Date();
        if(Math.round(now/1000)-updateTime>300)
		updateTovars();
	}
else 	updateTovars();

});

//And now we initialize app
myApp.init();

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
	domCache: true, //enable inline pages
	swipeBackPage: false,
	animatePages: false,
	uniqueHistory: true
});


//Now we add our callback for initial page
myApp.onPageInit('index', function (page) {

	$$('.refresh-link').on('click', function () {
        updateGroups(loadGroups);
        updateSlides(loadGroups);
    });

});


//****************************  CALLBACKS  **********************************************************************************

//------------------------------------------------------------
//----------------  PageReinit  ------------------------------
//------------------------------------------------------------
//----------   index   ---------------------------------------
myApp.onPageReinit('index', function (page) {
    mainView.router.refreshPage();
    $$('.toolbar').addClass('tovar-bar');
    $$('.toolbar').removeClass('cart-bar');
    updateCart();
});
//----------   tovar   ---------------------------------------
myApp.onPageReinit('tovar', function (page) {
	    mainView.router.refreshPage();
		$$('.toolbar').addClass('tovar-bar');
		$$('.toolbar').removeClass('cart-bar');
		updateCart();
});
//----------   cart   ---------------------------------------
myApp.onPageReinit('cart', function (page) {
		$$('.toolbar').addClass('cart-bar');
		$$('.toolbar').removeClass('tovar-bar');
		updateCart();
		loadCart();
});
//------------------------------------------------------------
//----------------  BeforeAnimation  -------------------------
//------------------------------------------------------------

//----------   index   ---------------------------------------
myApp.onPageBeforeAnimation('index', function (page) {
	$$('.navbar').html('<div class="navbar-inner theme-white"><div class="left"><a href="#" class="link icon-only open-panel"> <i class="icon ion-navicon"></i></a></div>'+
                                '<div class="center sliding"><img class="title-logo" src="img/logo.png"/></div>'+
                               '<div class="right"><a href="#" class="link refresh-link icon-only"><i class="icon ion-refresh"></i></a></div></div>');


//-- обновляем базу групп, если устарела --------------------------------------------------------------
	if(window.sessionStorage.getItem('updateGroupTime')) {
    var updateGroupTime = window.sessionStorage.getItem('updateGroupTime');
	var now = new Date();
        if(Math.round(now/1000)-updateGroupTime>300) {
            updateGroups(loadGroups);
            updateSlides(loadGroups);
        }
	    else if (firstStart) {
		     firstStart=0;
			 loadGroups();
		     }
	} else {
		   updateGroups(loadGroups);
           updateSlides(loadGroups);
    }
	//-- обновляем базу товаров, если устарела ----
	if(window.sessionStorage.getItem('updateTime')) {
    var updateTime = window.sessionStorage.getItem('updateTime');
	var now = new Date();
        if(Math.round(now/1000)-updateTime>300)
		updateTovars();
	}

//--- кнопка на главную --------
  $$('a[href="#index"]').each(function(){
      if(!$$(this).hasClass('init')) {
          $$(this).on('click', function(){
              loadGroups(false);
          });
          $$(this).addClass('init');
      }
  });
  ga('set', 'page', '/index.html');
  ga('send', 'pageview');
});
//----------   tovar   ---------------------------------------
myApp.onPageBeforeAnimation('tovar', function (page) {

	//-- обновляем базу товаров, если устарела ----
	if(window.sessionStorage.getItem('updateTime')) {
    var updateTime = window.sessionStorage.getItem('updateTime');
	var now = new Date();
        if(Math.round(now/1000)-updateTime>300)
		updateTovars($$('.tovar-page').attr('group'), $$('.tovar-page').attr('title'), loadTovars);
	}
  ga('set', 'page', '/tovar.html');
  ga('send', 'pageview');
});
//----------   checkout   -------------------------
myApp.onPageBeforeAnimation('checkout', function (page) {

   $$('.checkout-page .total').html(qty+' товаров <br/>на '+money(total)+' р');

   $$('.toolbar').html('<a name="submit" id="send" value="Отправить" class="button button-big active color-green">Отправить <i class="icon align-right ion-chevron-right"></i></a></a>');
   //-- Упаковка ---------------------------------------
/*   var upak=0;
   for (key in cart) {
     if(cart[key]) {
     upak+=Number(cart[key]['upak'])*Number(cart[key]['qty']);
     }
   }
   $$('.checkout-page .upakovka-info').html(money(upak)+' р'); */
   //-- Доставка ---------------------------------------
   var dost=0;
   for (key in cart) {
     if(cart[key]) {
     dost+=Number(cart[key]['dost'])*Number(cart[key]['qty']);
     }
   }
     if(dost<5000 || isNaN(dost))
	 dost=5000;
   $$('.checkout-page .dostavka-info').html(money(dost)+' р');

jQuery("#tel").mask("+375(99)999-99-99");
ga('set', 'page', '/checkout.html');
ga('send', 'pageview');
});
//----------   tovar   ---------------------------------------
myApp.onPageBeforeAnimation('complete', function (page) {

  //--- кнопка на главную --------
    $$('a[href="#index"]').each(function(){
        if(!$$(this).hasClass('init')) {
            $$(this).on('click', function(){
                loadGroups(false);
            });
            $$(this).addClass('init');
        }
    });
    ga('set', 'page', '/complete.html');
    ga('send', 'pageview');
});
//----------   tovar cart checkout   -------------------------
myApp.onPageBeforeAnimation('tovar cart checkout contacts o-nas dostavka', function (page) {

    $$('.tovari a[type="add-to-cart"]').each(function(){
        if(!$$(this).hasClass('init')) {
            $$(this).on('click', function(){
                addTovar($$(this));
            });
            $$(this).addClass('init');
        }
    });

    $$('.tovari a[type="remove-from-cart"]').each(function(){
        if(!$$(this).hasClass('init')) {
            $$(this).on('click', function(){
                removeTovar($$(this));
            });
            $$(this).addClass('init');
        }
    });

    //--- кнопка на главную --------
      $$('a[href="#index"]').each(function(){
          if(!$$(this).hasClass('init')) {
              $$(this).on('click', function(){
                  loadGroups(false);
              });
              $$(this).addClass('init');
          }
      });

    $$('#send').on('click', function() {   // событие для отправки формы
      sendOrder();
    });

    $$('.cart-back-link').on('click', function () { // событие на клик на обратную кнопку с формы
      loadCart();
    });
    $$('.back-link').on('click', function () { // событие на клик на обратную кнопку с корзины
        mainView.router.back();
    });

//---- popup images ----------------------------------------
	var i=0;
	$$('.popup-tovar').on('click', function () {
		i++;
		var img = $$(this).find('img').attr('src-large');
            var popupHTML = '<div class="popup popup-tovar'+i+'">  <!-- Popup -->'+
                                  '<div class="content-block">'+
                                      '<p class="right"><a href="#" class="close-popup">Закрыть <i class="icon ion-close"></i></a></p>'+
                                      '<p class="center"><img src="'+img+'"></p>'+
                                  '</div>'+
                             '</div>';
        myApp.popup(popupHTML);
    });

//---- pull to refresh -------------------------------------
    $$('.tovar-page .pull-to-refresh-content').on('refresh', function (e) {
     updateTovars($$('.tovar-page').attr('group'), $$('.tovar-page').attr('title'), loadTovars);
    });

});
//----------   complete   -------------------------
myApp.onPageBeforeAnimation('complete', function (page) {
   $$('.content-block-inner').html('<div class="center">'+order.msg+'<p><a href="#index" class="button color-green">В начало</a></p></div>');  //--- загружаем страницу с сообщением об отправленном заказе
});
//------------------------------------------------------------
//----------------  AfterAnimation  --------------------------
//------------------------------------------------------------
//----------   index   ---------------------------------------
myApp.onPageAfterAnimation('index', function (page) {
  $$('.group-link').each(function(){
  if($$(this).hasClass('init')==false) {
       $$(this).on('click', function () {
           loadTovars($$(this).attr('group'),$$(this).text());
         }).addClass('init');
      }
  });
});
//----------   dostavka   ---------------------------------------
myApp.onPageAfterAnimation('dostavka', function (page) {
  $$.get('https://express-pizza.by/pages.php', {page:true, nid:5492}, function (data) {
	var answer=JSON.parse(data);
    $$('.dostavka-page .content-block-inner').html(answer.body);
  });
});
//----------   o-nas   ---------------------------------------
myApp.onPageAfterAnimation('o-nas', function (page) {
  $$.get('https://express-pizza.by/pages.php', {page:true, nid:41394}, function (data) {
	var answer=JSON.parse(data);
    $$('.o-nas-page .content-block-inner').html(answer.body);
  });
});
//----------   contacts   ---------------------------------------
myApp.onPageAfterAnimation('contacts', function (page) {
    $$.get('https://express-pizza.by/pages.php', {page:true, nid:41469}, function (data) {
        var answer=JSON.parse(data);
        $$('.contacts-page .content-block-inner').html(answer.body);
    });
});
//****************************  FUNCTIONS  **********************************************************************************

//---------------------------------------------------------------------------------------------------------------------------
//--------------------------Добавление товара--------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------
function addTovar(obj) {

var nid = obj.attr('nid');
var tovar_obj = obj.parent().parent().parent().parent().parent();
//cart = JSON.parse(window.localStorage.getItem('cart'));
//        $.each(JSON.parse(window.localStorage.getItem('tovars')).Items, function(i,item){
          $$.each(tovars.Items, function(i,item){
		    if(item.node.nid==nid) {
			  if(cart.length>0) {
			    if(cart[nid]) {
			    cart[nid].qty+=1;
				}
			    else{
			         cart[nid]=item.node;
			         cart[nid]['qty']=1;
					 tovar_obj.addClass("active");
			         }
			  }else {
			         cart[nid]=item.node;
			         cart[nid]['qty']=1;
					 tovar_obj.addClass("active");
			         }
            //window.localStorage.setItem('cart', JSON.stringify(cart));
            }
          });
    var qty2 = 0;
    if(cart[nid].title.indexOf("-50%") ==-1) {  //если товар обычный
        var nid50 = FindNidAction50(nid, cart[nid].title);
        if(nid50 && cart[nid50]) {
            qty2=cart[nid50]['qty'];
        }
    } else {  // если товар акционный
        var nid2 = FindNidNormal(nid, cart[nid].title);
        if(nid2 && cart[nid2]) {
            qty2=cart[nid2]['qty'];
        }
    }

  obj.parent().parent().find('.qty').html(Number(cart[nid]['qty']+qty2));
    //tovar_obj.attr('nid');
  updateCart();
checkAction50(obj);

    if($$('.view-main').attr('data-page').indexOf("cart")!=-1){
        loadCart();
    }
}
//---------------------------------------------------------------------------------------------------------------------------
//------------------------- Удаление товара ---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------
function removeTovar(obj) {
var nid = obj.attr('nid');
var tovar_obj = $$('li.tovari[nid="'+nid+'"]');
//cart = JSON.parse(window.localStorage.getItem('cart'));
//        $.each(JSON.parse(window.localStorage.getItem('tovars')).Items, function(i,item){
          $$.each(tovars.Items, function(i,item){
		    if(item.node.nid==nid) {
                if(cart[nid]) {
                    cart[nid].qty-=1;
                    var qty2 = 0;
                    if(cart[nid].title.indexOf("-50%") ==-1) {  //если товар обычный
                        var nid50 = FindNidAction50(nid, cart[nid].title);
                        if(nid50 && cart[nid50]) {
                            qty2=cart[nid50]['qty'];
                        }
                    } else {  // если товар акционный
                        var nid2 = FindNidNormal(nid, cart[nid].title);
                        if(nid2 && cart[nid2]) {
                            qty2=cart[nid2]['qty'];
                        }
                    }
                    obj.parent().parent().find('.qty').html(cart[nid].qty+qty2);
                    if(cart[nid].qty==0) {
                        if(cart[nid].title.indexOf("-50%") ==-1) // не акционный
                            tovar_obj.removeClass("active").removeClass("action50");
                        //if()

                        if(obj.parent().parent().find('.cart-remove').html() && cart[nid].title.indexOf("-50%") ==-1)
                            obj.parent().parent().parent().parent().parent().parent().remove();

                        delete cart[nid];
                    }
                }
            }
          });



//window.localStorage.setItem('cart', JSON.stringify(cart));
updateCart();
checkAction50(obj);

    if($$('.view-main').attr('data-page').indexOf("cart")!=-1){
        loadCart();
    }
}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------- Акция 50% -------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function checkAction50(obj) { 
/*
    var tovar_obj = obj.parents('li');
    var nid = tovar_obj.attr('nid');
    if(cart[nid])
    if(cart[nid].term=='pizza23' || cart[nid].term=='pizza30' || cart[nid].term=='pizza36') {
        tovar_obj.toggleClass("action50");
    }
    */
}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------- Акция 50% найти nid скидочной пиццы -------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function FindNidAction50(nid, title) {
    var nid50=0;
$$.each(tovars.Items, function(i,item){
    if(item.node.title.indexOf("%") !=-1){
        if(item.node.title==title+' -50%'){
            nid50=Number(item.node.nid);
        }
    }
});
   return nid50;
}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------- Акция 50% найти nid обычной пиццы по скидочной -------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function FindNidNormal(nid, title) {
    var nid=0;
    $$.each(tovars.Items, function(i,item){
        if(item.node.title.indexOf("%") ==-1){
            if(item.node.title+' -50%'==title){
                nid=Number(item.node.nid);
            }
        }
    });
    return nid;
}
//----------------------------------------------------------------------------------------------------------------------------
//-------------------- Отправка заказа на сервер -----------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function sendOrder() {

            if($$('#name').val().length > 0 && $$('#tel').val().length > 0){

			// ---- чистим от пустых ячеек ----
			//var cart = JSON.parse(window.localStorage.getItem('cart'));
			var str = '';
			var i=0;
			for(key in cart) {
			   if(cart[key]!=null) {
			   i++;
			   str+='&product'+i+'='+cart[key].nid+'&qty'+i+'='+cart[key].qty;
			   }
			}

			//-----------------
				var form = myApp.formToJSON('#form-checkout');

				if($$('#dostavka:checked').val())
				form.dostavka = $$('#dostavka:checked').val();
			    else
					form.dostavka = '';

                            	myApp.showPreloader('<i class="icon ion-happy-outline"></i> отправка...');
								var checkout = {};
								$$('form input, form select').each(function(){
								if($$(this).attr('id'))
								checkout[$$(this).attr('id')]=$$(this).val();
								});
								window.localStorage.setItem('checkout', JSON.stringify(checkout));

                $$.post('https://express-pizza.by/checkout.php',
				{action : 'checkout', formData : $$.serializeObject(form)+str},
				function (data, status, xhr) {
					    myApp.hidePreloader();
					        if(status) {
							    order=JSON.parse(data);
                                clearCart();
                                mainView.router.loadContent($$('#complete-tpl').html());
                            } else {
                                myApp.alert('Ошибка отправки заказа:( Попробуйте еще раз. Возможно отсутствует подключение к интернету.');
                            }
                });

            } else {
                myApp.alert('Заполните поля "Имя" и "Телефон"', '<i class="icon ion-sad-outline"></i>');
            }
            return false; // cancel original event to prevent form submitting
}
//----------------------------------------------------------------------------------------------------------------------------
//---------------------Обновление корзины-------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function updateCart() {
qty = 0;
total = 0;
//cart = JSON.parse(window.localStorage.getItem('cart'));
for (key in cart) {
  if(cart[key]) {
  qty+=cart[key]['qty'];
  total+=cart[key].price*cart[key]['qty'];
  }
};
var tpl='';

if(!$$('.toolbar .toolbar-inner').html())
$$('.toolbar').html('<div class="toolbar-inner"></div>');

if(qty>0 && total>0) {
$$('.tovar-bar .toolbar-inner').html('<span><i class="icon ion-android-cart"></i> '+money(total)+' р </span><a href="#cart" class="link cart-link">Далее&nbsp;&nbsp;&nbsp; <i class="icon align-right ion-chevron-right"></i></a>');
} else {
$$('.tovar-bar .toolbar-inner').html('<i class="icon ion-android-cart"></i> &nbsp;&nbsp;&nbsp;Ваша корзина пуста');
}
if(qty>0 && total>0)
$$('.cart-bar .toolbar-inner').html('<span><i class="icon ion-android-cart"></i> '+money(total)+' р </span><a href="#checkout" class="link checkout-link">Оформить&nbsp;&nbsp;&nbsp; <i class="icon align-right ion-chevron-right"></i></a>');
else
$$('.cart-bar .toolbar-inner').html('<i class="icon ion-android-cart"></i> &nbsp;&nbsp;&nbsp;Ваша корзина пуста');

    $$('.cart-link').on('click', function () {
        loadCart();
    });
	$$('.checkout-link').on('click', function () {
        loadCheckout();
    });


}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------Загрузка шаблона формы заказа---------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function loadCheckout() {
mainView.router.loadContent($$('#checkout-tpl').html());
}
//----------------------------------------------------------------------------------------------------------------------------
//-------------Вывод групп и слайдера--------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function loadGroups(state) {
  if(state==null)
  state = true;
myApp.hidePreloader();
var list='';
var slideslist='';
var tpl='<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="link icon-only open-panel"> <i class="icon ion-navicon"></i></a></div>' +
        '    <div class="center sliding"><img class="title-logo" src="img/logo.png"/></div>' +
		'     <div class="right"><a href="#" class="link refresh-link icon-only"> <i class="icon ion-refresh"></i></a></div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages navbar-through toolbar-through">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="index" class="page index-page loaded">' +
        '    <div class="page-content">' +
        '     <div class="swiper-container swiper-1">'+
        '      <div class="swiper-pagination"></div>'+
        '      <div class="swiper-wrapper">';
    //-- slides ------
    $$.each(slides.Items, function(i,item){
        if(item.slide.image)
            slideslist+='<div class="swiper-slide"><img src="'+item.slide.image+'"></div>';
    });
    if(!state)
        tpl+=slideslist;
    tpl+='      </div>'+
        '     </div>'+
        '      <div class="list-block media-list inset">' +
        '        <ul>';
         //-- groups ----
          $$.each(groups.Items, function(i,item){
              var image	='';
		      if(item.term.termimage)
			  image = '<div class="item-media"><img src="'+item.term.termimage+'" srcset="'+item.term.termimage_2x+' 2x" ></div>';
              list+='<li class="group-li">'+
                    '<a href="#" group="'+item.term.code+'" class="item-link group-link item-content">'+
                     ''+image+''+
                      //'<div class="item-inner">'+
                      // '<div class="item-title-row">'+
                        '<div class="item-title">'+item.term.name+'</div>'+
                       //'</div>'+
                       //  '<div class="item-subtitle"></div>'+
					   //'</div>'+
                    '</a>'+
                   '</li>';
          });

   if(!state)
   tpl+=list;
   tpl+='        </ul>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

	if(state) {
        $$('.index-page ul').html(list);
        $$('.index-page .swiper-1 .swiper-wrapper').html(slideslist);
    }
    else {
        mainView.router.loadContent(tpl);
    }



      $$('.group-link').each(function(){
		  if($$(this).hasClass('init')==false) {
	         $$(this).on('click', function () {
               loadTovars($$(this).attr('group'),$$(this).text());
             }).addClass('init');
          }
	    });


}

//----------------------------------------------------------------------------------------------------------------------------
//-------------Вывод товаров--------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function loadTovars(group, title, state) {
state = state || true;

if($$('.tovar-page ul').html())
mainView.router.back();
//myApp.showPreloader('Загрузка меню...');
var i=0;
var list='';
var tpl='<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#index" class="item-link link"><i class="icon ion-chevron-left"></i></a></div>' +
        '    <div class="center sliding">'+ title +'</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="tovar" class="page tovar-page" group="'+group+'" title="'+title+'">' +
        '    <div class="page-content pull-to-refresh-content">' +
        '     <!-- Default pull to refresh layer-->'+
        '     <div class="pull-to-refresh-layer">'+
        '     <div style="width:28px; height:28px" class="preloader preloader-white"></div>'+
        '     <div class="pull-to-refresh-arrow"></div>'+
        '    </div>' +
        '      <div class="list-block media-list inset">' +
        '        <ul>'+
		'<li class="tovar-preloader" style="display:none;"><div class="item-inner center"><span style="width:36px; height:36px" class="preloader"></span></div></li>';

          $$.each(tovars.Items, function(i,item){
		    if(item.node.term.toLowerCase().indexOf(group) >= 0) {

			  if(!item.node.text)
			  item.node.text='';

			  i++;

                //--- определение количества товаров в корзине ------
                var qty = 0;
                var active='';
                var qty2 = 0;
                if(cart[item.node.nid]!=null)
                    qty=cart[item.node.nid].qty;
                if(cart[item.node.nid]) {
                    if(cart[item.node.nid].title.indexOf("-50%") ==-1) {  //если товар обычный
                        var nid50 = FindNidAction50(item.node.nid, cart[item.node.nid].title);
                        if(nid50 && cart[nid50]) {
                            qty2=cart[nid50]['qty'];
                        }
                    }
                }
                if((qty+qty2)>0) {
                    active='active';
                }
                /*
                if((qty-qty2)==1){
                    active+=" action50";
                }
                */
              //--- определение параметров акционных пицц 50% -----
              
                var plus50='';
                var minus50='';
                var price50='';
                var mark50='';
                var pizza='';
                /*  
              if(item.node.term=='pizza23' || item.node.term=='pizza30' || item.node.term=='pizza36') {
                  pizza="pizza";
                  price50='<div class="item-after price price50">'+money(item.node.price/2)+' р</div>';
                  var nid50 = FindNidAction50(item.node.nid, item.node.title);
                  plus50='<a nid='+nid50+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" class="button color-green button-round button-big plus50 active">+</a>';
                  minus50='<a nid='+nid50+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" class="button color-red button-round button-big minus50 active">-</a>';
                  mark50='<div class="mark50"><div class="item-title">'+item.node.title+' за пол цены (-50%)</div>'+price50+'</div>';
              }
              */
                //-- картинка товара --------------
                var image = '';
                if(item.node.image)
                    image = '<div class="item-media"><a href="#" class="popup-tovar popup-tovar'+i+'"><img src="'+item.node.image+'" srcset="'+item.node.image2x+' 2x"  src-large="'+item.node.imageLarge+'"></a></div>';

                var ves = '';
                if(item.node.ves)
                    ves = '<div class="badge">'+item.node.ves+'</div>';

                list+='<li nid="'+item.node.nid+'" class="tovari tovari'+i+' '+pizza+' '+active+'">'+
                    //'<a href="#" class="item-link item-content">'+
                     image+

                      '<div class="item-inner">'+
                       '<div class="item-title-row">'+
                        '<div class="item-title">'+item.node.title+'</div>'+
                       '</div>'+
			'<div class="item-subtitle">'+item.node.text+'</div>'+
                  '<div class="item-after price">'+money(item.node.price)+' р</div>'+
                    //  price50+
                   ves+
                         '<div class="item-text controls">'+
						    '<div>'+
						     '<div>'+
                              '<a nid='+item.node.nid+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" class="button color-green button-round button-big plus active">+</a>'+
							  plus50+
                             '</div>'+
						     '<div>'+
						      '<span class="qty">'+Number(qty+qty2)+'</span>'+
						     '</div>'+
						     '<div>'+
                              '<a nid='+item.node.nid+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" class="button color-red button-round button-big minus active">-</a>'+
						       minus50+
                             '</div>'+
						    '</div>'+
						 '</div>'+
             '</div>'+
              mark50+
                    //'</a>'+
                   '</li>';
			  }
          });

        if(state)
        tpl+=list;

        tpl+='        </ul>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

	if(state)
	mainView.router.loadContent(tpl);
    else
	    $$('.tovar-page ul').html(list);


		$$('.toolbar').addClass('tovar-bar');
		$$('.toolbar').removeClass('cart-bar');

    updateCart();
}
//----------------------------------------------------------------------------------------------------------------------------
//---------------------Корзина---вывод товаров--------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function loadCart() {

//myApp.onPageBeforeAnimation('cart', function (page) {
 	//$('#cart #tovar-list').empty();
    //cart = JSON.parse(window.localStorage.getItem('cart'));
var tpl='<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#index" class="link icon-only item-link"><i class="icon ion-chevron-left"></i></a></div>' +
        '    <div class="center sliding">Корзина</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="cart" class="page cart-page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="list-block media-list inset">' +
        '        <ul>';

      	  var i=0;
          var economy=0;
		  for (key in cart) {
		    if(cart[key] && cart[key].title.indexOf("-50%")==-1) { // элемент не пустой и не акционный
		    i++;
			if(!cart[key].text)
			cart[key].text='';

                //--- определение количества товаров в корзине ------
                var qty = 0;
                var active = '';
                var qty2 = 0;
                var price2 = 0;
                var price = cart[key].price*cart[key].qty;
                qty=cart[key].qty;
                var nid50 = FindNidAction50(cart[key].nid, cart[key].title);
                if(nid50 && cart[nid50]) {
                    qty2=cart[nid50]['qty'];
                    price2=cart[nid50].price*qty2;
                    economy+=price2;

                }
                if((qty+qty2)>0) {
                    active='active';
                }
                /*
                if((qty-qty2)==1){
                    active+=" action50";
                }
               */
                var pizza50='';
                if(cart[key].title.indexOf("-50%") !=-1){
                    pizza50='pizza50';
                }
                //--- определение параметров акционных пицц 50% -----
                var plus50='';
                var minus50='';
                var price50='';
                var mark50='';
                var pizza='';
                /*
                if(cart[key].term=='pizza23' || cart[key].term=='pizza30' || cart[key].term=='pizza36') {
                    pizza="pizza";
                    if(price2>0 && qty2>0)
                    price50='<div class="item-after cart-price50">'+money(price2)+'р/'+qty2+'шт за пол цены (-50%)</div>';
                    var nid50 = FindNidAction50(cart[key].nid, cart[key].title);
                    plus50='<a nid='+nid50+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" class="button color-green button-round button-big plus50 active">+</a>';
                    minus50='<a nid='+nid50+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" class="button color-red button-round button-big minus50 active">-</a>';
                    //mark50='<div class="mark50">-50%</div>';
                }
                */
			       tpl+='<li nid="'+cart[key].nid+'" class="ui-grid-b swipeout tovari tovari'+i+' '+active+' '+pizza50+' '+pizza+'">'+
                       '<div class="swipeout-content item-content">'+
                      '<div class="item-inner">'+
                       '<div class="item-title-row">'+
                        '<div class="item-title">'+cart[key].title+'</div>'+
                       '</div>'+
                         '<div class="item-subtitle">'+cart[key].text+'</div>'+
                       '<div class="item-after cart-price">'+money(price)+'р/'+qty+'шт</div>'+
                       price50+
                       '<div class="badge">'+cart[key].ves+'</div>'+
                         '<div class="item-text controls">'+
						    '<div>'+
						     '<div>'+
						      '<a nid='+cart[key].nid+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" class="button color-green button-big button-round plus active">+</a>'+
                               plus50+
                              '</div>'+
						     '<div>'+
						      '<span class="qty">'+Number(qty+qty2)+'</span>'+
						     '</div>'+
						     '<div>'+
                             '<a nid='+cart[key].nid+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" class="button color-red button-big button-round minus active cart-remove">-</a>'+
                               minus50+
                             '</div>'+
						    '</div>'+
						 '</div>'+
                     '</div>'+
                    '</div>'+
                     //'<div class="swipeout-actions-right"><a href="#" class="action1 bg-red">Удалить</a></div>'+
                   '</li>';
			}
          };
          /*
		  if(economy>0){
              tpl+='<li class="economy"><i class="icon ion-ios-star-outline"></i> Экономия '+money(economy)+' рублей!</li>';
          }
          */
		tpl+='        </ul>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
		$$('.toolbar').addClass('cart-bar');
		$$('.toolbar').removeClass('tovar-bar');
		mainView.router.loadContent(tpl);
		updateCart();
}
//----------------------------------------------------------------------------------------------------------------------------
//---------------------Обновление базы товаров--------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function updateTovars(group, title, callback) {
//myApp.showPreloader('обновление меню...');

//----- загрузка товаров -----
$$.getJSON("https://express-pizza.by/tovarjson?rnd="+Math.random(),
    function(data, status, xhr){
	tovars = data;
	window.localStorage.setItem('tovars', JSON.stringify(data));
	  if(group && title) {
	  callback(group, title);
	  myApp.pullToRefreshDone();
	  $$('.tovar-preloader').show();
	  }
	//myApp.hidePreloader();
	$$('.tovar-preloader').hide();
	var now = new Date();
	window.sessionStorage.setItem('updateTime', Math.round(now/1000) );
	});

}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------- Обновление базы групп  -------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function updateGroups(callback) {
myApp.showPreloader('обновление разделов...');
$$('.tovar-page .page-content').html('<div class="content-block inset"><div class="content-block-inner"><p class="center"><span style="width:36px; height:36px" class="preloader"></span></p></div></div>');

//----- загрузка групп -----
$$.getJSON("https://express-pizza.by/groupjson?rnd="+Math.random(),
    function(data, status, xhr){
	groups = data;
	window.localStorage.setItem('groups', JSON.stringify(data));
	  if(callback)
	  callback();
	myApp.hidePreloader();
	var now = new Date();
	window.sessionStorage.setItem('updateGroupTime', Math.round(now/1000) );
	});

}
//----------------------------------------------------------------------------------------------------------------------------
//--------------------- Обновление базы слайдов  -------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function updateSlides(callback) {
    //myApp.showPreloader('обновление разделов...');
    //$$('.tovar-page .page-content').html('<div class="content-block inset"><div class="content-block-inner"><p class="center"><span style="width:36px; height:36px" class="preloader"></span></p></div></div>');

//----- загрузка слайдов -----
    $$.getJSON("https://express-pizza.by/slidesjson?rnd="+Math.random(),
        function(data, status, xhr){
            slides = data;
            window.localStorage.setItem('slides', JSON.stringify(data));
            if(callback)
                callback();
        });

}
//----------------------------------------------------------------------------------------------------------------------------
//-----------------------Очистка корзины--------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function clearCart() {
//cart = JSON.parse(window.localStorage.getItem('cart'));
//for(key in cart)
//cart.splice(key,1);
//delete cart;
cart = [];
window.localStorage.setItem('cart', JSON.stringify(cart));
updateCart();
}
//----------------------------------------------------------------------------------------------------------------------------
//-----------------------Денежный формат--------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
function money(n) {
	   // n += "";
	   // n = new Array(4 - n.length % 3).join("U") + n;
	   // return n.replace(/([0-9U]{3})/g, "$1 ").replace(/U/g, "");
    return Math.round(n * 100) / 100;
}
//----------------------------------------------------------------------------------------------------------------------------
//-----------------------Проверка на четность--------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

function isEven(value) {
    if (value%2 == 0)
        return true;
    else
        return false;
}
