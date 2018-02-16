/*
 * https://api.jquery.com/jquery.post/
 */

$(document).ready( function() {
    // attach a submit handler to the form
    $("#myForm").submit( function(event) {

        console.log('submitting data for calculation');

        // stop form from submitting normally
        event.preventDefault();

        // get some values from elements on the page:
        var $form = $( this ),
            n1 = $form.find( '#n1' ).val(),
            n2 = $form.find( '#n2' ).val(),
            n3 = $form.find( '#n3' ).val(),
            action = $form.attr( 'action' );

        // send the data using post
        console.log('posting data');
        url = location.href.replace(/\/$/,'') + action;
        data = { n1 : n1, n2 : n2, n3 : n3 };
        console.log('url: ' + url);
        console.log('data: ' + JSON.stringify(data));
        var posting = $.post(url, data);

        // put the results in a div
        posting.done(function(data,status) {
            console.log('plotting results');
            console.log('status : ' + status);
            console.log('data : ' + JSON.stringify(data));

            spirograph = document.getElementById('spirograph');
            Plotly.newPlot(
                spirograph,
                [{
                    x: data.outputs.x,
                    y: data.outputs.y
                }],
                {
                    margin: { t: 0 }
                }
            );
        });
    });
});
