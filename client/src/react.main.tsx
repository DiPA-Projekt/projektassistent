import React, { Suspense, version } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import App from './components/app/App';

import { run } from './app.run';
import { TailoringSessionContextProvider } from './context/TailoringContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { TemplateSessionContextProvider } from './context/TemplateContext';

run('React', version, () => {
  const htmlDivElement: HTMLDivElement | null = document.querySelector('div#dipa-projektassistent');
  if (htmlDivElement instanceof HTMLDivElement) {
    ReactDOM.render(
      // <React.StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <I18nextProvider i18n={i18n}>
          {/*<ConfigProvider locale={deDE}>*/}
          <HashRouter>
            <TailoringSessionContextProvider>
              <TemplateSessionContextProvider>
                <App />
              </TemplateSessionContextProvider>
            </TailoringSessionContextProvider>
          </HashRouter>
          {/*</ConfigProvider>*/}
        </I18nextProvider>
      </Suspense>,
      // </React.StrictMode>,
      htmlDivElement
    );
  }
});
