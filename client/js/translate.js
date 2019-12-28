(function () {
i18next
  .use(i18nextXHRBackend)
  .init({
    debug: false,
    lng: navigator.language.substring(0,2),
    fallbackLng: "en",
    backend: {
      loadPath: "../locales/{{lng}}.json"
    }
  }, () => {
    if (typeof clientReady === "function") {
      clientReady();
    }
    initJquery();
    $(document).localize(); // translate whole document
  });
})();

function initJquery(){
  jqueryI18next.init(i18next, $, {
    tName: 't',
    i18nName: 'i18n',
    handleName: 'localize',
    selectorAttr: 'data-i18n'
  });
}
