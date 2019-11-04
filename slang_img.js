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
    var folder_from = slang.IMAGEPATH;
    var folder_target = slang.IMAGEDIR + '_' + slang.translating_language + '/';
    $(obj).find('img').each(function(){
        var src = $(this).attr('src');
        var dest = src.replace(folder_from, folder_target);
        // ver,2.1.0 add to check exists file
        if(slang.exists(dest) == true)
        {
            var now = new Date();
            var time = now.getTime();
           /*change folder clear browser cache - for chrome -*/
           $(this).attr('src', dest + '?t=' + time);
        }
    });
}
