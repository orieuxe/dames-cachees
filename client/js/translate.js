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
    updateContent();
  });
})();

function updateContent() {
  $('title').html(i18next.t('title'));

  $('button, a, :header').each((i, elt) => {
    $(elt).html(i18next.t(elt.id))
  })

  $('input').each((i, elt) => {
    $(elt).attr('placeholder', i18next.t(elt.id))
  })
}
