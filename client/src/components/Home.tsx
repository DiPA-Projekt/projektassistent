import React, { useEffect, useState } from 'react';
import { decodeXml, getJsonDataFromXml } from '../shares/utils';
import { Col, List, Row } from 'antd';
import parse from 'html-react-parser';
import { useTailoring } from '../context/TailoringContext';

interface ListEntry {
  avatar?: string;
  title: string;
  description: string | JSX.Element | JSX.Element[];
}

export function Home() {
  const { tailoringParameter } = useTailoring();

  useEffect(() => {
    if (tailoringParameter.modelVariantId) {
      async function getModelVariantData() {
        await fetchModelVariantData();
      }

      getModelVariantData().then();
    }
    //eslint-disable-next-line
  }, [tailoringParameter.modelVariantId]);

  const [modelVariantData, setModelVariantData] = useState<ListEntry[] | undefined>(undefined);

  async function fetchModelVariantData(): Promise<void> {
    const projectModelVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId;

    const jsonDataFromXml: any = await getJsonDataFromXml(projectModelVariantUrl);

    const listEntries: ListEntry[] = [];

    const version = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Version')[0]?.value));
    const copyright = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Copyright_lang')[0]?.value));
    const contactPerson = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Ansprechpartner')[0]?.value));
    const development = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Erarbeitung')[0]?.value));
    const authors = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Autoren')[0]?.value));

    listEntries.push({ title: 'Kontakt', description: contactPerson });
    listEntries.push({ title: 'Version', description: version });
    listEntries.push({ title: 'Autoren', description: authors });
    listEntries.push({ title: 'Copyright', description: copyright });
    listEntries.push({ title: 'Erarbeitung', description: development });

    setModelVariantData(listEntries);
  }

  return (
    <>
      <h1>Info</h1>
      <Row>
        <Col xs={24} sm={24} md={12}>
          <List
            itemLayout="horizontal"
            dataSource={modelVariantData}
            renderItem={(item: ListEntry) => (
              <List.Item>
                <List.Item.Meta
                  // avatar={renderSwitch(item.descriptionEntry)}
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
            style={{ padding: '0 1rem' }}
          />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <img
            alt="ALLG-Titelseite-Prozessdoku"
            id="ALLG-Titelseite-Prozessdoku"
            src={`https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/${tailoringParameter.modelVariantId}/Projekttyp/xxx/Projekttypvariante/xxx/Grafik/images/ALLG-Titelseite-Prozessdoku.png`}
          />
        </Col>
      </Row>
    </>
  );
}
