import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProduktvorlagenController } from './controller';

import { BackTop, Badge, Checkbox, Col, Collapse, Layout, Popover, Row } from 'antd';
import { BookTwoTone, ContainerTwoTone, FileExcelTwoTone, FileTextTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import { SelectionArea } from './selectArea/component';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Panel } = Collapse;

function callback(key: string | string[]) {
  console.log(key);
}

// Tiny helper interfaces till OpenApi is updated
interface ArticleProps {
  id: number;
  type: string;
  displayName: string;
  infoText: string;
}

interface ChapterProps {
  id: number;
  displayName: string;
  infoText: string;
  articles: ArticleProps[];
}

interface FileProps {
  id: number;
  displayName: string;
  type: string;
  url: string;
}

interface SubMenuEntryProps {
  id: number;
  displayName: string;
  infoText: string;
  selectable: boolean;
  chapters: ChapterProps[];
  files: FileProps[];
}

interface TemplateProps {
  id: number;
  displayName: string;
  subMenuEntries: SubMenuEntryProps[];
}

function Articles(props: { data: ArticleProps[]; selectable: boolean }): JSX.Element {
  const articleEntries = [];

  for (const article of props.data) {
    articleEntries.push(
      <div key={article.id.toString()} style={{ marginLeft: '30px' }}>
        <Checkbox disabled={!props.selectable}>
          <FileTextTwoTone twoToneColor="#cf1322" style={{ marginRight: '5px' }} />
          {article.displayName}
        </Checkbox>
        <Popover destroyTooltipOnHide={true} content={article.infoText} title={article.displayName}>
          <InfoCircleTwoTone style={{ cursor: 'help' }} />
        </Popover>
      </div>
    );
  }

  return <>{articleEntries}</>;
}

function Chapters(props: { data: ChapterProps[]; selectable: boolean }): JSX.Element {
  const chapterEntries = [];

  for (const chapter of props.data) {
    if (chapter) {
      chapterEntries.push(
        <div key={chapter.id.toString()} style={{ marginLeft: '30px', marginTop: '10px' }}>
          <Checkbox disabled={!props.selectable}>
            <BookTwoTone twoToneColor="#389e0d" style={{ marginRight: '5px' }} />
            {chapter.displayName}
          </Checkbox>
          <Popover destroyTooltipOnHide={true} content={chapter.infoText} title={chapter.displayName}>
            <InfoCircleTwoTone style={{ cursor: 'help' }} />
          </Popover>
          {chapter.articles && <Articles data={chapter.articles} selectable={props.selectable} />}
        </div>
      );
    }
  }
  return <>{chapterEntries}</>;
}

function TemplatesContent(props: { showAll: boolean; ctrl: ProduktvorlagenController }) {
  const showAll = props.showAll;

  const templatePanels = [];
  for (const templateEntry of props.ctrl.projectTemplates as TemplateProps[]) {
    const submenuEntries = [];

    if (templateEntry.subMenuEntries) {
      for (const submenuEntry of templateEntry.subMenuEntries) {
        const fileEntries = [];
        if (submenuEntry.files) {
          for (const file of submenuEntry.files) {
            fileEntries.push(
              <div key={file.id.toString()}>
                <Checkbox disabled={!submenuEntry.selectable} style={{ marginTop: '10px' }}>
                  Ressourcen
                </Checkbox>
                <div style={{ marginLeft: '30px', marginTop: '10px' }}>
                  <Checkbox disabled={!submenuEntry.selectable}>
                    <FileExcelTwoTone twoToneColor="#454545" style={{ marginRight: '5px' }} />
                    {file.displayName}
                  </Checkbox>
                  <Popover destroyTooltipOnHide={true} content={file.url} title={file.displayName}>
                    <InfoCircleTwoTone style={{ cursor: 'help' }} />
                  </Popover>
                </div>
              </div>
            );
          }
        }

        const header = (
          <div style={{ color: !submenuEntry.selectable ? '#cccccc' : '' }}>
            <span style={{ marginRight: '8px' }}>{submenuEntry.displayName}</span>
            <Popover destroyTooltipOnHide={true} content={submenuEntry.infoText} title={submenuEntry.displayName}>
              <InfoCircleTwoTone style={{ cursor: 'help' }} />
            </Popover>
            <Badge
              count={'3/5'}
              style={{ marginLeft: '5px', backgroundColor: !submenuEntry.selectable ? '#cccccc' : 'red' }}
            />
          </div>
        );

        if (submenuEntry.selectable || showAll) {
          submenuEntries.push(
            <Collapse key={submenuEntry?.id.toString()} ghost>
              <Panel key={submenuEntry?.id.toString()} header={header}>
                <Checkbox disabled={!submenuEntry.selectable}>
                  <ContainerTwoTone twoToneColor="#096dd9" style={{ marginRight: '5px' }} />
                  Generierte Vorlage
                </Checkbox>
                {submenuEntry.chapters && (
                  <Chapters data={submenuEntry.chapters} selectable={submenuEntry.selectable} />
                )}
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
  const [showAll, setShowAll] = React.useState({ show: false });

  const handleShowAllChange = (e: CheckboxChangeEvent) => {
    setShowAll({
      ...showAll,
      show: e.target.checked,
    });
  };

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
              <TemplatesContent showAll={showAll.show} ctrl={props.ctrl} />
            </div>
            {/*<FooterComponent />*/}
          </Col>
          <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
            <SelectionArea onShowAllChange={handleShowAllChange} />
            <BackTop />
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export class ProduktvorlagenComponent
  extends ReactComponent<unknown, ProduktvorlagenController>
  implements GenericComponent {
  public ctrl: ProduktvorlagenController = new ProduktvorlagenController();

  public render(): JSX.Element {
    return <Content ctrl={this.ctrl} />;
  }
}
