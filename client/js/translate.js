(function () {
i18next
  .use(i18nextXHRBackend)
  .init({
    debug: true,
    lng: navigator.language.substring(0,2),
    fallbackLng: "en",
    backend: {
      loadPath: "../locales/{{lng}}.json"
    }
  }, () => {
    updateContent()
    clientReady()
  });
})();

function updateContent() {
  $('button, a, :header').each((i, elt) => {
    $(elt).html(i18next.t(elt.id))
  })

  $('input').each((i, elt) => {
    $(elt).attr('placeholder', i18next.t(elt.id))
  })
}
