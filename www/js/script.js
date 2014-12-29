
var term = {
    name : null,
	title : null,
}

var cart= [];
if(!window.localStorage.getItem('cart'))
window.localStorage.setItem('cart', JSON.stringify(cart));
else
cart = JSON.parse(window.localStorage.getItem('cart'));

var tovars= [];
if(!window.localStorage.getItem('tovars'))
window.localStorage.setItem('tovars', JSON.stringify(tovars));
else
tovars = JSON.parse(window.localStorage.getItem('tovars'));
var order=[];

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
    }

//---------------------Перед загрузкой программы-------------------------------------------------------------------------------------

$(document).ready(function(){

$.mobile.loading( "show", {
	text: 'Загрузка меню...',
	textVisible: true,
	theme: 'a',
	html: ""
});
//----- поля формы ----------
//formValRead();

//----- загрузка товаров -----
$.getJSON("http://express-pizza.by/tovarjson",
    function(data){
	tovars = data;
	window.localStorage.setItem('tovars', JSON.stringify(data));
	$.mobile.loading( "hide" );
	});
	
	
 updateCart();
}); 


//------------------------Поля доставки----------------------------------------------------------------------------------
          
$('#form-checkout #dostavka').click(function() { 
    if ($(this).is(":checked")) {
	$('#adres-fields').show();
    } else {
           $('#adres-fields').hide();
	       }
	      
});

//------------------------Выбор категории товара----------------------------------------------------------------------------------

