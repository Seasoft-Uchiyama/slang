/*********
*
*  Seasoft language translator appendix : slang_img.js
*
*  Copyright (c) 2019 by Seasoft Corporation. All rights reserved.
*  Made in Japan. https://seasoft.co.jp/
*  This software is released under the MIT License, see License.txt.
*********/

/* namespace */
var slang = slang || {};

/* change image file */
/* change the base folder and language folder name */
slang.custom = function(obj)
{
    var folder_en = 'images/';
    var folder_ja = 'images_' + slang.translating_language + '/';
    $(obj).find('img').each(function(){
        var src = $(this).attr('src');
        var dest = src.replace(folder_en, folder_ja);
        if(src !== dest)
        {
            var now = new Date();
            var time = now.getTime();
           /*change folder clear browser cache - for chrome -*/
           $(this).attr('src', dest + '?t=' + time);
        }
    });
}
