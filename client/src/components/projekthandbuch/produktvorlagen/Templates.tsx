import React, { useEffect, useState } from 'react';

import { Col, FloatButton, Form, Layout, Row, Spin } from 'antd';
import { TemplateProps, TemplatesContent } from './TemplatesContent';
import { decodeXml, getJsonDataFromXml, simpleDecodeXml } from '../../../shares/utils';
import { NavTypeEnum } from '../documentation/navigation/Navigation';
import { useTailoring } from '../../../context/TailoringContext';
import { SubmitArea } from './SubmitArea';
import { weitApiUrl } from '../../app/App';
import { XMLElement } from 'react-xml-parser';
import { useTemplate } from '../../../context/TemplateContext';

export function Templates() {
  const [loading, setLoading] = useState(false);

  const { tailoringParameter, getProjectFeaturesQueryString } = useTailoring();
  const { setCheckedKeys } = useTemplate();

  const [menuStructure, setMenuStructure] = React.useState<TemplateProps[]>();

  const topicToSampleTextsMap = new Map<
    string,
    { id: string; title: string; infoText: string; isStandardSelection: boolean }[]
  >();
  const productToExternalCopyTemplateMap = new Map<
    string,
    { id: string; title: string; isStandardSelection: boolean }[]
  >();

  const initialKeys: React.Key[] = [];

  useEffect(() => {
    async function mount() {
      if (tailoringParameter.modelVariantId) {
        setLoading(true);

        await getSampleTexts();
        await getExternalCopyTemplates();
        setMenuStructure(await getReferenceProducts());

        setLoading(false);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [tailoringParameter.modelVariantId]);

  async function getReferenceProducts(): Promise<TemplateProps[]> {
    const referenceProductsUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(referenceProductsUrl);

    const navigation: TemplateProps[] = await Promise.all(
      jsonDataFromXml.getElementsByTagName('Disziplin').map(async (disciplineValue) => {
        const disciplineEntry: TemplateProps = {
          key: disciplineValue.attributes.id,
          label: disciplineValue.attributes.name,
          dataType: NavTypeEnum.DISCIPLINE,
          disabled: false,
          checked: false,
          checkable: true,
        };

        const products: TemplateProps[] = await Promise.all(
          disciplineValue.getElementsByTagName('Produkt').map(async (productValue): Promise<TemplateProps> => {
            const productData = await getProductData(disciplineValue.attributes.id, productValue.attributes.id);

            const isProductTemplate = productData.attributes.Produktvorlage === 'Ja';
            const isInitial = productData.attributes.Initial === 'Ja';

            if (isProductTemplate) {
              const topics = await getTopics(productData, disciplineValue.attributes.id, productValue.attributes.id);
              const externalCopyTemplates = await getExternalCopyTemplatesForProduct(productValue.attributes.id);

              if (isInitial) {
                initialKeys.push(productValue.attributes.id);
              }

              return {
                key: productValue.attributes.id,
                // parent: disciplineEntry,
                label: productValue.attributes.name,
                dataType: NavTypeEnum.PRODUCT,
                disabled: false,
                checked: isInitial,
                checkable: true,
                // onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
                children: [...topics, ...externalCopyTemplates],
              };
            } else {
              return false;
            }
          })
        );

        disciplineEntry.children = products;

        return disciplineEntry;
      })
    );

    setCheckedKeys({ checked: initialKeys, halfChecked: [] });

    return navigation;
  }

  async function getTopics(
    jsonDataFromXml: XMLElement,
    disciplineId: string,
    productId: string
  ): Promise<TemplateProps[]> {
    return await Promise.all(
      jsonDataFromXml.getElementsByTagName('ThemaRef').map(async (topicValue) => {
        const infoText = await getTopicContent(topicValue.attributes.id, disciplineId, productId);

        const sampleTextForTopic = topicToSampleTextsMap.get(topicValue.attributes.id) ?? [];

        const sampleChildren = sampleTextForTopic.map((sampleText) => {
          return {
            key: sampleText.id,
            label: sampleText.title,
            infoText: sampleText.infoText,
            dataType: NavTypeEnum.SAMPLE_TEXT,
            disabled: false,
            checked: sampleText.isStandardSelection,
            checkable: true,
          };
        });

        return {
          key: topicValue.attributes.id,
          label: topicValue.attributes.name,
          infoText: decodeXml(infoText),
          dataType: NavTypeEnum.TOPIC,
          disabled: false,
          checked: false,
          checkable: true,
          // onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
          children: sampleChildren,
        };
      })
    );
  }

  async function getProductData(disciplineId: string, productId: string): Promise<XMLElement> {
    const singleProductUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '?' +
      getProjectFeaturesQueryString();

    return getJsonDataFromXml(singleProductUrl);
  }

  async function getTopicContent(topicId: string, disciplineId: string, productId: string): Promise<string> {
    const topicUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '/Thema/' +
      topicId +
      '?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(topicUrl);

    return jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
  }

  async function getSampleTexts(): Promise<void> {
    const topicSamplesUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Themenmuster';

    const jsonDataFromXml = await getJsonDataFromXml(topicSamplesUrl);

    const themenmuster: XMLElement[] = jsonDataFromXml
      .getElementsByTagName('Themenmuster')
      .filter((themenMuster) => themenMuster.attributes?.name);

    for (const topicSample of themenmuster) {
      const vmThemaRef = topicSample.getElementsByTagName('VMThemaRef');

      if (!vmThemaRef[0]) {
        // in diesem Fall handelt es sich um "Unterthemen", welche schon über das normale Thema erfasst werden
        continue;
      }

      const topicId = vmThemaRef[0].attributes.link;

      const sampleTexts = topicSample.getElementsByTagName('Mustertext');

      for (const sampleText of sampleTexts) {
        const sampleTextId = sampleText.attributes.id;
        const sampleTextName = sampleText.attributes.name;
        const sampleTextText = simpleDecodeXml(sampleText.getElementsByTagName('Text')[0]?.value);

        const sampleStandardauswahl = sampleText.getElementsByTagName('Standardauswahl')[0]?.value;
        const isStandardSelection = sampleStandardauswahl === 'ja';

        if (isStandardSelection) {
          // TODO: hier werden möglicherweise Keys eingefügt, die gar in den Daten vorkommen, da sie beim Tayloring bereits herausgefiltert wurden */
          initialKeys.push(sampleTextId);
        }

        if (!topicToSampleTextsMap.has(topicId)) {
          topicToSampleTextsMap.set(topicId, []);
        }

        topicToSampleTextsMap.get(topicId)!.push({
          id: sampleTextId,
          title: sampleTextName,
          infoText: sampleTextText,
          isStandardSelection: isStandardSelection,
        });
      }
    }
  }

  async function getExternalCopyTemplates(): Promise<void> {
    const templatesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/ExterneKopiervorlage?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(templatesUrl);

    jsonDataFromXml.getElementsByTagName('ExterneKopiervorlage').map((externalMasterTemplate) => {
      const productRef = externalMasterTemplate.getElementsByTagName('ProduktRef')[0];
      const productId = productRef.attributes.id;

      const templateId = externalMasterTemplate.attributes.id;
      const templateName = externalMasterTemplate.attributes.name;

      const sampleStandardauswahl = externalMasterTemplate.getElementsByTagName('Standardauswahl')[0]?.value;
      const isStandardSelection = sampleStandardauswahl === 'ja';

      if (isStandardSelection) {
        initialKeys.push(templateId);
      }

      if (!productToExternalCopyTemplateMap.has(productId)) {
        productToExternalCopyTemplateMap.set(productId, []);
      }

      productToExternalCopyTemplateMap.get(productId)!.push({
        id: templateId,
        title: templateName,
        isStandardSelection: isStandardSelection,
        //infoText: decodeXml(sampleTextText),
      });
    });
  }

  async function getExternalCopyTemplatesForProduct(productId: string): Promise<TemplateProps[]> {
    const externalCopyTemplates = productToExternalCopyTemplateMap.get(productId);

    const templates = [];

    if (externalCopyTemplates && externalCopyTemplates.length > 0) {
      for (const externalCopyTemplate of externalCopyTemplates) {
        const templatesUrl =
          weitApiUrl.toString() +
          '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          tailoringParameter.modelVariantId +
          '/Projekttyp/' +
          tailoringParameter.projectTypeId +
          '/Projekttypvariante/' +
          tailoringParameter.projectTypeVariantId +
          '/ExterneKopiervorlage/' +
          externalCopyTemplate.id +
          '?' +
          getProjectFeaturesQueryString();

        const jsonDataFromXml = await getJsonDataFromXml(templatesUrl);

        const templateUri = jsonDataFromXml.getElementsByTagName('URI')[0]?.value;

        templates.push({
          key: externalCopyTemplate.id,
          // parent: disciplineEntry,
          label: externalCopyTemplate.title,
          infoText: templateUri,
          dataType: NavTypeEnum.EXTERNAL_TEMPLATE,
          disabled: false,
          checked: externalCopyTemplate.isStandardSelection,
          checkable: true,
        });
      }
    }

    return templates;
  }

  return (
    <Form>
      <Layout style={{ background: '#FFF' }}>
        <Row>
          <Col
            style={{ display: 'flex', flexDirection: 'column' }}
            xs={{ span: 24, order: 2 }}
            lg={{ span: 16, order: 1 }}
          >
            <div style={{ padding: '24px', flex: '1 0 auto' }}>
              <h2>Vorlagen</h2>
              Hier sehen Sie die Liste aller Produkte, die für Ihr Projekt relevant sind. Sie können die vorgeschlagene
              Auswahl an Textbausteinen übernehmen oder an der Auswahl nach Belieben Änderungen vornehmen (Vorlagen für
              initiale Produkte können nicht abgewählt werden). Der Button "Vorlagen erzeugen" startet den
              Generierungsvorgang.
              <div style={{ padding: '20px' }}>
                <Spin spinning={loading}>
                  {menuStructure && menuStructure.length > 0 && <TemplatesContent entries={menuStructure} />}
                </Spin>
              </div>
            </div>
          </Col>
          <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
            <SubmitArea />
            <FloatButton.BackTop />
          </Col>
        </Row>
      </Layout>
    </Form>
  );
}