$(document).on('vclick', '#menu-list li a.term', function(){  
    term.name = $(this).attr('term');
	term.title = $(this).text();
	$.mobile.loading( "show" );
    $.mobile.changePage( "#tovar", { transition: "slide", changeHash: false });
});
//--------------------------Добавление товара--------------------------------------------------------------------------------
$(document).on('vclick', '#tovar-list a[type="add-to-cart"]', function(){  
var nid = $(this).attr('nid');
var tovar_obj = $(this).parent().parent().parent();
//cart = JSON.parse(window.localStorage.getItem('cart'));
//        $.each(JSON.parse(window.localStorage.getItem('tovars')).Items, function(i,item){
          $.each(tovars.Items, function(i,item){
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
  $(this).parent().children('.qty').html(cart[nid]['qty']);		  
 //$(this).parent().children('.qty').html(parseInt($(this).parent().children('.qty').text())+1);		  
  updateCart();
});
//--------------------------Удаление товара--------------------------------------------------------------------------------
$(document).on('vclick', '#tovar-list a[type="remove-from-cart"]', function(){  
var nid = $(this).attr('nid');
var tovar_obj = $(this).parent();
//cart = JSON.parse(window.localStorage.getItem('cart'));
//        $.each(JSON.parse(window.localStorage.getItem('tovars')).Items, function(i,item){
          $.each(tovars.Items, function(i,item){
		    if(item.node.nid==nid) {
            cart[nid].qty-=1;
			tovar_obj.children('.qty').html(cart[nid].qty);	
			    if(cart[nid].qty==0) {
			    delete cart[nid];
				tovar_obj.parent().parent().removeClass("active");
				  if(tovar_obj.children('.cart-remove').html())
                  tovar_obj.parent().parent().remove();
				}
            }
          }); 
//window.localStorage.setItem('cart', JSON.stringify(cart));
updateCart();
});

//---------------------Форма заказа-------------------------------------------------------------------------------------

$(document).on('pagebeforeshow', '#checkout', function(){ 
formValRead();
});


//------------------------Отправка заказа----------------------------------------------------------------------------------
$(document).on('click', '#submit', function() { // catch the form's submit event
/*
var validator = $( "#form-checkout" ).validate({
	errorPlacement: function(error, element) {
if (element.attr("name") === "favcolor") {
error.insertAfter($(element).parent());
} else {
error.insertAfter(element);
}
} 
});
validator.showErrors({
"imya": "Заполните имя",
"tel": "Заполните телефон"
});
*/
//validator.element( "#name" );

            if($('#name').val().length > 0 && $('#tel').val().length > 0){	
            
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
                // Send data to server through the ajax call
                // action is functionality we want to call and outputJSON is our data
                    $.ajax({url: 'http://express-pizza.by/checkout.php',
                        data: {action : 'checkout', formData : $('#form-checkout').serialize()+str},
                        type: 'post',                  
                        async: 'true',
                        dataType: 'json',
                        beforeSend: function() {
                            // This callback function will trigger before data is sent
                            	$.mobile.loading( "show" ); // This will show ajax spinner
								var checkout = {};
								$('form input, form select').each(function(){
								if($(this).attr('id'))
								checkout[$(this).attr('id')]=$(this).val();
								});
								window.localStorage.setItem('checkout', JSON.stringify(checkout));

                        },
                        complete: function() {
                            // This callback function will trigger on data sent/received complete
                            	$.mobile.loading( "hide" ); // This will hide ajax spinner
                        },
                        success: function (result) {
                            if(result.status) {
							    order=result;
                                clearCart();
                                $.mobile.changePage("#complete");                        
                            } else {
                                alert('Упс. Ошибка отправки заказа:( Попробуйте еще раз.');
                            }
                        },
                        error: function (request,error) {
                            // This callback function will trigger on unsuccessful action               
                            alert('Упс. Ошибка отправки заказа:( Возможно отсутствует подключение к интернету.');
                        }
                    });                  
            } else {
                alert('Заполните все поля "Имя" и "Телефон"');
            }          
            return false; // cancel original event to prevent form submitting
        });

//---------------------Заказ завершен-------------------------------------------------------------------------------------

$(document).on('pagebeforeshow', '#complete', function(){ 
$('#complete #complete-content').html(order.msg);
$.mobile.loading( "hide" );
});
//---------------------Корзина-------------------------------------------------------------------------------------

$(document).on('pagebeforeshow', '#cart', function(){ 
 	$('#cart #tovar-list').empty();
    //cart = JSON.parse(window.localStorage.getItem('cart'));
          var i=0;
		  for (key in cart) {
		    if(cart[key]) {
		    i++;
			if(!cart[key].text)
			cart[key].text='';		
              //$('#cart-list').append('<li><a href=""><img src="'+cart[key].image+'"><h2>'+cart[key].title+'</h2><h4>'+money(cart[key].price)+'р</h4></a><a href="" type="remove-from-cart" data-theme="c" nid='+cart[key].nid+'>Remove</a></li>');
              $('#cart #tovar-list').append('<div class="ui-grid-b tovari tovari'+i+' active"></div>');
              $('#cart #tovar-list .tovari'+i).append('<h2>'+cart[key].title+'</h2><div class="ui-block-a"><div class="ui-body ui-body-d"><img src="'+cart[key].image+'"></div></div>');
              $('#cart #tovar-list .tovari'+i).append('<div class="ui-block-b"><div class="ui-body ui-body-d"><p>'+cart[key].text+'</p><h4>'+money(cart[key].price)+' р</h4></div></div>');
              $('#cart #tovar-list .tovari'+i).append('<div class="ui-block-c"><div class="ui-body ui-body-d"></div></div>');
	          $('#cart #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<a nid='+cart[key].nid+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" data-theme="e" class="ui-nodisc-icon ui-btn-icon-right">Buy</a>');
	          $('#cart #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<span class="qty">'+cart[key].qty+'</span>');
	          $('#cart #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<a nid='+cart[key].nid+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" data-theme="c" class="cart-remove ui-nodisc-icon ui-btn-icon-right">Remove</a>');

			}
          }; 
		  //$('#cart-list').listview('refresh');
		  $("#cart #tovar-list").trigger("create");		  
		  $.mobile.loading( "hide" );
});
//---------------------Товары-------------------------------------------------------------------------------------
$(document).on('pagebeforeshow', '#tovar', function(){ 
$('#tovar #tovar-list').empty();
$.mobile.loading( "show" );
});

$(document).on('pageshow', '#tovar', function(){   
 	//$('#tovar #tovar-list').empty();
	$('#tovar h1#header-title').html(term.title);
	//cart = JSON.parse(window.localStorage.getItem('cart'));
	var i=0;
//        $.each(JSON.parse(window.localStorage.getItem('tovars')).Items, function(i,item){
          $.each(tovars.Items, function(i,item){
		    if(item.node.term.toLowerCase().indexOf(term.name) >= 0) {
			var qty = 0;
			  if(!item.node.text)
			  item.node.text='';
			  
			  if(cart[item.node.nid]!=null)
			  qty=cart[item.node.nid].qty;
			  
			  i++;
			  
			  var active='';
			  if(qty>0)
			  active='active';
			  
              //$('#tovar-list').append('<li><a href=""><img src="'+item.node.image+'"><h2>'+item.node.title+'</h2><p>'+item.node.text+'</p><h4>'+money(item.node.price)+' р</h4></a><a href="" type="add-to-cart" data-theme="e" nid='+item.node.nid+'>Buy</a></li>');
              $('#tovar #tovar-list').append('<div class="ui-grid-b tovari tovari'+i+' '+active+'"></div>').trigger("create");
			  
              $('#tovar #tovar-list .tovari'+i).append('<h2>'+item.node.title+'</h2><div class="ui-block-a"><div class="ui-body ui-body-d"><img src="'+item.node.image+'"></div></div>').trigger("create");
              $('#tovar #tovar-list .tovari'+i).append('<div class="ui-block-b"><div class="ui-body ui-body-d"><p>'+item.node.text+'</p><h4>'+money(item.node.price)+' р</h4></div></div>').trigger("create");
              $('#tovar #tovar-list .tovari'+i).append('<div class="ui-block-c"><div class="ui-body ui-body-d"></div></div>').trigger("create");
	          $('#tovar #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<a nid='+item.node.nid+' href="" type="add-to-cart" data-role="button" data-icon="plus" data-iconpos="notext" data-theme="e" class="ui-nodisc-icon ui-btn-icon-right">Buy</a>');
	          $('#tovar #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<span class="qty">'+qty+'</span>');
	          $('#tovar #tovar-list .tovari'+i+' .ui-block-c .ui-body').append('<a nid='+item.node.nid+' href="" type="remove-from-cart" data-role="button" data-icon="minus" data-iconpos="notext" data-theme="c" class="ui-nodisc-icon ui-btn-icon-right">Remove</a>');

			  }
          }); 
		  //$('#tovar-list').listview('refresh'); 
		  $("#tovar-list").trigger("create");
		  $.mobile.loading( "hide" );
		
	});	
	


						
//---------------------Обновление корзины-------------------------------------------------------------------------------------

function updateCart() {
//cart = JSON.parse(window.localStorage.getItem('cart'));
var qty = 0;
var total = 0;
for (key in cart) {
  if(cart[key]) {
  qty+=cart[key]['qty'];
  total+=cart[key].price*cart[key]['qty'];
  }
};
if(qty>0 && total>0)	
$('#home-footer, #tovar-footer').html('<div data-role="navbar" data-iconpos="right"><ul><li><a href="#cart" data-icon="arrow-r" data-theme="c" data-inline="true" class="ui-shadow-icon ui-btn ui-shadow ui-btn-icon-right">'+qty+' товаров на '+money(total)+' р</a></li></ul></div>');
else 
$('#home-footer, #tovar-footer').html('<div data-role="navbar" data-iconpos="right"><ul><li><span>Ваша корзина пуста</span></li></ul></div>');
if(qty>0 && total>0)
$('#cart-footer').html('<div data-role="navbar" data-iconpos="right"><ul><li><span>'+qty+' товаров на '+money(total)+' р</span><a href="#checkout" data-icon="check" data-theme="c" data-inline="true">Оформить заказ</a></li></ul></div>');
else
$('#cart-footer').html('<div data-role="navbar" data-iconpos="right"><ul><li><span>Ваша корзина пуста</span></li></ul></div>');

$('[data-role="footer"]').trigger('create');
}

//-----------------------Загрузка значений в поля формы -----------------------------------------------------------------------------------
function formValRead() {
var checkout=JSON.parse(window.localStorage.getItem('checkout'));
 	if(checkout) {
	    for(key in checkout) {
		$('form input#'+key).attr('value', checkout[key]);
		  if($('form #'+key).is('select')) {
		  $('form select#'+key+' option[value="'+checkout[key]+'"]').attr('selected', 'selected');
		    $('form select#'+key+' option:selected').each(function() { 
			alert('2 '+checkout[key]+' this: '+$(this).val());
		        if($(this).val()!=checkout[key]) {
				alert('1 '+checkout[key]);
			    $(this).removeAttr( "selected" ); 
			    }
		    });
		  $('form select#'+key).attr('value', checkout[key]);
		  $('form select#'+key).selectmenu('refresh', true);
		  }
		}
    $.mobile.loading( "hide" );
	}
}
//-----------------------Очистка корзины-----------------------------------------------------------------------------------
function clearCart() {
//cart = JSON.parse(window.localStorage.getItem('cart'));
//for(key in cart)
//cart.splice(key,1);
//delete cart;
cart = [];

window.localStorage.setItem('cart', JSON.stringify(cart));
updateCart();
}

//-----------------------Денежный формат-----------------------------------------------------------------------------------
function money(n) {
	    n += "";
	    n = new Array(4 - n.length % 3).join("U") + n;
	    return n.replace(/([0-9U]{3})/g, "$1 ").replace(/U/g, "");
}