import { ConfigProvider } from 'antd';
import deDE from 'antd/es/locale/de_DE';
import React, { version } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import App from './components/app/App';

import { run } from './app.run';
import { TailoringSessionContextProvider } from './context/TailoringContext';

run('React', version, () => {
  const htmlDivElement: HTMLDivElement | null = document.querySelector('div#dipa-projektassistent');
  if (htmlDivElement instanceof HTMLDivElement) {
    ReactDOM.render(
      <ConfigProvider locale={deDE}>
        <HashRouter>
          <TailoringSessionContextProvider>
            <App />
          </TailoringSessionContextProvider>
        </HashRouter>
      </ConfigProvider>,
      htmlDivElement
    );
  }
});
