/*********
*
*  Seasoft language translator : slang.js
*
*  Copyright (c) 2019 by Seasoft Corporation. All rights reserved.
*  Made in Japan. https://seasoft.co.jp/
*  This software is released under the MIT License, see License.txt.
*
*  Ver 1.00 2019/08/03 Dictionary
*  Ver 2.00 2019/10/24 RedBlackTree
*  Ver 2.10 2019/10/31 add class slang-notr, slang-if, slang-else 
*  Ver 2.20 2020/11/14 Support IE 11.
*********/
/* namespace */
var slang = slang || {};

slang.VERSION = 2.20;
slang.WEB_ROOT = location.protocol + "//" + location.host;

/* Translation files are placed in the following folder on the website */
slang.TRANSLATION_DIR = '/translation';
slang.IMAGEDIR = 'images';
slang.IMAGEPATH = slang.IMAGEDIR + '/';

/* Make a non-English language choice associative array */
/* The key is the language file extension */
slang.LANGUAGES = {
                    'ja' : 'Japanese',
                    'en' : 'English',
                    'zh' : 'Chinese',
                    'ko' : 'Korian',
                    'de' : 'Germany',
                    'fr' : 'French',
                    'it' : 'Italiano',
                    'nl' : 'Nederlands',
                    'pt' : 'Portuguesa',
                    'es' : 'Spanish',
                    'pl' : 'Polish',
                    'el' : 'Greek',
                    'ru' : 'Russian',
                    'he' : 'Hebrew',
                    'hi' : 'Hindi',
                    'ar' : 'Arabic',
                    'la' : 'Latin',
                    'sw' : 'Swahili',
                  };

/* In case of url, http://seasoft.co.jp/index.html the translating file is http://seasoft.co.jp/slang.TRANSLATION_DIR/index.html.ja */

/* this variable changed language key when translating */
slang.translating_language = '';

/* style sheet classes definitions */
slang.css_tr    = 'slang';
slang.css_group = 'slang-group';
slang.css_notr  = 'slang-notr';

/* common files parameter key */
/* 
    ex. <script src='web_path/slang.js?include=common,index' /> 
    include common.ja and index.ja file for Japanese language
*/
slang.common_key = 'include';

/* read the xml translation files */
slang.loadTranslateFiles = function()
{
    var base = slang.getBaseLanguage();
    var lang = slang.getTargetLanguage();
    if(lang === base)
    {
        return false;
    }
    /* check ES6 */
    /*
    if(!(typeof Symbol === "function" && typeof Symbol() === "symbol"))
    {
        // only japanese translation view next message!
        if(lang == 'ja')
        {
            alert('お使いのブラウザでは翻訳機能が動作しません。\nモダンブラウザをご利用ください');
            return false;
        }
    }
    */
    var rc = true;
    var pathname = location.pathname;
    if(pathname === '/')
    {
        pathname = '/index.html';
    }
    /* use variable 'lang' for file extention */
    var ext = lang;
    var key = ext + '_tree';
    slang._current_tree = new slang.Tree(lang);
    slang.LANGUAGES[key] = slang._current_tree;
    
    /* get common pair files */
    var path = pathname.substring(0, pathname.lastIndexOf('/')) + '/';
    var common_files = slang.get_common_files();
    var filename;
    if(common_files && (0 < common_files.length))
    {
        for(var i = 0; i < common_files.length; i++)
        {
            filename = slang.WEB_ROOT + slang.TRANSLATION_DIR + path + common_files[i] + '.' + ext;
            if(slang.exists(filename))
            {
                rc = rc && slang.loadTranslateFile(ext, filename);
            }
        }
    }
    /* file name of the page */
    filename = slang.WEB_ROOT + slang.TRANSLATION_DIR + pathname + '.' + ext;
    if(slang.exists(filename))
    {
        rc = rc && slang.loadTranslateFile(ext, filename);
    }

    return rc;
};

/* get based language of html */
slang.getBaseLanguage = function()
{
    /* page base language by parameter */
    var base = slang.getParameter('base');
    if((base !== null) && (0 < base.length))
    {
        return base;
    }
    /* html5 <html lang=''> format */
    base = $('html')[0].lang;
    if((base !== null) && (0 < base.length))
    {
        return base;
    }
    /* <body lang=''> format */
    base = $('body')[0].lang;
    if((base !== null) && (0 < base.length))
    {
        return base;
    }
    var head = $('head');
    var headChildren = head.children();
    var childrenLength = headChildren.length;
    for(var i = 0; i < childrenLength; i++)
    {
        var metaName = headChildren.eq(i).attr('http-equiv');
        if(metaName === 'Content-Language')
        {
            base = headChildren.eq(i).attr('content');
            break;
        }
    }
    if((base !== null) && (0 < base.length))
    {
        return base;
    }
    
    /* default language is English */
    return 'en';
};

