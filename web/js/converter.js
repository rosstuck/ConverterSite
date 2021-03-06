$(function() {
    var displayError = function(message, project) {
        if (message === false) {
            $('#status-tray').empty();
            return;
        }
        $('#status-tray').html(
            '<div class="alert alert-danger alert-dismissable"><strong>Uh oh.</strong> ' +
            message +
            ' Otherwise, <a href="https://github.com/rosstuck/'+ project + '">please file a bug!</a>' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            '</div>'
        );
    };

    var isValidXMLString = function(xmlString) {
        try {
            $.parseXML(xmlString);
            return true;
        } catch(e) {
            return false;
        }
    };

    var validateInput = function (config) {
        config = $.trim(config);

        if (config === '') {
            displayError('Config is empty. Did you paste something into the "Current Config" field?', 'ConverterSite');
            return false;
        }

        if ($('#old_format').val() === 'xml') {
            if (!isValidXMLString(config)) {
                displayError('The config pasted doesn\'t appear to be valid XML. Are you missing any brackets, etc?', 'TuckConverterBundle');
                return false;
            }

            if (config.indexOf('<?xml') !== 0) {
                displayError('The config doesn\'t begin with a valid XML declaration. Did you paste the complete file, including the xml declaration and any parameters section?', 'TuckConverterBundle');
                return false;
            }
        }

        return true;
    };

    // The basic conversion function
    var convert = function(newFormat) {
        if (!validateInput($('#content').val())) {
            return $.Deferred().reject();
        }

        return $.post('convert.php', {
            new_format: newFormat,
            old_format: $('#old_format').val(),
            content: $('#content').val()

            // Show error
        }).fail(function (response) {
            if (response.status === 400) {
                displayError('Validation error! Did you fill in something weird?', 'ConverterSite');
            } else {
                displayError('Conversion error! Did you set the correct starting format in the dropdown? Try checking the <a href="/gotchas.html">common gotchas!</a>', 'TuckConverterBundle');
            }
            // Remove error
        }).done(function () {
            displayError(false);

            // Reset diagram
        }).always(function () {
            $('#diagram').empty();
        });
    };

    // Convert to a chosen format
    $("#convert-from-list a").click(function(e){
        e.preventDefault();

        convert($(this).data('symfony-format')).done(function (data) {
            $('#new_content').val(data);
        }).fail(function () {
            $('#new_content').val('');
        })
    });

    // Convert to graphviz and render with JS
    $("#visualize").click(function(e){
        convert('gv').done(function (data) {
            $('#diagram').html(Viz(data, "svg"));
        });
    });

    // Let's try to guess the format to make it easier to use
    $('#content').on('paste', function() {
        var $el = $(this);
        // The paste event is actually pre-paste, so use a quick timeout hack
        setTimeout(function() {
            var format;
            if ($.trim($el.val()).substring(0, 1) === '<') {
                format = 'xml';
            } else {
                if ($el.val().indexOf('=') !== -1) {
                    format = 'ini';
                } else {
                    format = 'yml';
                }
            }
            $('#old_format').val(format);
        }, 100);
    });
});

// Copy-to-clipboard functionality
(function () {
    // Client is declared lower because the ZeroClipboard.config call must happen
    // creating the client. Otherwise, variable hoisting takes over.
    var client;
    ZeroClipboard.config({
        moviePath: "js/zeroclipboard/ZeroClipboard.swf"
    });
    client = new ZeroClipboard( document.getElementById("copy-button"));

    client.on( "load", function(client) {
        client.on( "complete", function(client, args) {
            // On copy, change the text momentarily, then flip it back.
            var $el = $(this);

            $el.html('Copied!').removeClass('btn-info').addClass('btn-success').prop('disabled', true);
            setTimeout(function () {
                $el.html('Copy').removeClass('btn-success').addClass('btn-info').prop('disabled', false);
            }, 1200);
        } );
    } );
})();
