
function GoToSalesLead(id, url) {
    window.location = '/podrska/upit?entityId=' + id;
}

// Mobilne usluge - izbor uredaja s kolicinom
function SelectDeviceWithQuantity(id, quantity) {
    alert("Odabran paket " + id + ", komada " + quantity);
}

// Mobilne usluge - odabir tarife (u procesu)
function SelectTariff(id) {
    alert("Odabir tarife " + id);
}

// Mobilne usluge - odabir dodatne opreme
function AddEquipment(id, quantity, refresh) {
    if (refresh) {
        AppendItemToShoppingCart(_cartType, "", id, quantity, window.location.href);
    }
    else {
        AppendItemToShoppingCart(_cartType, "", id, quantity, "");
    }
}

// Mobilne usluge - odabir simpa paketa
function AddPrepaidPackage(id, quantity, refresh) {
    if (refresh) {
        AppendItemToShoppingCart(_cartType, "", id, quantity, window.location.href);
    }
    else {
        AppendItemToShoppingCart(_cartType, "", id, quantity, "");
    }
}

// Mobilne usluge - odabir sim kartice
function AddSimCard(id, quantity, refresh) {
    if (refresh) {
        AppendItemToShoppingCart(_cartType, "", id, quantity, window.location.href);
    }
    else {
        AppendItemToShoppingCart(_cartType, "", id, quantity, "");
    }
}

function DisableCartConfirmation(url) {
    _shoppingCartService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Order.ShoppingCartService.asmx");
    _shoppingCartService.Invoke("SetCartConfirmationSetting", { enabled: false }, function (isEnabledOk) {
        window.location.href = url;
    }
                                ,
                                function (message) {
                                    SnTCms.MessageControl.ShowError(message, true);
                                }
                               );
}

function AddBundle(id) {
    alert("Dodan je izabrani bundle: " + id);
}

// Dodavanje mobitela za usporedbu
function WSMobileComparisonAdd(id, maximumQuantity, uniqueIdentifier, name, contentType) {
    _comparisonService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MobileDeviceComparisonProvider.MobileDeviceComparisonService.asmx");
    _comparisonService.Invoke("MobileComparisonAdd", { entityIdToken: id, maximumQuantity: maximumQuantity, contentType: contentType }, function (response) {

        if (response) {
            AddComparisonItem(id, uniqueIdentifier, name, maximumQuantity)
        }
        else {
        }
    });
    return true;
}

// Micanje mobitela iz usporedbe
function WSMobileComparisonRemove(id, contentType) {
    _comparisonService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MobileDeviceComparisonProvider.MobileDeviceComparisonService.asmx");
    _comparisonService.Invoke("MobileComparisonRemove", { entityIdToken: id, contentType: contentType }, function (response) {

        if (response) {
        }
        return response;
    });
    return true;
}

// Micanje svih mobitela iz usporedbe
function WSMobileComparisonRemoveAll(contentType) {
    _comparisonService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MobileDeviceComparisonProvider.MobileDeviceComparisonService.asmx");
    _comparisonService.Invoke("MobileComparisonRemoveAll", { contentType: contentType }, function (response) {

        if (response) {
        }
    });

}

// Prijava na listu cekanja 
function WaitingListApply(name, phonenumber, email) {
    alert("Prijava na listu cekanja: " + name + " " + phonenumber + " " + email);

    // TODO : Odraditi poziv web servisa i prikazati poruku o uspjehu / neuspjehu
}
/*Zamjena T-Club bodova za nagrade*/
function ExchangePointsForAward(entityIdToken, serviceIdToken, phonenumber) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MobileTClubAwardProvider.TClubAwardModuleService.asmx");

    service.Invoke("ExchangePointsForAward", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken },
                   function (returnCode) {
                       if (returnCode == 1) {
                           SnTCms.MessageControl.ShowMessage("Uspješno ste zamijenili vaše T-Club bodove.", true);
                       }
                       else {
                           SnTCms.MessageControl.ShowError("Došlo je do greške prilikom zamijene T-Club bodova na Vašem pretplatnickom racunu " + phonenumber + ". Pokušajte ponovno.", true);
                       }
                   },
                   function (returnCode) {
                       SnTCms.MessageControl.ShowError("Došlo je do greške prilikom zamijene T-Club bodova na Vašem pretplatnickom racunu " + phonenumber + ". Pokušajte ponovno.", true);
                   }
                  );
}

/*postavlanje session iznosa nadoplate simpa bona i tipa placanja*/
function SetSimpaRechargeTypeAndAmount(amount, paymentMethod) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MobileTClubAwardProvider.TClubAwardModuleService.asmx");
    service.Invoke("SetSimpaRechargeAmount", { amount: amount },
                   function (result) {
                       service.Invoke("SetSimpaRechargeType", { paymentMethod: paymentMethod },
                                      function (result) {
                                          window.location.href = "/mobilne-usluge/narudzba/izbor-bona";
                                      }
                                     );
                   }
                  );

}
/* Aktivacija usluga */
var activationErrorMessage = 'Došlo je do greške kod aktivacije. Molimo pokušajte ponovo.';

