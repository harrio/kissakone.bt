$(window).load(function() { 
    console.log("poo");
    $(".switchForm").submit(function(event) {
        console.log("jes");
        /* stop form from submitting normally */
        event.preventDefault();
 
        /* get some values from elements on the page: */
        var $form = $(this),
        //term = $form.find( 'input[name="s"]' ).val(),
        url = $form.attr('action');
 
        /* Send the data using post */
        var posting = $.post(url, collectData($form));
 
        /* Put the results in a div */
        posting.done(function( data ) {
            //var content = $(data).find('#content');
            $("#result").empty().append(data);
        });
    });

    $("#runDatePicker").datepicker();
});

var collectData = function($form) {
    if ($form.attr('id') === 'addRunForm') {
        return { "name": "name1", "date": $("#runDatePicker").datepicker("getDate") };
    }
    return {}
}