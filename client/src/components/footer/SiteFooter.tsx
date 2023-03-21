import { Col, Layout, Row, Tag } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { STARTUP_TIMESTAMP } from '../../shares/constant';

const { Footer } = Layout;

export const SiteFooter = (props: any) => {
  // public readonly ctrl: FooterController = new FooterController();

  const currentDate: Date = new Date(STARTUP_TIMESTAMP);

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
          Copyright © 2020 - {currentDate.getFullYear()} Weit e.V.
        </Col>
      </Row>
    </Footer>
  );
};
