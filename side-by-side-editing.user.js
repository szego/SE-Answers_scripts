// ==UserScript==
// @name         SE Side By Side Editing
// @namespace    http://stackexchange.com/users/4337810/
// @version      1.1
// @description  A userscript for Stack Exchange sites that adds the option to have the preview and editor side-by-side when posting and editing questions and answers
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle ('                                      \
    #sidebar.sbs-on {                               \
        display: none !important;                   \
    }                                               \
                                                    \
    #content.sbs-on {                               \
        width: 1360px !important;                   \
    }                                               \
                                                    \
    .draft-saved.sbs-on {                           \
        margin-left: 35px !important;               \
    }                                               \
                                                    \
    .draft-discarded.sbs-on {                       \
        margin-left: 35px !important;               \
    }                                               \
                                                    \
    .draft-saved.sbs-on.sbs-isolated {              \
        margin-left: 40px !important;               \
        height: 15px !important;                    \
        float: left !important;                     \
    }                                               \
                                                    \
    .draft-discarded.sbs-on.sbs-isolated {          \
        margin-left: 40px !important;               \
        height: 15px !important;                    \
        float: left !important;                     \
    }                                               \
                                                    \
    .votecell.sbs-on {                              \
        display: none !important;                   \
    }                                               \
                                                    \
    .hide-preview.sbs-on {                          \
        margin-left: 35px !important;               \
    }                                               \
                                                    \
    .edit-comment-p1.sbs-on {                       \
        float: left !important;                     \
    }                                               \
                                                    \
    .edit-comment-p2.sbs-on {                       \
        float: left !important;                     \
        margin-left: 10px !important;               \
    }                                               \
                                                    \
    .post-editor.sbs-on {                           \
        width: 1360px !important;                   \
    }                                               \
                                                    \
    .wmd-button-bar.sbs-on {                        \
        float: none !important;                     \
    }                                               \
                                                    \
    .wmd-container.sbs-on {                         \
        float: left !important;                     \
    }                                               \
                                                    \
    .wmd-preview.sbs-on {                           \
        clear: none !important;                     \
        float: right !important;                    \
    }                                               \
                                                    \
    .wmd-preview.sbs-on.sbs-isolated {              \
        margin-top: 10px !important;                \
    }                                               \
                                                    \
    .form-item.sbs-on.sbs-isolated {                \
        float: left !important;                     \
    }                                               \
                                                    \
    .preview-options.sbs-on.sbs-isolated {          \
        margin-bottom: -6px !important;             \
    }                                               \
');

/**
 * Toggles side-by-side editing on and off.
 * @param {string} toAppend - Should either be empty or be of the form '-#',
 *                             where # is the id of the question/answer whose
 *                             sbs mode is being toggled.
 */
function sideBySideEditing(toAppend) {
    //variables to reduce DOM searches
    var wmdinput = $('#wmd-input' + toAppend);
    var wmdpreview = $('#wmd-preview' + toAppend);
    var posteditor = $('#post-editor' + toAppend);
    var draftsaved = $('#draft-saved' + toAppend);
    var draftdiscarded = $('#draft-discarded' + toAppend);
    var hidepreview = posteditor.find('.hide-preview');

    $('#wmd-button-bar' + toAppend).toggleClass('sbs-on');
    
    draftsaved.toggleClass('sbs-on');
    draftdiscarded.toggleClass('sbs-on');
    posteditor.toggleClass('sbs-on');
    wmdinput.parent().toggleClass('sbs-on');  //wmdinput.parent() has class wmd-container
    wmdpreview.toggleClass('sbs-on');
    hidepreview.toggleClass('sbs-on');

    //hack: float nuttiness for "Edit Summary" box
    var editcommentp1 = $('#edit-comment' + toAppend).parent().parent().parent().parent().parent();
    editcommentp1.toggleClass('edit-comment-p1 sbs-on');
    editcommentp1.parent().toggleClass('edit-comment-p2 sbs-on');

    if($('#answers').length == 0) {  //extra CSS for editors on isolated pages
        wmdpreview.toggleClass('sbs-isolated');
        draftsaved.toggleClass('sbs-isolated');
        draftdiscarded.toggleClass('sbs-isolated');
        hidepreview.parent().toggleClass('sbs-on sbs-isolated');  //hidepreview.parent() has class preview-options if it exists
        $('.tag-editor').parent().toggleClass('sbs-on sbs-isolated');  //$('.tag-editor').parent() has class form-item
        $('#edit-comment').parent().toggleClass('sbs-on sbs-isolated');  //$('#edit-comment').parent() has class form-item if it exists
        $('#question-only-section').children('.form-item').toggleClass('sbs-on sbs-isolated');

        //swap the order of things to prevent draft saved/discarded messages from
        // moving the preview pane around
        if(wmdpreview.hasClass('sbs-on')) {
            draftsaved.before(wmdpreview);
        } else {
            draftdiscarded.after(wmdpreview);
        }
        wmdpreview.before(hidepreview.parent());
    }

    if(wmdpreview.hasClass('sbs-on')) {  //sbs was toggled on
        $('#sidebar').addClass('sbs-on');
        $('#content').addClass('sbs-on');

        if(toAppend.length > 0) {  //current sbs toggle is for an edit
            $('.votecell').addClass('sbs-on');
        }

        //stretch the text input window to match the preview length
        // - "214" came from trial and error
        // - Can this be done using toggleClass?
        var previewHeight = wmdpreview.height();
        if(previewHeight > 214) {  //default input box is 200px tall, only scale if necessary
            wmdinput.height(previewHeight - 14);
        }
    } else {  //sbs was toggled off
        //check if sbs is off for all existing questions and answers
        if($('.question').find('.wmd-preview.sbs-on').length == 0 && $('.answer').find('.wmd-preview.sbs-on').length == 0) {
            $('.votecell').removeClass('sbs-on');

            if ( !($('#wmd-preview').hasClass('sbs-on')) ) {  //sbs is off for everything
                $('#sidebar').removeClass('sbs-on');
                $('#content').removeClass('sbs-on');
            }
        }

        //return input text window to original size
        // - Can this be done using toggleClass?
        wmdinput.height(200);
    }
}

