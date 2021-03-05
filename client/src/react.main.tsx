import { ConfigProvider } from 'antd';
import deDE from 'antd/es/locale/de_DE';
import React, { version } from 'react';
import ReactDOM from 'react-dom';
// import { BrowserRouter as Router } from 'react-router-dom';
import { HashRouter as Router } from 'react-router-dom';

import { run } from './app.run';
import { AppComponent } from './components/app/component';

run('React', version, () => {
  const htmlDivElement: HTMLDivElement | null = document.querySelector('div#dipa-projektassistent');
  if (htmlDivElement instanceof HTMLDivElement) {
    ReactDOM.render(
      <ConfigProvider locale={deDE}>
        <Router>
          <AppComponent />
        </Router>
      </ConfigProvider>,
      htmlDivElement
    );
  }
});