function ActivateMaxAdslTrafficPackage(entityIdToken, serviceIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxAdsl.MaxAdslModuleService.asmx");

    service.Invoke("ActivateTrafficPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken, donatAttributes: null },
                   function (response) {
                       if (response.IsSuccess) {
                           SnTCms.MessageControl.ShowMessage(response.Message, true);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ActivateMaxAdslSpeedPackage(entityIdToken, serviceIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxAdsl.MaxAdslModuleService.asmx");

    service.Invoke("ActivateSpeedPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken },
                   function (response) {
                       if (response.IsSuccess) {
                           //var message="Brzina je uspješno aktivirana te iz toga razloga više neće biti prikazana na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";
                           var message = "Vaš zahtjev za promjenom MAXadsl brzine je uspješno zaprimljen! Dodatno ćemo Vas obavijestiti o njegovoj realizaciji. Status svih aktiviranih usluga možete vidjeti i na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu.</a>";

                           SnTCms.MessageControl.ShowMessage(message, true, '/internet/maxadsl/brzina');
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function CancelActivateMaxTvProgramPackage() {
    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendCancelActivate();
}

function CancelOneTimeLogin() {
    lpMTagConfig.vars.push(["page", "IdentificationInvitation", "Refused"]);
    lpMTagConfig.vars.push(["page", "ConversionStep", '1']);
    lpMTagConfig.vars.push(["page", "ConversionStage", 'SelectProduct']);

    lpSendData();
}

function AcceptOneTimeActivationLP() {
    lpMTagConfig.vars.push(["page", "IdentificationInvitation", "Accepted"]);
    lpSendData();

    return true;
}

function ActivateMaxTvProgramPackage(entityIdToken, serviceIdToken, contactEmail, redirectToThakYouPage) {

    var activationErrorCodes = {
        InvalidMobileNumber: 16,
        InvalidEmail: 32
    };

    var isValid = SnTUtils.Validation.ValidateAll();
    if (!isValid) {
        return;
    }

    var isPickbox = $("[type='durationContrainer'] :visible").length > 0;

    var pickBoxData = null;
    if (isPickbox) {

        var selectedMail = $("[type='durationContrainer'] :visible > input[data-type='PasswordDeliveryEmail']").val();
        var selectedMailEntityID = $("[type='durationContrainer'] :visible > input[data-type='PasswordDeliveryEmail']").attr('deliveryEntityId');
        var selectedPhoneNumber = $("[type='durationContrainer'] :visible > input[data-type='PasswordDeliverySms']").val();
        var selectedPhoneNumberEntityId = $("[type='durationContrainer'] :visible > input[data-type='PasswordDeliverySms']").attr('deliveryEntityId');
        var selectedBaseEntityId = $("[type='durationContrainer'] :visible > input[data-type='PasswordDeliveryBase']").attr('deliveryEntityId');

        var selectedContractDuration = $("[type='durationContrainer']:visible").attr("contractDuration");
        var selectedDelivery = $("input[name=deliveryTypeSelect_" + selectedContractDuration + "]:visible:checked").attr('deliveryType');

        if ($('#privola').is(':visible')) {
            if ($('#privola').is(':checked')) {
                var selectedHDCompliance = $("[type='durationContrainer'] :visible > input[data-type='HdCompliance'][hdComplianceValue='Da']").attr('hdComplianceValue');
                var selectedHDComplianceEntityId = $("[type='durationContrainer'] :visible > input[data-type='HdCompliance'][hdComplianceValue='Da']").attr('deliveryEntityId');
            }
            else {
                var selectedHDCompliance = $("[type='durationContrainer'] :visible > input[data-type='HdCompliance'][hdComplianceValue='Ne']").attr('hdComplianceValue');
                var selectedHDComplianceEntityId = $("[type='durationContrainer'] :visible > input[data-type='HdCompliance'][hdComplianceValue='Ne']").attr('deliveryEntityId');
            }
        }

        pickBoxData = new Object();
        pickBoxData.PasswordDeliveryEmail = selectedMail;

        pickBoxData.PasswordDeliverySms = selectedPhoneNumber;
        pickBoxData.SmsEntityIdToken = selectedPhoneNumberEntityId;
        if (selectedBaseEntityId !== 'undefined' && selectedBaseEntityId !== null && selectedBaseEntityId !== undefined) {
            pickBoxData.PasswordDeliveryBase = true;
        }

        pickBoxData.SelectedDeliveryType = selectedDelivery;
        if ($('#privola').is(':visible')) {
            pickBoxData.HdCompliance = selectedHDCompliance;
        }
    }

    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxTv.MaxTvModuleService.asmx");

    service.Invoke("ActivateProgramPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken, pickboxData: pickBoxData, contactEmail: contactEmail },
           function (response) {

               if (response.IsSuccess) {

                   var serviceChatOptionActivation = ServiceChatOptionActivation();

                   var orderCategory = "1-262144-1-1-0-0-0";

                   serviceChatOptionActivation.SendPreSuccess({
                       OrderProductName: response.ProgramPackageName,
                       OrderNumber: response.OrderNumber,
                       OrderTotal: response.OrderTotal,
                       OrderCategory: orderCategory
                   });

                   var message = "Programski paket je uspješno aktiviran te iz toga razloga više neše biti prikazan na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";

                   var queryString = serviceChatOptionActivation.CreateSuccessQueryString(orderCategory);
                   var redirectUrl = "/televizija" + queryString;
                   if (typeof redirectToThankYouPage !== undefined && redirectToThakYouPage == true) {
                       redirectUrl = "/webshop/televizija/programski-paketi/zahvala" + queryString;
                       SnTUtils.HttpContext.Response.Redirect(redirectUrl);
                   } else {
                       SnTCms.MessageControl.ShowMessage(message, true, redirectUrl);
                   }

               } else {

                   if (response.ErrorCode == activationErrorCodes.InvalidMobileNumber) {
                       SnTCms.MessageControl.ShowError("Mobilni broj nije ispravan.", true);
                   } else if (response.ErrorCode == activationErrorCodes.InvalidEmail) {
                       SnTCms.MessageControl.ShowError("Email nije u ispravnom formatu.", true);
                   } else if (response.Message) {
                       SnTCms.MessageControl.ShowError(response.Message);
                   } else {
                       SnTCms.MessageControl.ShowError("Dogodila se greška prilikom aktivacije paketa.", true);
                   }
               }
           },
           function (message) {
               SnTCms.MessageControl.ShowError(message, true);
           }
          );

    PopUpLayer.hide();
}

/*
function ActivateMaxTvProgramPackage (entityIdToken, serviceIdToken, contactEmail, redirectToThakYouPage) {

var activationErrorCodes = { 
  InvalidMobileNumber : 16, 
  InvalidEmail : 32 
};

    var isValid = SnTUtils.Validation.ValidateAll();
  if (!isValid) {
      return;
  }

  var isPickbox = $("[type='durationContrainer'] :visible").length > 0;

  var pickBoxData = null;
  if (isPickbox) {

      var selectedMail = $("[type='durationContrainer'] :visible > input[data-type='EMAIL']").val();
      var selectedMailEntityID = $("[type='durationContrainer'] :visible > input[data-type='EMAIL']").attr('deliveryEntityId');
      var selectedPhoneNumber = $("[type='durationContrainer'] :visible > input[data-type='SMS']").val();
      var selectedPhoneNumberEntityId = $("[type='durationContrainer'] :visible > input[data-type='SMS']").attr('deliveryEntityId');
      var selectedBaseEntityId = $("[type='durationContrainer'] :visible > input[data-type='BASE']").attr('deliveryEntityId');

      var selectedContractDuration = $("[type='durationContrainer']:visible").attr("contractDuration");
      var selectedDelivery = $("input[name=deliveryTypeSelect_" + selectedContractDuration + "]:visible:checked").attr('deliveryType');

      pickBoxData = new Object();
      pickBoxData.Email = selectedMail;
      pickBoxData.EmailEntityIdToken = selectedMailEntityID;
      pickBoxData.Sms = selectedPhoneNumber;
      pickBoxData.SmsEntityIdToken = selectedPhoneNumberEntityId;
      pickBoxData.Base = true;
      pickBoxData.BaseEntityIdToken = selectedBaseEntityId;
      pickBoxData.SelectedType = selectedDelivery;
  }

  var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxTv.MaxTvModuleService.asmx");

  service.Invoke("ActivateProgramPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken, pickboxData: pickBoxData },
             function (response) {
                 
                 if (response.IsSuccess) {

                     var serviceChatOptionActivation = ServiceChatOptionActivation();

                     var orderCategory = "1-262144-1-1-0-0-0";

                     serviceChatOptionActivation.SendPreSuccess({
                         OrderProductName: response.ProgramPackageName,
                         OrderNumber: response.OrderNumber,
                         OrderTotal: response.OrderTotal,
                         OrderCategory: orderCategory
                     });

                     var message = "Programski paket je uspješno aktiviran te iz toga razloga više neše biti prikazan na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";

                     var queryString = serviceChatOptionActivation.CreateSuccessQueryString(orderCategory);
                     var redirectUrl = "/televizija" + queryString;
                     if (typeof redirectToThankYouPage !== undefined && redirectToThakYouPage == true) {
                         redirectUrl = "/televizija/programski-paketi/zahvala" + queryString;
                     }

                     SnTCms.MessageControl.ShowMessage(message, true, redirectUrl);

                 } else {
                     
                     if (response.ErrorCode == activationErrorCodes.InvalidMobileNumber){
                         SnTCms.MessageControl.ShowError("Mobilni broj nije ispravan.", true);
                     } else if (response.ErrorCode == activationErrorCodes.InvalidEmail) {
                         SnTCms.MessageControl.ShowError("Email nije u ispravnom formatu.", true);
                     } else if (response.Message) {
                         SnTCms.MessageControl.ShowError(response.Message);
                     } else {
                         SnTCms.MessageControl.ShowError("Dogodila se greška prilikom aktivacije paketa.", true);
                     }
                 }
             },
             function (message) {
                 SnTCms.MessageControl.ShowError(message, true);
             }
            );

    PopUpLayer.hide();
}

*/

/*
function ActivateMaxTvRecordingPackage(entityIdToken, serviceIdToken)
{
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxTv.MaxTvModuleService.asmx");
    
    service.Invoke("ActivateRecordingPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken }, 
                   function(response)
                   {
                       if (response.IsSuccess)
                       {
                           
                           var message="Paket snimalice je uspješno aktiviran te iz toga razloga više neće biti prikazan na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";
                           SnTCms.MessageControl.ShowMessage(message, true, '/televizija/snimalica'); 
                       }
                       else
                       {
                           if (response.Message != null) 
                           { 
                               SnTCms.MessageControl.ShowError(response.Message, true); 
                           } 
                           else 
                           { 
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           } 
                       }	
                   }, 
                   function(message) 
                   { 
                       SnTCms.MessageControl.ShowError(message, true);  
                   }
                  ); 
}

*/

MaxTvPageType = {
    List: 1,
    Details: 2
}

/*function ActivateMaxTvProgramPackage(entityIdToken, serviceIdToken)
{
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MaxTv.MaxTvModuleService.asmx");
    
    service.Invoke("ActivateProgramPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken }, 
                   function(response) {
                       var serviceChatOptionActivation = ServiceChatOptionActivation();

                       if (response.IsSuccess) {
                           var orderCategory = "1-262144-1-1-0-0-0";

                           serviceChatOptionActivation.SendPreSuccess({
                               OrderProductName: response.ProgramPackageName,
                               OrderNumber: response.OrderNumber,
                               OrderTotal: response.OrderTotal,
                               OrderCategory: orderCategory
                           });

                           var message = "Programski paket je uspješno aktiviran te iz toga razloga više neće biti prikazan na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";

                           var queryString = serviceChatOptionActivation.CreateSuccessQueryString(orderCategory);
                           var redirectUrl = "/televizija/programski-paketi" + queryString;

                           SnTCms.MessageControl.ShowMessage(message, true, redirectUrl);
                       }
                       else {
                           serviceChatOptionActivation.SendPreFail();

                           var queryString = serviceChatOptionActivation.CreateFailQueryString();
                           var redirectUrl = window.location.pathname + queryString;

                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true, redirectUrl);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true, redirectUrl);
                           }
                       }
                   }, 
                   function(message) 
                   { 
                       SnTCms.MessageControl.ShowError(message, true);  
                   }
                  ); 
}*/

function ActivateHaloAdditionalService(entityIdToken, serviceIdToken, serviceTypeUrl) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Halo.HaloModuleService.asmx");

    service.Invoke("ActivateAdditionalService", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken, donatAttributes: null },
                   function (response) {
                       if (response.IsSuccess) {
                           try {
                               window.dataLayer = window.dataLayer || [];
                               dataLayer.push({
                                   'processUserType': window.location.href.indexOf('/poslovni') > 1 ? 'Business' : 'Private',
                                   'processContractType': 'Service',
                                   'processCategory': 'Halo',
                                   'processProduct': 'HaloService',
                                   'processStep': 'ThankYouNote'
                               });
                           } catch (e) {
                               console.log(e);
                           }
                           var message = "Dodatna usluga je uspješno aktivirana te iz toga razloga više neće biti prikazana na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";
                           SnTCms.MessageControl.ShowMessage(message, true, serviceTypeUrl);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ActivateHaloUserPackage(entityIdToken, serviceIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Halo.HaloModuleService.asmx");

    service.Invoke("ActivateUserPackage", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken },
                   function (response) {
                       if (response.IsSuccess) {
                           try {
                               window.dataLayer = window.dataLayer || [];
                               dataLayer.push({
                                   'processUserType': window.location.href.indexOf('/poslovni') > 1 ? 'Business' : 'Private',
                                   'processContractType': 'Package',
                                   'processCategory': 'Halo',
                                   'processProduct': 'HaloPackage',
                                   'processStep': 'ThankYouNote'
                               });
                           } catch (e) {
                               console.log(e);
                           }
                           var message = "Korisnicki paket je uspješno aktiviran te iz toga razloga više neće biti prikazan na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";
                           SnTCms.MessageControl.ShowMessage(message, true, '/telefon/korisnicki-paketi');
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ServiceChatOptionActivation() {
    _me = {};

    _me.CreateServiceChatInstance = function () {
        window.lpMTagConfig = lpMTagConfig || {}; lpMTagConfig.pageVar = lpMTagConfig.pageVar || []; lpMTagConfig.vars = lpMTagConfig.vars || [];
        //lpMTagConfig.vars.OrderCategories = CreateOrderCategories();
    };

    _me.SetContextSpecificVariables = function (data) {
        if (data && data.ChatContext === "MobilePrepaid") {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.Unit, "consumer-shop"]);
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.Section, "MobileVoice"]);
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionType, "Order"]);
        }
    };

    _me.SetDataVariables = function (data) {
        if (data && data.OrderProductName) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.OrderProductName, data.OrderProductName]);
        }

        if (data && data.OrderNumber) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.OrderNumber, data.OrderNumber]);
        }

        if (data && data.OrderTotal) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.OrderTotal, data.OrderTotal]);
        }

        if (data && data.OrderCategory) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.OrderCategory, data.OrderCategory]);
        }

        if (data && data.ConversionCategory) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionCategory, data.ConversionCategory]);
        }

        if (data && data.ConversionStage) {
            lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, data.ConversionStage]);
        }
    };

    _me.SendPreSuccess = function (data) {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConfirmOrderQuestion, "Accepted"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "8"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, "Activation"]);

        _me.SetDataVariables(data);
        _me.SetContextSpecificVariables(data);

        lpSendData();
    };

    _me.SendSuccess = function (data) {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "9"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, "Confirmation"]);

        _me.SetDataVariables(data);
        _me.SetContextSpecificVariables(data);

        lpSendData();
    };

    _me.SendPreFail = function () {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "8"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, "Activation"]);

        lpSendData();
    };

    _me.SendOptionListActivationFail = function (data) {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "5"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, "SelectProduct"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ErrorCount, "1"]);

        _me.SetDataVariables(data);
        _me.SetContextSpecificVariables(data);

        lpSendData();
    };

    _me.SendFail = function (data) {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "6"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStage, "SelectProduct"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ErrorCount, "1"]);

        _me.SetDataVariables(data);
        _me.SetContextSpecificVariables(data);

        lpSendData();
    };

    _me.GetQueryString = function () {
        url = window.location.href;
        qIndex = url.indexOf("?");

        if (qIndex === -1) {
            return null;
        } else {
            return url.substring(qIndex);
        }
    };

    _me.CreateFailQueryString = function () {
        var queryString = _me.GetQueryString();
        var qsm = new SnTUtils.QueryStringManager(queryString);
        qsm.SetItem(_me.Constants.QueryStringConversionStep, "6");
        qsm.SetItem(_me.Constants.QueryStringConversionStage, "SelectProduct");

        return qsm.ToString(true);
    };

    _me.CreateSuccessQueryString = function (orderCategory) {
        var queryString = _me.GetQueryString();
        var qsm = new SnTUtils.QueryStringManager(queryString);
        qsm.SetItem(_me.Constants.QueryStringConversionStep, "9");
        qsm.SetItem(_me.Constants.QueryStringConversionStage, "Confirmation");
        qsm.SetItem(_me.Constants.QueryStringOrderCategory, orderCategory);

        return qsm.ToString(true);
    };

    _me.SendCancelActivate = function (data) {
        _me.CreateServiceChatInstance();

        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConfirmOrderQuestion, "Refused"]);
        lpMTagConfig.vars.push([_me.Constants.Page, _me.Constants.ConversionStep, "7"]);

        _me.SetDataVariables(data);
        _me.SetContextSpecificVariables(data);

        lpSendData();
    };

    _me.Constants = {
        Page: "page",
        ConfirmOrderQuestion: "ConfirmOrderQuestion",
        ConversionStep: "ConversionStep",
        ConversionStage: "ConversionStage",
        OrderProductName: "OrderProductName",
        OrderNumber: "OrderNumber",
        OrderTotal: "OrderTotal",
        OrderCategory: "OrderCategory",
        QueryStringConversionStep: "lpcStp",
        QueryStringConversionStage: "lpcStg",
        QueryStringOrderCategory: "gapt",
        ErrorCount: "ErrorCount",
        Unit: "Unit",
        Section: "Section",
        ConversionType: "ConversionType",
        ConversionCategory: "ConversionCategory"
    };

    return _me;
}