slang.getTargetLanguage = function()
{
    var lang = slang.getParameter('lang');
    /* URL parameter 'lang=xx' take precedence. */
    if(lang === null)
    {
        /* Get the browser default language */
        lang = (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage;
        if(2 < lang.length)
        {
            lang = lang.substr(0, 2);
        }
    }
    if((lang === null) || (lang.length == 0))
    {
        /* default target language is English */
        lang = 'en';
    }
    return lang;
};

/* get URL parameter symbols */
slang.getParameter = function(name, url)
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/* get common file names from script parameter */
slang.get_common_files = function()
{
    var value = slang.getScriptParameter('slang.js', slang.common_key);
    var files = null;
    if(value)
    {
        files = value.split(',');
    }
    return files;
};

/* get script parameter symbols */
slang.getScriptParameter = function(filename, key)
{
    var scripts = document.getElementsByTagName( 'script' );
    var script = null;
    for( var i = 0; i < scripts.length; i++)
    {
        var s = scripts.item(i);
        if(s.src.indexOf(filename) != -1)
        {
            script = s;
            break;
        }
    }
    if(script)
    {
        script.src.match( /(.*)(\?)(.*)/ );
        if(RegExp.$3)
        {
            var amp = RegExp.$3.split( '&' );
            if(amp)
            {
                for(var k = 0; k < amp.length; k++)
                {
                    var pair = amp[k].split('=');
                    if(pair[0] === key)
                    {
                        return pair[1];
                    }
                }
            }
        }
    }

    return null;
};

/* check file exists*/
slang.exists = function(url)
{
    var rc = false;
    try
    {
        var request = new XMLHttpRequest();
        request.open('HEAD', url, false);
        request.send();
        rc = (request.status == 200) ? true : false;
    }
    catch(e)
    {
        rc = false;
    }
    return rc;
};

/* read file async function */
slang.loadTranslateFile = function(ext, filename)
{
    var errmsg = "";
    var rc = false;
    $.ajax({
        async: true,
        dataType: 'xml',
        url: filename,
        type: 'POST',
        timeout: 10000,
        error: function(XMLHttpRequest, textStatus, errorThrown)
        {
            errmsg = 'Sorry, the service is not enable!\n status=' + XMLHttpRequest.status + ' msg=' + errorThrown;
        },
        success: function(data){
            var xml = $(data);
            rc = slang.onLoadResource(ext, xml);
        },
        complete: function(data){
            if(errmsg != "")
            {
                /* display alert message when errors occured. */
                /* alert(errmsg); */
                rc = false;
            }
            if(rc)
            {
                slang.translate(ext);
            }
            return rc;
        }
    });
};

/* analyze XML translation file */
slang._current_tree = null;
slang.onLoadResource = function(ext, xml)
{
    var obj = null;
    try
    {
        obj = $(xml).find('Group');
        if(obj != null)
        {
            obj.each(slang.load_group);
        }
    }
    catch(e)
    {
        alert('err! : ' + e.message);
        return false;
    }
    return true;
};

slang.load_group = function()
{
    var name = $(this).attr('name');
    if(name === 'General')
    {
        /* General group will set root node of tree */
        slang._current_tree.current_node = slang._current_tree.root;
        $(this).find('String').each(slang.set_value);
    }
    else
    {
        /* Other groups set under the parent tree */
        if(slang._current_tree.current_node.find(name) === null)
        {
            slang._current_tree.current_node.append(new slang.TreeNode(name));
        }
        slang._current_tree.begin(name);
        $(this).find('String').each(slang.set_value);
        slang._current_tree.end();
    }
};

/* set language translation pair to the current node */
slang.set_value = function()
{
    var key = $(this).find('Source').text();
    var value = $(this).find('Dest').text();
    if(key && value)
    {
        key = key.trim();
        value = value.trim();
        slang._current_tree.current_node.regist(key, value);
    }
};

/* execute translation by specific language. */
slang.translate = function(lang)
{
    slang.translating_language = lang;
    var key = lang + '_tree';
    slang._current_tree = slang.LANGUAGES[key];
    /* translate each tags of slang class */
    $('.' + slang.css_tr).each(slang.translate_tags);
};

/* translate the sentences in HTML tags */
slang.translate_tags = function()
{
    /* begin into group */
    var group_changed = false;
    
    if($(this).hasClass(slang.css_notr))
    {
        return;
    }
    
    if($(this).hasClass(slang.css_group))
    {
        var id = $(this).attr('id');
        if(id)
        {
            slang._current_tree.begin(id);
            group_changed = true;
        }
    }
    
    /* translate child nodes first. */
    $(this).children().each(slang.translate_tags);

    /* translate current node. */
    var text = $(this).text().replace(/^[\s|\n|\r|\r\n]+|[\s|\n|\r|\r\n]+$/g, '');
    if((text !== null) && (text !== ''))
    {
        var html = $(this).html();
        var changed = slang._current_tree.tr(html);
        if(changed !== html)
        {
            $(this).html(changed);
        }
    }
    /* translate img::alt tags */
    $(this).find('img').each(function(){
        var alt = $(this).attr('alt');
        if(alt)
        {
            changed = slang._current_tree.tr(alt);
            if(changed !== alt)
            {
                $(this).attr('alt', changed);
            }
        }
    });
    
    /* you can override slang.custom() function */
    /* slang.translating_language variable is language key.*/
    if(typeof slang.custom === 'function')
    {
        slang.custom(this);
    }

    /* exit group */
    if(group_changed)
    {
        slang._current_tree.end();
    }
};

/* execute on loaded web page at first. */
slang.addOnloadEvent = function(fnc)
{
    if(typeof window.addEventListener != "undefined")
    {
        window.addEventListener("load", fnc, false);
    }
    else if(typeof window.attachEvent != "undefined")
    {  
        window.attachEvent("onload", fnc);  
    }
};

/* The first function on loaded web page */
slang.addOnloadEvent(slang.loadTranslateFiles);


