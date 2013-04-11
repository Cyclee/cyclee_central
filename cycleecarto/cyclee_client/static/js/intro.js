/***********
 * intro for first time users
 *
 * process includes registration and setting
 *
**/


$('#nav-intro').on('click',loadintro);
var html = '<p class="intro-progress border-top"><a href="#" id="nav-intro" class="btn nav-page prog1 active" >&nbsp;1&nbsp;</a> <a href="#" id="nav-intro2" class="btn nav-page prog2">&nbsp;2&nbsp;</a> <a href="#" id="nav-intro3" class="btn nav-page prog3">&nbsp;3&nbsp;</a> <a href="#" id="nav-intro4" class="btn nav-page prog4">&nbsp;4&nbsp;</a></p>';
$('.intro').append(html);

function loadintro(){
    switchpage('intro');
    console.log('loadintro');
    var footer = '<a href="#" class="notify-footer" onclick="$(\'#nav-intro2\').click(); $(this).hide();" >Customize notes to your usual route &#187;</a>';
    $('#notes').append(footer);
}

$('#intro button').on('click', function(){ 
    $('#nav-intro2').click(); 
    
    welcome_note();
});

$('.page').on('click', '#nav-intro', function(){
    // show progress    
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog1').addClass('active');
});

$('.page').on('click', '#nav-intro2', function(){
    $('#intro2 button#commute-save').on('click',function(){ 
        $('#nav-intro3').click(); 
        $('.notify-footer').hide();
    });
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog2').addClass('active');
});

$('.page').on('click', '#nav-intro3', function(){
    var html = $('.help-addnote').clone();
    html.removeClass('help-addnote');
    $('#intro3 #intro3-content').html(html);
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog3').addClass('active');
});

$('.page').on('click', '#nav-intro4', function(){
    var html = $('.help-explore').clone();
    html.removeClass('help-explore');
    $('#intro4 #intro4-content').html(html);
    // show progress    
    var e = $('.intro-progress');
    $('.intro-progress').find('a').removeClass('active');
    $('.intro-progress').find('a.prog4').addClass('active');
});


function welcome_note(){

    console.log('welcome note');
    var templateNote = $("#notes article.template");
    var templateN = templateNote.clone();
    templateN.removeClass('template');

    description = 'Welcome @'+username+'! <a class="entypo" href="#" onclick="switchpage(\'addnote\');">&#59160;</a>&nbsp;Post a note to introduce yourself.'
    templateN.find('p').html(description);
    templateN.find('img').attr('src','https://en.gravatar.com/avatar/bb499013eebc3869dc8b7b4679fdae10?s=50');
    
    $('section#notes').prepend(templateN);
    
    
}