function CancelActivateHaloOption() {
    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendCancelActivate();
}

function ActivateHaloTariffOption(entityIdToken, serviceIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Halo.HaloModuleService.asmx");

    service.Invoke("ActivateTariffOption", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken },
                   function (response) {
                       var serviceChatOptionActivation = ServiceChatOptionActivation();

                       if (response.IsSuccess) {
                           var orderCategory = "16-8192-1-1-0-0-0";

                           serviceChatOptionActivation.SendPreSuccess({
                               OrderProductName: response.TariffOptionName,
                               OrderNumber: response.OrderNumber,
                               OrderTotal: response.OrderTotal,
                               OrderCategory: orderCategory
                           });

                           var message = "Tarifna opcija je uspješno aktivirana te iz toga razloga više neće biti prikazana na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";

                           var queryString = serviceChatOptionActivation.CreateSuccessQueryString(orderCategory);
                           var redirectUrl = "/telefon/tarifne-opcije" + queryString;

                           SnTCms.MessageControl.ShowMessage(message, true, redirectUrl);
                       } else {
                           serviceChatOptionActivation.SendPreFail();

                           var queryString = serviceChatOptionActivation.CreateFailQueryString();
                           var redirectUrl = window.location.pathname + queryString;

                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true, redirectUrl);
                           } else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true, redirectUrl);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ActivateDataSpeed(id) {
    alert("aktivacija MAXadsl brzine");
}

