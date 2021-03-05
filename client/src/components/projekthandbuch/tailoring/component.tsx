import { Checkbox, Col, Collapse, Divider, Row, Space } from 'antd';
import React from 'react';

import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { OrgranisationRole, ProjectRole, TailoringController, TailoringRole } from './controller';

import type { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Panel } = Collapse;

function TailoringObject(props: {
  headling: string;
  roles: OrgranisationRole[] | ProjectRole[];
  ctrl: TailoringController;
}) {
  return (
    <>
      <Divider />
      <h1>Projektrollen</h1>
      <Space direction="vertical" style={{ width: '100%' }}>
        {props.roles.map((role: OrgranisationRole | ProjectRole, index: number) => {
          if (!role.dependency || props.ctrl.checkedTailorings.includes(role.dependency)) {
            return (
              <Collapse
                collapsible="header"
                key={`project-${index}`}
                expandIcon={(panelProps: { isActive?: boolean | undefined }) => {
                  return panelProps?.isActive ? <DownOutlined aria-hidden /> : <RightOutlined aria-hidden />;
                }}
              >
                <Panel header={role.label} key={index}>
                  {role.dependency && <p>{props.ctrl.getDependencyLabel(role.dependency)}</p>}
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                  </p>
                </Panel>
              </Collapse>
            );
          } else {
            return null;
          }
        })}
      </Space>
    </>
  );
}

export class TailoringComponent extends ReactComponent<unknown, TailoringController> implements GenericComponent {
  public ctrl: TailoringController = new TailoringController();

  private onChange(checkedValues: CheckboxValueType[]): void {
    this.ctrl.checkedTailorings = checkedValues as string[];
    console.log(this.ctrl.checkedTailorings);
    this.forceUpdate();
  }

  public render(): JSX.Element {
    return (
      <>
        <h1>Tailoring</h1>
        <Checkbox.Group onChange={this.onChange.bind(this)}>
          <Row>
            {this.ctrl.tailoringRoles.map((tailoringRole: TailoringRole, index: number) => {
              return (
                <Col xs={24} sm={24} md={24} lg={12} xl={8} key={`tailoring-${index}`}>
                  <Checkbox value={tailoringRole.key}>{tailoringRole.label}</Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
        {this.ctrl.checkedTailorings.length > 0 && (
          <>
            <TailoringObject headling="Projektrollen" ctrl={this.ctrl} roles={this.ctrl.projectRoles} />
            <TailoringObject headling="Organisationsrollen" ctrl={this.ctrl} roles={this.ctrl.organisationRoles} />
          </>
        )}
        <Divider />
      </>
    );
  }
}
