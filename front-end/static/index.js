$(document).ready(function() {

	$('form').on('submit', function(event) {

		$.ajax({
			data : {
				email : $('#email').val(),
				pwd : $('#pass').val()
			},
			type : 'POST',
            url : '/login',
            failure: function(response){
                $('#errorAlert').text(data.error).show();
            }
		})

		event.preventDefault();

	});

});