function CancelActivateMobilePostpaidOption() {
    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendCancelActivate();
}

function ActivateMobilePostpaidOption(serviceIdToken, optionCodeToken, transactionIdToken, title, phoneNumber, tariff, startDate, price, errorMessage, entityIdToken, promoPrice, promoDescription) {
    // aktivacija mobile postpaid opcije
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.CSC.Modules.Package__SnT.THTCms.CSC.Modules.MobilePostpaid.MobileModuleService.asmx");

    var act = new SnTScripts.ElementActions();
    act.DisableAllElementsOnRequest('.button');

    var parameters = { "EntityIdToken": entityIdToken ? entityIdToken : null };

    service.Invoke("ActivateOptionEx", { optionCodeToken: optionCodeToken, transactionIdToken: transactionIdToken, serviceIdToken: serviceIdToken, parameters: parameters },
                   function (response) {
                       act.EnableAllElementsOnResponse('.magenta_btn');

                       if (response.IsSuccess) {
                           modal_available_init(serviceIdToken, optionCodeToken, response.TransactionIdToken, title, phoneNumber, tariff, startDate, price, errorMessage, response.Message, entityIdToken, promoPrice, promoDescription);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(errorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       act.EnableAllElementsOnResponse('.button');
                       SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                   }
                  );

}

function ActivateMobilePostpaidOptionFinal(serviceIdToken, optionCodeToken, transactionIdToken, errorMessage, entityIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Tariff.TariffOptionMobilePostpaidService.asmx");

    service.Invoke("ActivateOptionFinalEx", { optionCodeToken: optionCodeToken, transactionIdToken: transactionIdToken, serviceIdToken: serviceIdToken, entityIdToken: entityIdToken },

                   function (response) {
                       var serviceChatOptionActivation = ServiceChatOptionActivation();

                       if (response.IsSuccess) {
                           var orderCategory = "4-8192-1-1-0-0-0";

                           serviceChatOptionActivation.SendPreSuccess({
                               OrderProductName: response.TariffOptionName,
                               OrderNumber: response.OrderNumber,
                               OrderTotal: response.OrderTotal,
                               OrderCategory: orderCategory
                           });

                           var message = "Tarifna opcija je uspješno aktivirana te iz toga razloga više neće biti prikazana na listi dostupnih usluga. Status aktiviranih usluga možete vidjeti na <a href='https://moj.hrvatskitelekom.hr/public'>Moj Telekom Portalu</a>";

                           var queryString = serviceChatOptionActivation.CreateSuccessQueryString(orderCategory);
                           var redirectUrl = "/mobilne-usluge/pretplatnici/tarifne-opcije" + queryString;

                           SnTCms.MessageControl.ShowMessage(message, true, queryString);
                       } else {
                           serviceChatOptionActivation.SendPreFail();

                           var qsm = new SnTUtils.QueryStringManager(window.location.href);
                           qsm.SetItem('lpcConversionStep', '6');
                           qsm.SetItem('lpcConversionStage', 'SelectProduct');
                           var redirectUrl = window.location.pathname + qsm.ToString(true);

                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true, redirectUrl);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true, redirectUrl);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function CancelActivateMobilePrepaidOption() {
    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendCancelActivate({
        ConversionCategory: "prepaid-voice-option-activation",
        ChatContext: "MobilePrepaid"
    });
}

function ActivateMobilePrepaidOption(serviceIdToken, optionCodeToken, transactionIdToken, entityIdToken, successFn, errorFn) {
    // aktivacija simpa tarifne opcije
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.CSC.Modules.Package__SnT.THTCms.CSC.Modules.MobilePrepaid.MobileModuleService.asmx");

    var parameters = {
        "EntityIdToken": entityIdToken ? entityIdToken : null
    };

    var ajaxParams = {
        optionCodeToken: optionCodeToken,
        transactionIdToken: transactionIdToken,
        serviceIdToken: serviceIdToken,
        parameters: parameters
    };

    service.Invoke("ActivateOptionEx",
        ajaxParams,
        function (response) {
            if (response && response.IsSuccess) {
                successFn(response.TransactionIdToken);
            } else {
                var message = activationErrorMessage;

                if (response.Message != null) {
                    message = response.Message;
                }

                errorFn(message);
            }
        },
        function () {
            errorFn(activationErrorMessage);
        }
    );
}

function ActivateMobilePrepaidOptionFinal(serviceIdToken, optionCodeToken, transactionIdToken, entityIdToken, successFn, errorFn) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Tariff.TariffOptionMobilePrepaidService.asmx");

    var ajaxParams = {
        optionCodeToken: optionCodeToken,
        transactionIdToken: transactionIdToken,
        serviceIdToken: serviceIdToken,
        entityIdToken: entityIdToken
    };

    service.Invoke("ActivateOptionFinalEx",
        ajaxParams,
        function (response) {
            if (response && response.IsSuccess) {
                successFn(response.Message, response.ItemName, response.OrderId);
            } else {
                if (response.Message != null) {
                    errorFn(response.Message);
                } else {
                    errorFn(activationErrorMessage);
                }
            }
        },
        function () {
            errorFn(activationErrorMessage);
        }
    );
}

function ActivateMobileDataOption(serviceIdToken, optionCodeToken, transactionIdToken, title, phoneNumber, tariff, startDate, price, errorMessage, entityIdToken, promoPrice, promoDescription) {
    // aktivacija mobile postpaid opcije
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.CSC.Modules.Package__SnT.THTCms.CSC.Modules.MobileInternetPostpaid.MobileInternetPostpaidModuleService.asmx");

    var parameters = { "EntityIdToken": entityIdToken ? entityIdToken : null, "ServiceIdToken": serviceIdToken };

    service.Invoke("ActivateOptionEx", { optionCodeToken: optionCodeToken, transactionIdToken: transactionIdToken, serviceIdToken: serviceIdToken, parameters: parameters },
                   function (response) {
                       if (response.IsSuccess) {
                           try {
                               window.dataLayer = window.dataLayer || [];
                               dataLayer.push({
                                   'processUserType': 'Private',
                                   'processContractType': 'OptionActivation',
                                   'processCategory': 'Mobile',
                                   'processProduct': 'PrepaidDataOption',
                                   'processStep': 'ThankYouNote'
                               });
                           } catch (e) {
                               console.log(e);
                           }
                           modal_available_init(serviceIdToken, optionCodeToken, response.TransactionIdToken, title, phoneNumber, tariff, startDate, price, errorMessage, response.Message, entityIdToken, promoPrice, promoDescription);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ActivateMobileDataOptionFinal(serviceIdToken, optionCodeToken, transactionIdToken, errorMessage, entityIdToken) {
    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Tariff.TariffOptionMobilePostpaidService.asmx");

    service.Invoke("ActivateOptionFinalEx", { optionCodeToken: optionCodeToken, transactionIdToken: transactionIdToken, serviceIdToken: serviceIdToken, entityIdToken: entityIdToken },
                   function (response) {
                       if (response.IsSuccess) {
                           try {
                               window.dataLayer = window.dataLayer || [];
                               dataLayer.push({
                                   'processUserType': 'Private',
                                   'processContractType': 'OptionActivation',
                                   'processCategory': 'Mobile',
                                   'processProduct': 'PrepaidDataOption',
                                   'processStep': 'ThankYouNote'
                               });
                           } catch (e) {
                               console.log(e);
                           }
                           SnTCms.MessageControl.ShowMessage(response.Message, true);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError(activationErrorMessage, true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError(message, true);
                   }
                  );
}

function ActivateFixedService(id) {
    alert("aktivacija telefon dodatna usluga");
}

function ActivateFixedOption(id) {
    alert("aktivacija telefon tarifna opcija");
}

function ActivateFixedPackage(id) {
    alert("aktivacija telefon paket");
}

function ActivateSnimalica(id) {
    alert("Aktivacija snimalice " + id);
}

function ActivateFixedTariff(id) {
    alert("Aktivacija fiksne tarife " + id);
}
function SelectRegisteredService(serviceIdToken, url, deleteCartOnSelect) {
    var selectService = function () {
        var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Services.ServiceService.asmx");
        service.Invoke("SelectRegisteredService", { serviceIdToken: serviceIdToken }, function (result) {
            url = String.IsNullOrEmpty(url) ? window.location.href : url

            if ((_isBusinessUser != 'false' || _isUserBusinessAdmin == 'True') && (!url.toLowerCase().beginsWith('/poslovni'))) {
                if (url.match('https://www.hrvatskitelekom.hr/poslovni/') === null) {
                    url = '/poslovni' + url;
                }
            }


            var redirectUrl = url;

            if (url.indexOf("?") > -1) {
                var activeServiceIdTokenKey = "ActiveServiceIdToken".toLowerCase();

                var qsm = new SnTUtils.QueryStringManager(url);
                qsm.RemoveItem(activeServiceIdTokenKey);

                var cleanUrl = url.substring(0, url.indexOf("?"));

                redirectUrl = cleanUrl + qsm.ToString(true);
            }

            //window.location.href = redirectUrl;
            SnTUtils.HttpContext.Response.Redirect(redirectUrl);
        });
    };

    var currentURL = window.location.href;

    if (deleteCartOnSelect) {
        var confirmed = SnTUtils.Confirm("<$ResourceVariable.ChangeActiveService_Alert$>");
        if (confirmed) {
            var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Order.ShoppingCartService.asmx");
            service.Invoke("DeleteShoppingCart", { cartType: _cartType }, function (isDeletedOk) {
                if (isDeletedOk) {
                    SignalClearBasket();
                    selectService();
                }
                else {
                    SnTCms.MessageControl.ShowError("<$ResourceVariable.ChangeActiveService_DeleteCart_Error$>");
                }
            });
        }
    } else if (currentURL.match('/vpn/moj-racun') !== null) {
        var myAccountService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.MyAccount.MyAccountService.asmx");
        myAccountService.Invoke("ValidateActivationCodeByServiceId", { serviceIdToken: serviceIdToken },
                          function (response) {
                              if (response.Succeeded) {
                                  selectService();
                              }
                              else {
                                  SnTUtils.Loader.Hide();
                                  if (response.ErrorMessage && response.ErrorMessage != null) {
                                      SnTCms.MessageControl.ShowError(response.ErrorMessage);
                                  }
                                  else SnTCms.MessageControl.ShowError('Moj račun uslugu nije moguće aktivirati za ovaj broj. Broj nije verificiran.');
                              }
                          },
                          function (message) {
                              SnTUtils.Loader.Hide();
                              SnTCms.MessageControl.ShowError('Dogodila se greška prilikom odabira broja. Molimo pokušajte kasnije.');
                          }
                         );
    } else {
        selectService();
    }
}

function SelectTariffMcd(id, url) {
    window.location = url + '?NoRedirect=1&tariffId=' + id;
}

function SelectTariffCp(id, url) {
    window.location = url + '?NoRedirect=1&lightbox=true&tariffId=' + id;
}

var ChangeTariffReturnCode =
    {
        Success: 0,
        Undefined: -1,
        Error: 1,
        GenericError: 2,
        NotAvailableForActivation: 4,
        NoProfileFromSessionLoaded: 8
    };

function ChangeTariff(serviceIdToken, newTariffIdToken, tariffTypeToken, attributes) {

    var qsm = new SnTUtils.QueryStringManager();

    if (_isUserBusinessAdmin == 'True' && _activeServiceIsVpn == 'True') {
        qsm.SetItem('entityId', newTariffIdToken);
        window.location = _salesLeadUrl + qsm.ToString(true);
    }

    if (typeof (tabMenu) != 'undefined') {
        qsm.SetItem('tarif_type', tabMenu.selectedTabIndex);
    }
    var returnUrl = window.location.pathname + qsm.ToString(true);

    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Tariff.TariffMobilePostpaidService.asmx");
    service.Invoke("ChangePostpaidTariff", { serviceIdToken: serviceIdToken, newTariffIdToken: newTariffIdToken, tariffTypeToken: tariffTypeToken, attributes: attributes },
        function (returnCode) {
            if (returnCode.ErrorMessages !== null) {
                var message = '';
                for (var i = 0; i < returnCode.ErrorMessages.length; i++) {
                    message += returnCode.ErrorMessages[i] + '<br>';
                }
                SnTCms.MessageControl.ShowError(message, true, returnUrl);
            } else if (returnCode.IsSalesLead) {

                if (_isBusinessUser) {
                    window.location = '/poslovni/webshop/zahvala-ctsaleslead?orderidtoken=' + returnCode.OrderIdToken;
                } else {
                    window.location = '/webshop/zahvala-ctsaleslead?orderidtoken=' + returnCode.OrderIdToken;
                }

            } else {

                if (attributes.GroupDiscountSelected && attributes.GroupDiscountSelected === true) {
                    SnTCms.MessageControl.ShowMessage('Zahtjev za promjenom tarife uspješno je zaprimljen! Kako se radi o kompleksnoj promjeni, uskoro ćemo vas kontaktirati kako bismo potvrdili sve detalje vašeg zahtjeva. Promjena će biti odrađena tek nakon Vašeg finalnog odobrenja.', true, returnUrl);
                }
                else {
                    SnTCms.MessageControl.ShowMessage('Zahtjev za promjenom tarife uspješno je zaprimljen. Nova tarifa će se automatski aktivirati početkom sljedećeg obračunskog razdoblja.', true, returnUrl);
                }
            }
        },
        function (message) { SnTCms.MessageControl.ShowError('Dogodila se greška kod promjene tarife.', true, returnUrl); }
    );
}

function TariffQuestionSend(email, question, closebutton) {
    alert("Pošalji upit: " + email + " " + question);

    // TODO : Odraditi poziv web servisa i prikazati poruku o uspjehu / neuspjehu

    closebutton.trigger('click');
}

function OnError(result) {
    alert("error");
    //SnTCms.MessageControl.ShowError("Došlo je do pogreške u radu sustava. Molimo pokušajte kasnije.");
}

function GetIsTariffMember() {
    var isTariffMember = false;
    var url = String.IsNullOrEmpty(url) ? window.location.href : url

    if (url.indexOf("?") > -1) {
        var qsm = new SnTUtils.QueryStringManager(url);
        if (qsm.GetItem("tariffmembertype") == 2) {
            isTariffMember = true;
        }
    }
    return isTariffMember;
}

// add to shopping cart
_shoppingCartService = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Order.ShoppingCartService.asmx");

function AddItemToShoppingCart(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext) {
    saveContext = typeof (saveContext) != 'undefined' ? saveContext : false;

    var isTariffMember = GetIsTariffMember();

    _shoppingCartService.Invoke("AddItemAndReturnProductName", { cartType: cartType, itemType: itemType, entityIdToken: entityIdToken, quantity: quantity, saveContext: saveContext, isTariffMember: isTariffMember, attributes: null }, function (result) {

        if (result.AddedSuccesfully) {
            if (typeof edLayer !== "undefined") {
                edLayer.push(['trackEvent', 'Basket', 'add to basket', result.ItemName]);
            }

            if (typeof window.dataLayer !== "undefined" && typeof window.gaProduct !== "undefined") {
                try {
                    dataLayer.push({
                        'event': 'addToCart',
                        'ecommerce': {
                            'currencyCode': 'HR',
                            'add': {                                // 'add' actionFieldObject measures.
                                'products': window.gaProduct.ecommerce.productDetails.products
                            }
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            }

            if (nextStepUrl == "#") {
                SnTUtils.HttpContext.Response.Refresh();
            }
            else if (nextStepUrl != "") {
                SnTUtils.HttpContext.Response.Redirect(nextStepUrl);
            }
        }
        else {
            SnTCms.MessageControl.ShowError("Odabrani proizvod ili usluga nisu dostupni za Vašu aktivnu uslugu te ih stoga nije moguce realizirati.");
        }
    },
    function (message) {
        SnTCms.MessageControl.ShowError('Dogodila se greška prilikom dodavanja proizvoda u košaricu');
    });
}

function AppendItemWithAttributesToShoppingCart(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext, attributes) {
    AppendItem(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext, attributes);
}

function AppendItemToShoppingCart(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext) {
    AppendItem(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext, null);
}

function AppendItem(cartType, itemType, entityIdToken, quantity, nextStepUrl, saveContext, attributes) {

    saveContext = typeof (saveContext) != 'undefined' ? saveContext : false;

    var isTariffMember = GetIsTariffMember();

    _shoppingCartService.Invoke("AppendItemAndReturnProductName", { cartType: cartType, itemType: itemType, entityIdToken: entityIdToken, quantity: quantity, saveContext: saveContext, isTariffMember: isTariffMember, attributes: attributes }, function (result) {

        if (result.AddedSuccesfully) {
            if (typeof edLayer !== "undefined") {
                edLayer.push(['trackEvent', 'Basket', 'add to basket', result.ItemName]);
            }

            if (nextStepUrl == "#") {
                SnTUtils.HttpContext.Response.Refresh();
            }
            else if (nextStepUrl != "") {
                SnTUtils.HttpContext.Response.Redirect(nextStepUrl);
            }
        }
        else {
            SnTCms.MessageControl.ShowError("Odabrani proizvod ili usluga nisu dostupni za Vašu aktivnu uslugu te ih stoga nije moguce realizirati.");
        }
    },
    function (message) {
        SnTCms.MessageControl.ShowError('Dogodila se greška prilikom dodavanja proizvoda u košaricu');
    });

}

function RemoveItemFromShoppingCart(cartType, entityIdToken) {
    var isTariffMember = GetIsTariffMember();

    _shoppingCartService.Invoke("RemoveItem", { cartType: cartType, entityIdToken: entityIdToken, isTariffMember: isTariffMember }, function (isRemovedOk) {

        if (isRemovedOk) {
            SnTUtils.HttpContext.Response.Refresh();
        }
        else {
            SnTCms.MessageControl.ShowError("Item nije maknut iz košarice");
        }
    },
                                function (message) {

                                    SnTCms.MessageControl.ShowError('<$ResourceVariable.MobilneUsluge_Opcija_ActivationError2$>');
                                });
}

function CancelActivateMobilePrepaidTariff() {
    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendCancelActivate({
        ConversionCategory: "prepaid-voice-tariff-activation",
        ChatContext: "MobilePrepaid",
        ConversionStage: "Activation"
    });
}

function ActivateMobilePrepaidTariff(entityIdToken, serviceIdToken, tariffCodeToken, phone_number, tariff_name, date_active) {

    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.CSC.Modules.Package__SnT.THTCms.CSC.Modules.MobilePrepaid.MobileModuleService.asmx");

    var parameters = { "EntityIdToken": entityIdToken };
    service.Invoke("ActivateTariffEx", { serviceIdToken: serviceIdToken, tariffCodeToken: tariffCodeToken, parameters: parameters },
                   function (response) {
                       if (response.IsSuccess) {
                           modal_simpa_otherwise_init(entityIdToken, response.TransactionIdToken, serviceIdToken, response.Message, phone_number, tariff_name, date_active);
                       }
                       else {
                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError("Dogodila se greška prilikom aktiviranja tarife. Molimo pokušajte ponovo.", true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError("Dogodila se greška prilikom poziva servisa. Molimo pokušajte ponovo.", true);
                   }
                  );
}

function ActivateMobilePrepaidTariffFinal(entityIdToken, serviceIdToken, transactionIdToken) {
    var conversionCategory = "prepaid-voice-tariff-activation";
    var chatContext = "MobilePrepaid";

    var serviceChatOptionActivation = ServiceChatOptionActivation();
    serviceChatOptionActivation.SendPreSuccess({
        ConversionCategory: conversionCategory,
        ChatContext: chatContext
    });

    var service = new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.WS.Modules.Package__SnT.THTCms.WS.Modules.Tariff.TariffMobilePrepaidService.asmx");
    service.Invoke("ActivateTariffFinalEx", { entityIdToken: entityIdToken, serviceIdToken: serviceIdToken, transactionIdToken: transactionIdToken },
                   function (response) {
                       if (response.IsSuccess) {
                           serviceChatOptionActivation.SendSuccess({
                               OrderProductName: response.ItemName,
                               OrderNumber: response.OrderId,
                               ConversionCategory: conversionCategory,
                               ChatContext: chatContext
                           });

                           SnTCms.MessageControl.ShowMessage(response.Message, true);
                       }
                       else {
                           serviceChatOptionActivation.SendFail({
                               ConversionCategory: conversionCategory,
                               ChatContext: chatContext
                           });

                           if (response.Message != null) {
                               SnTCms.MessageControl.ShowError(response.Message, true);
                           }
                           else {
                               SnTCms.MessageControl.ShowError("Dogodila se greška prilikom aktiviranja tarife. Molimo pokušajte ponovo.", true);
                           }
                       }
                   },
                   function (message) {
                       SnTCms.MessageControl.ShowError("Dogodila se greška prilikom poziva servisa. Molimo pokušajte ponovo.", true);
                   }
                  );
}

function SignalClearBasket() {
    if (typeof edLayer !== "undefined") {
        edLayer.push(['trackEvent', 'Basket', 'empty basket']);
    }
}

function SignalClearBasketAndRedirect(url) {
    SignalClearBasket();

    if (url && url != '') {
        SnTUtils.HttpContext.Response.Redirect(url);
    }
}

SnTUtils.RegisterNameSpace("SnTAuditManager");

SnTAuditManager = {

    ServiceProxy: new SnTUtils.ServiceProxy("/App_Modules__SnT.THTCms.MW.Modules.Package__SnT.THTCms.MW.Modules.AuditService.asmx"),
    Write: function (auditData) {

        var defaultAjaxStart = SnTUtils.Elements.Body.ajaxStart;
        var defaultAjaxStop = SnTUtils.Elements.Body.ajaxStop;

        SnTUtils.Elements.Body.unbind('ajaxStart').unbind('ajaxStop');

        var bindAjaxDefaults = function () {
            SnTUtils.Elements.Body.ajaxStart = defaultAjaxStart;
            SnTUtils.Elements.Body.ajaxStop = defaultAjaxStop;
        };

        SnTAuditManager.ServiceProxy.Invoke("Write", {
            "auditData": auditData
        },
        function (data) {
            bindAjaxDefaults();
        },
        function (message) {
            bindAjaxDefaults();
        });
    }
};