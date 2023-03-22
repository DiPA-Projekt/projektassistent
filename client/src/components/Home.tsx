import React, { useEffect, useState } from 'react';
import { decodeXml, getJsonDataFromXml } from '../shares/utils';
import { Col, List, Row } from 'antd';
import parse from 'html-react-parser';

interface ListEntry {
  avatar?: string;
  title: string;
  description: string;
}

export function Home() {
  // const { modelVariantId } = useTailoring();
  const [modelVariantId] = useState<ListEntry[] | undefined>(
    !localStorage.getItem('modelVariantId') ? undefined : JSON.parse(localStorage.getItem('modelVariantId') ?? '')
  );

  useEffect(() => {
    if (modelVariantId) {
      async function getModelVariantData() {
        await fetchModelVariantData();
      }

      getModelVariantData().then();
    }
    //eslint-disable-next-line
  }, [modelVariantId]);

  const [modelVariantData, setModelVariantData] = useState<ListEntry[] | undefined>(undefined);

  async function fetchModelVariantData(): Promise<void> {
    const projectModelVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + modelVariantId;

    const jsonDataFromXml: any = await getJsonDataFromXml(projectModelVariantUrl);

    const listEntries = [];

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
      <h1>Home</h1>
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
            alt=""
            id="img"
            src="https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/fc3fc9d51ffd42/Projekttyp/1369cfd47f59793/Projekttypvariante/c3cdfb31207000/Grafik/images/ALLG-Titelseite-Prozessdoku.png?bee411a076e64a5=5acd11a076eaf06&be9c11a076f10fa=faaf11a076f5da4&ca2711ba30b787e=17af711ba30b787e&cd7015dbcc3dcdf=105b315dbcc3dcdf&7a0a11a076fa61b=a36711a0771b07e&de9d11a07700334=47bd11a07723bec&1261411a077061c3=547611a07727f2d&559a15dc26b0e8a=2dc715dc26b0e8a&cd5511a07709e6b=1600811a0772cdb4&25f211a0770d36d=47a111a0772f0e4&10f4e11a07712fb9=aa7811a07736a7c"
          ></img>
        </Col>
      </Row>
    </>
  );
}
