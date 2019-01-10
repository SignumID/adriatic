/// <reference path="jquery-2.1.0.js" />
/// <reference path="SnT.Utils.1.1.js" />

SnTUtils.RegisterNameSpace("SnT.Mobile.Checkout.Contact");

SnT.Contact = new function () {
    var _contact = this;

    this.ContactServiceProxy = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Contact.ContactService.asmx");

    this.Pages = new function () {
        var _pages = this;

        this.Initialize = function (pageType, settings) {
            $(function () {
                SnTUtils.Loader.Delay = 2000;
                _pages[pageType].Initialize(settings);
            });
        };

        this.ContactForm = new function () {
            var _contactForm = this;

            this.Initialize = function () {
                _contactForm.BindEvents();
            };

            this.BindEvents = function () {
                $(document).on("click", '.SubmitContactRequest', function (e) {
                    SubmitContactRequest();
                });
            };

            function SubmitContactRequest() {

                var name = $(".js-callback-name").val();
                var phoneNumber = $(".js-callback-phone").val();

                if (IsValid()) {

                    _contact.ContactServiceProxy.Invoke("SendContactRequest", {
                        sendContactRequestParams: { Name: name, PhoneNumber: phoneNumber }
                    },
                        function (result) {
                            if (result) {
                                $(".js-callback-form").hide();
                                $(".js-callback-done").show();
                            } else {
                                alert("Došlo je do greške prilikom upisa.");
                            }
                        },
                        function (message) { alert("Došlo je do greške prilikom upisa."); }
                    );
                }
            };

            function IsValid(sender) {
                var isValid = true;

                var ime = $(".js-callback-name").val();
                var kontakt = $(".js-callback-phone").val();

                $(".js-callback-name-error").addClass('hidden').parent().removeClass('field-error');
                $(".js-callback-phone-error").addClass('hidden').parent().removeClass('field-error');

                if (ime.length < 1 && (kontakt.length < 1 || isNaN(kontakt))) {
                    $(".js-callback-name-error").removeClass('hidden').parent().addClass('field-error');
                    $(".js-callback-phone-error").removeClass('hidden').parent().addClass('field-error');
                    isValid = false;
                } else if (ime.length < 1) {
                    $(".js-callback-name-error").removeClass('hidden').parent().addClass('field-error');
                    isValid = false;
                } else if (kontakt.length < 1 || isNaN(kontakt)) {
                    $(".js-callback-phone-error").removeClass('hidden').parent().addClass('field-error');
                    isValid = false;
                }

                return isValid;
            }
        };
    };
};