/**
 * Adds the "Toggle Side-By-Side Editing" button to the UI, as well as the
 *  associated click listeners.
 * @param {jQuery} jNode - A jQuery object which points to the "redo" button
 *                          from the SE composition/editing pane sent by the
 *                          waitForKeyElements() call.
 */
function addButton(jNode) {
    var itemid = jNode[0].id.replace( /^\D+/g, '');
    var toAppend = (itemid.length > 0 ? '-' + itemid : '');  //helps select tags specific to the question/answer being
                                                             // edited (or new question/answer being written)
    setTimeout(function() {
        var sbsBtn = '<li class="wmd-button" title="side-by-side-editing" style="left: 415px;width: 170px;"> \
                      <div id="wmd-sbs-button' + toAppend + '" style="background-image: none;">              \
                      Toggle Side-By-Side Editing</div></li>';
        jNode.after(sbsBtn);
        
        //add click listener to sbsBtn
        jNode.next().on('click', function() {
            sideBySideEditing(toAppend);
        });
        
        //add click listeners for "Save Edits" and "cancel" buttons
        // - also gets added to the "Post New Question" and "Post New Answer" button as an innocuous (I think) side effect
        $('#post-editor' + toAppend).siblings('.form-submit').children().on('click', function() {
            if($(this).parent().siblings('.sbs-on').length > 0) {  //sbs was on, so turn it off
                sideBySideEditing(toAppend);
            }
        });
        $('.review-cancel-editing').on('click', function() {  //for the extra cancel button in the review queue
            if( $('#content').hasClass('sbs-on') ) {  //sbs was on, so turn it off
                sideBySideEditing(toAppend);
            }
        });
    }, 1000)
}

//set up the event listeners for the sbs toggle button(s)

if(window.location.pathname.indexOf('/questions/') > -1) {  //posting a new question or visiting an existing one
    if(window.location.pathname.indexOf('/questions/ask') < 0) {  //visiting an existing question
        var anchorList = $('#answers').children("a");  //answers have anchor tags before them of the form <a name="#">,
                                                       // where # is the answer ID
        var numAnchors = anchorList.length;
        var itemIDs = [];

        for(i = 1; i <= numAnchors-2; i++) {  //the first and last anchors aren't answers
            itemIDs.push(anchorList[i].name);
        }
        itemIDs.push( $('.question').data('questionid') );

        //event listeners for adding the sbs toggle buttons for editing existing questions or answers
        for(i = 0; i <= numAnchors-2; i++) {
            waitForKeyElements('#wmd-redo-button-' + itemIDs[i], addButton);
        }
    }
    //event listener for adding the sbs toggle button for posting new questions or answers
    waitForKeyElements('#wmd-redo-button', addButton);
} else if(window.location.pathname.indexOf('/review/') > -1 ||
          window.location.pathname.indexOf('/posts/') > -1) {  //supported isolated editing pages
    waitForKeyElements('[id^="wmd-redo-button"]', addButton);
}

/* The script does nothing on pages without /questions/, /review/,
 * or /posts/ in the url. Additional code might be required to get
 * it working nicely on other pages---it's preferable that it not
 * be available rather than only work partially.
 */
