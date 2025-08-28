import 'baseUrl.dart';

class BaseApi {
  ////////////////////////////////[ USER API ] ///////////////////////////////////////
  static String connexionEndpoint = '${BaseUrl.currentUrl}/api/auth/local';
  static String registerEndpoint = '${BaseUrl.currentUrl}/api/auth/local/register';
  static String userInfoEndpoint = '${BaseUrl.currentUrl}/api/users/me';
  static String userEndpoint = '${BaseUrl.currentUrl}/api/users';
  static String changePasswordEndpoint ='${BaseUrl.currentUrl}/api/auth/change-password';
  static String forgotPasswordEndpoint = '${BaseUrl.currentUrl}/api/auth/forgot-password';
  static String resetPasswordEndpoint = '${BaseUrl.currentUrl}/api/auth/reset-password';

  static String bobAccountForgotPasswordEndpoint = '${BaseUrl.currentUrl}/api/users-permissions/user/bob-account-forgot-password';
  static String bobAccountCheckResetCodeEndpoint = '${BaseUrl.currentUrl}/api/users-permissions/user/bob-verify-reset-code';
  static String bobAccountResetPasswordEndpoint = '${BaseUrl.currentUrl}/api/users-permissions/user/bob-reset-password';

  static String googleCallback = '${BaseUrl.currentUrl}/api/auth/google/callback';
  static String facebookCallback = '${BaseUrl.currentUrl}/api/auth/facebook/callback';


  //////////////////////////////// [CONTACT API] ///////////////////////////////////////////
  static String getContactEndpoint = '${BaseUrl.currentUrl}/api/users-permissions/user/contact';
  static String sendInvitationEndpoint = "${BaseUrl.currentUrl}/api/contact-invitations";

  /////////////////////////////// [CONTACT INVITATION API] ///////////////////////////////////////////
  static String deleteContactInvitationEndpoint = "${BaseUrl.currentUrl}/api/contact-invitations";

  // upload file
  static String uploadFile = '${BaseUrl.currentUrl}/api/upload';

  //Onboarding
  static String onboarding = '${BaseUrl.currentUrl}/api/mobile-pages';

  //Bob type
  static String bobTypes = '${BaseUrl.currentUrl}/api/type-bobs';

  static String products = '${BaseUrl.currentUrl}/api/products';

  static String updateProducts = '${BaseUrl.currentUrl}/api/products/'; // documentId

  static String lendBorrow = '${BaseUrl.currentUrl}/api/pret-empunts';
  
  static String requestLendEndpoint = '${BaseUrl.currentUrl}/api/demande-prets';

  static String updateLendEndpoint = '${BaseUrl.currentUrl}/api/demande-prets/'; // documentId

  static String borrowDemand = '${BaseUrl.currentUrl}/api/demande-emprunts'; 

  static String updateBorrowEndpoint = '${BaseUrl.currentUrl}/api/demande-emprunts/'; // documentId

  static String deleteBorrowEndPoint = '${BaseUrl.currentUrl}/api/demande-emprunts';

  static var ownerProduct = '${BaseUrl.currentUrl}/api/products/by-owner';

  //***************** COLLECTIFS *****************/
  static String collectifs = '${BaseUrl.currentUrl}/api/collectifs';

  /////////// [NOTIFICATION API] ////////////
  static String notificationEndpoint = '${BaseUrl.currentUrl}/api/notifications';
  static String notificationUpdateEndpoint = '${BaseUrl.currentUrl}/api/notifications/';
  static String notificationByUserEndpoint = '${BaseUrl.currentUrl}/api/notifications/by-user/';
  static String pushNotificationEndpoint = '${BaseUrl.currentUrl}/api/notifications/target-user/';
  static String notifierEndpoint = '${BaseUrl.currentUrl}/api/notifications/notifier';

  static String validateLendEndpoint = '${BaseUrl.currentUrl}/api/notifications';

  static String validateBorrowEndpoint = '${BaseUrl.currentUrl}/api/demande-emprunts/validate';

  static String demandeServiceEndpoint = '${BaseUrl.currentUrl}/api/demande-services';
  
  static String deleteServiceEndpoint = demandeServiceEndpoint;

  //////////////////// [MODIFICATION DEMANDE PRET] /////////////////////
  static String modificationDemandePretEndpoint ='${BaseUrl.currentUrl}/api/modification-prets';

  static String demandeCollectif = '${BaseUrl.currentUrl}/api/demande-collectifs';

  static String demandePret = '${BaseUrl.currentUrl}/api/demande-prets';
  static String modificationDemandePret = '${BaseUrl.currentUrl}/api/modification-prets';

  //////////////////////// [CHAT/MESSAGE API] //////////////////////////////
   static String messagesEndpoint = '${BaseUrl.currentUrl}/api/messages';
   static String chatEndpoint = '${BaseUrl.currentUrl}/api/chats';
}