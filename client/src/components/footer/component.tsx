import { Col, Layout, Row, Tag } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// import { GenericComponent } from '@leanup/lib';
// import { ReactComponent } from '@leanup/lib';
//
// import { FooterController } from './controller';

const { Footer } = Layout;

export class FooterComponent extends Component<unknown, unknown> {
  // public readonly ctrl: FooterController = new FooterController();

  public render(): JSX.Element {
    return (
      <Footer>
        <Row>
          <Col xs={24} sm={24} md={8} style={{ textAlign: 'center' }}>
            <ul>
              <li>
                <Link id="impressum" to="/impressum">
                  Impressum
                </Link>
              </li>
              <li>
                <Link id="datenschutz" to="/datenschutz">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={24} lg={8} className="version" style={{ textAlign: 'center' }}>
            <Tag color="purple">{/*{this.ctrl.application.name} {this.ctrl.application.version}*/}</Tag>
          </Col>
          <Col xs={24} sm={24} lg={8} style={{ textAlign: 'center' }}>
            {/*Copyright © 2020 - {this.ctrl.currentDate.getFullYear()} Weit e.V.*/}
          </Col>
        </Row>
      </Footer>
    );
  }
}
