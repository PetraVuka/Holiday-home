
$(function () {
    let selectedDates = [];

    // Funkcija za dohvaćanje cijene datuma iz data atributa
    function getPrice(dateString) {
        return parseInt($(`div[data-date="${dateString}"]`).data('price'));
    }

    $("#calendar").datepicker({
        onSelect: function (dateText) {
            let date = $(this).datepicker('getDate');
            if (selectedDates.includes(dateText)) {
                selectedDates = selectedDates.filter(d => d !== dateText);
            } else {
                selectedDates.push(dateText);
            }
            updateSelectedDates();
        },
        beforeShowDay: function (date) {
            let dateString = $.datepicker.formatDate('mm/dd/yy', date);
            let price = getPrice(dateString);
            return [true, selectedDates.includes(dateString) ? 'selected-date' : '', `Price: $${price}`];
        },
        dateFormat: 'mm/dd/yy'
    });

    function updateSelectedDates() {
        $("#selected-dates").empty();
        if (selectedDates.length > 0) {
            let datesHtml = "<h3>Selected Dates:</h3><ul>";
            selectedDates.forEach(date => {
                let price = getPrice(date);
                datesHtml += `<li>${date} ($${price}) <button class="remove-date" data-date="${date}">Remove</button></li>`;
            });
            datesHtml += "</ul>";
            $("#selected-dates").html(datesHtml);

            $(".remove-date").click(function () {
                let dateToRemove = $(this).data("date");
                selectedDates = selectedDates.filter(d => d !== dateToRemove);
                updateSelectedDates();
                $("#calendar").datepicker("refresh");
            });
        } else {
            $("#selected-dates").html("<p>No dates selected.</p>");
        }
    }

    // Funkcija za slanje odabranih datuma na server
    $("#submit").click(function () {
        console.log(selectedDates);

        $.ajax({
            url: 'http://localhost:8080/api/bookings',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(selectedDates),
            success: function (response) {
                console.log('Selected dates sent successfully:', response);

            },
            error: function (xhr, status, error) {
                console.error('Error sending selected dates:', error);

            }
        });
    });
});
