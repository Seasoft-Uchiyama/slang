/*
*  Seasoft language translator data node : slang_tree.js
*  Version 2.0.0 using red-black-tree
*  Version 2.2.0 support IE 11.
*
*  Copyright (c) 2019 by Seasoft Corporation. All rights reserved.
*  Made in Japan. https://seasoft.co.jp/
*  This software is released under the MIT License, see License.txt.
*
*  This program depend on red-black-tree javascript by Kevin Lindsay.
*  http://www.kevlindev.com/utilities/index.htm
*  
*/
/* namespace */
var slang = slang || {};

slang.Pair = function(key, value)
{
    this.key = key;
    this.value = value;
};

slang.Pair.prototype.compare = function(target)
{
    if(this.key < target.key)
    {
        return -1;
    }
    else if(target.key < this.key)
    {
        return 1;
    }
    return 0;
};

slang.TreeNode = function(name)
{
    /* details */
    this.name = name;   /* node name = grouping block name */
    /* create red black tree */
    this.tree = new RedBlackTree();
    /* link */
    this.parent = null;
    this.children = [];
};
    
slang.TreeNode.prototype.append = function(child)
{
    var lenth = this.children.push(child);
    child.parent = this;
    return length;
};

slang.TreeNode.prototype.find = function(name)
{
    if(this.name === name)
    {
        return this;
    }
    for(let i = 0; i < this.children.length; i++)
    {
        var result = this.children[i].find(name);
        if(result != null)
        {
            return result;
        }
    }
    return null;
};

slang.TreeNode.prototype.regist = function(key, value)
{
    this.tree.add(new slang.Pair(key, value));
};

slang.Tree = function(language)
{
    /* the name of root node is language */
    this.root = new slang.TreeNode(language);
    this.current_node = this.root;
};
    
    /* moving current node group */
slang.Tree.prototype.begin = function(name)
{
    var node = this.current_node.find(name);
    if(node === null)
    {
        node = this.root.find(name);
    }
    if(node === null)
    {
        this.current_node = this.root;
    }
    else
    {
        this.current_node = node;
    }
    return this.current_node;
};
    
    /* back to parent of current group */
slang.Tree.prototype.end = function()
{
    var parent = this.current_node.parent;
    if(parent === null)
    {
        this.current_node = this.root;
    }
    else
    {
        this.current_node = parent;
    }
    return this.current_node;
};
    
/* translator */
slang.Tree.prototype.tr = function(str)
{
    var token = str.replace(/^[\s|\n|\r|\r\n]+|[\s|\n|\r|\r\n]+$/g, '');
    /* to ignore single tags */
    var tokens = token.split(/<br.*>|<input.*>|<img.*>|<hr.*>|<a\s+.*\/a>|<span.*\/>|<strong.*\/>|<font.*\/font>|<i.*\/i>/i);
    if(0 < tokens.length)
    {
        for(let i = 0; i < tokens.length; ++i)
        {
            var text = tokens[i];
            if(!text)
            {
                continue;
            }
            text = text.replace(/^[\s|\n|\r|\r\n]+|[\s|\n|\r|\r\n]+$/g, '');
            if(!text)
            {
                continue;
            }
            var current = this.current_node;
            /* the pair value is unnecessary for to compare each nodes */
            var check = new slang.Pair(text);   
            while(current !== null)
            {
                var node = current.tree.find(check);
                if(node !== null)
                {
                    var result = str.replace(text, node.value);
                    while(result !== str)
                    {
                        str = result;
                        result = str.replace(text, node.value);
                    }
                }
                /* Move to the upper direction to translate text. */
                current = current.parent;
            }
        }
    }
    return str;
};
