import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import {i18nOptions} from "./config";

const useHttpBackend = process.env.NODE_ENV !== 'test';
const testResources = {
  resources: {en: {}, de: {}}
};

let i18n = i18next
  .createInstance(useHttpBackend ? {...i18nOptions} : {...i18nOptions, ...testResources});

if (useHttpBackend) {
  i18n = i18n.use(HttpBackend);
}

i18n.init((err, t) => {
  if (err) {
    console.error('Error in i18n init', err);
  }
});

export default i18n;
