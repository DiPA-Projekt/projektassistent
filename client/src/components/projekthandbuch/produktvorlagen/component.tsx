import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProduktvorlagenController } from './controller';

import { BackTop, Col, Collapse, Form, Layout, Popover, Row } from 'antd';
import { BookTwoTone, ContainerTwoTone, FileExcelTwoTone, FileTextTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import { SelectAreaComponent } from './selectArea/component';

import { SelectTree } from './selectTree/component';
import { DataNode } from 'antd/lib/tree';
import { Subscription } from 'rxjs';

const { Panel } = Collapse;

function callback(key: string | string[]) {
  console.log(key);
}

// Tiny helper interfaces till OpenApi is updated
interface TemplateProps {
  id: number;
  type: string;
  checkable: boolean;
  checked: boolean;
  disabled: boolean;
  displayName: string;
  infoText: string;
  selected: boolean;
  selectable: boolean;
  url: string;
  files: TemplateProps[];
  subMenuEntries: TemplateProps[];
}

function TemplatesContent(props: { ctrl: ProduktvorlagenController }) {
  const showAll = props.ctrl.showAll;

  const templatePanels = [];
  for (const templateEntry of props.ctrl.projectTemplates as TemplateProps[]) {
    const submenuEntries = [];

    if (templateEntry.subMenuEntries) {
      for (const submenuEntry of templateEntry.subMenuEntries) {
        const fileEntries = [];
        if (submenuEntry.files) {
          fileEntries.push(
            <SelectTree
              key={submenuEntry.id}
              data={getTreeData(submenuEntry.files)}
              checkedKeys={props.ctrl.getCheckedKeys([submenuEntry])}
              disabled={submenuEntry.disabled}
            />
          );
        }

        const header = (
          <div style={{ color: submenuEntry.disabled ? '#cccccc' : '' }}>
            <span style={{ marginRight: '8px' }}>{submenuEntry.displayName}</span>
            <Popover destroyTooltipOnHide={true} content={submenuEntry.infoText} title={submenuEntry.displayName}>
              <InfoCircleTwoTone style={{ cursor: 'help' }} />
            </Popover>
          </div>
        );

        if (!submenuEntry.disabled || showAll) {
          submenuEntries.push(
            <Collapse key={submenuEntry?.id.toString()} ghost>
              <Panel key={submenuEntry?.id.toString()} header={header}>
                <SelectTree
                  data={getTreeData([submenuEntry])}
                  checkedKeys={props.ctrl.getCheckedKeys([submenuEntry])}
                  disabled={submenuEntry.disabled}
                />
                {fileEntries}
              </Panel>
            </Collapse>
          );
        }
      }
    }

    templatePanels.push(
      <Panel key={templateEntry?.id.toString()} header={templateEntry.displayName}>
        {submenuEntries}
      </Panel>
    );
  }

  return (
    <>
      <h2>Vorlagen</h2>
      Hier sehen Sie die Liste aller Produkte, die für Ihr Projekt relevant sind. Sie können die vorgeschlagene Auswahl
      an Textbausteinen übernehmen oder an der Auswahl nach Belieben Änderungen vornehmen (Vorlagen für initiale
      Produkte können nicht abgewählt werden). Der Button "Vorlagen erzeugen" startet den Generierungsvorgang.
      <Collapse onChange={callback} style={{ marginTop: '20px' }}>
        {templatePanels}
      </Collapse>
    </>
  );
}

const Content = (props: { ctrl: ProduktvorlagenController }) => {
  return (
    <>
      <Layout style={{ background: '#FFF' }}>
        <Row>
          <Col
            style={{ display: 'flex', flexDirection: 'column' }}
            xs={{ span: 24, order: 2 }}
            lg={{ span: 16, order: 1 }}
          >
            <div style={{ padding: '24px', flex: '1 0 auto' }}>
              <TemplatesContent ctrl={props.ctrl} />
            </div>
          </Col>
          <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
            <SelectAreaComponent />
            <BackTop />
          </Col>
        </Row>
      </Layout>
    </>
  );
};

function getIcon(icon: string): JSX.Element {
  switch (icon) {
    case 'sample':
      return <FileTextTwoTone twoToneColor="#cf1322" />;
    case 'chapter':
      return <BookTwoTone twoToneColor="#389e0d" />;
    case 'submenu':
      return <ContainerTwoTone twoToneColor="#096dd9" />;
    case 'excel':
      return <FileExcelTwoTone twoToneColor="#454545" />;
    default:
      return <></>;
  }
}

function getTreeData(inputData: TemplateProps[]): DataNode[] {
  const result: DataNode[] = [];

  for (const entry of inputData) {
    const header = (
      <>
        <span style={{ marginRight: '8px' }}>
          {entry.type === 'submenu' ? 'Generierte Vorlage' : entry.displayName}
        </span>
        {entry.type !== 'submenu' && (
          <Popover destroyTooltipOnHide={true} content={entry.infoText} title={entry.displayName}>
            <InfoCircleTwoTone style={{ cursor: 'help' }} />
          </Popover>
        )}
      </>
    );

    result.push({
      title: header,
      key: entry.id.toString(),
      className: entry?.checkable === false ? 'hideMe' : '',
      // checkable: entry?.checkable !== false,
      // disableCheckbox: entry?.disableCheckbox === true,
      selectable: false,
      icon: getIcon(entry.type),
      children: getTreeData(entry.subMenuEntries || []),
    });
  }

  return result || [];
}

export class ProduktvorlagenComponent
  extends ReactComponent<unknown, ProduktvorlagenController>
  implements GenericComponent
{
  public readonly ctrl: ProduktvorlagenController;

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ProduktvorlagenController(this.forceUpdate.bind(this));
    // this.state = {checkAllProductTemplates: false};
  }

  private productTemplatesSubscription: Subscription = new Subscription();
  private samplesSubscription: Subscription = new Subscription();
  private showAllSubscription: Subscription = new Subscription();

  public componentDidMount(): void {
    this.productTemplatesSubscription = this.ctrl.produktvorlagenService
      .getCheckAllProductTemplates()
      .subscribe((checkAllProductTemplates: boolean) => {
        this.ctrl.checkAllProductTemplates = checkAllProductTemplates;
        this.setState({ checkAllProductTemplates: checkAllProductTemplates });
        // this.forceUpdate();
      });

    this.samplesSubscription = this.ctrl.produktvorlagenService
      .getCheckAllSamples()
      .subscribe((checkAllSamples: boolean) => {
        this.ctrl.checkAllSamples = checkAllSamples;
        this.setState({ checkAllSamples: checkAllSamples });
        // this.forceUpdate();
      });

    this.showAllSubscription = this.ctrl.produktvorlagenService.getShowAll().subscribe((showAll: boolean) => {
      this.ctrl.showAll = showAll;
      this.setState({ showAll: showAll });
    });
  }

  public componentWillUnmount(): void {
    this.productTemplatesSubscription?.unsubscribe();
    this.samplesSubscription?.unsubscribe();
    this.showAllSubscription?.unsubscribe();
  }

  private handleSubmit(event: any) {
    console.log(event);
    // event.preventDefault();
  }

  public render(): JSX.Element {
    // console.log('render');

    return (
      <Form onFinish={this.handleSubmit.bind(this)}>
        <Content ctrl={this.ctrl} />
      </Form>
    );
  }
}
