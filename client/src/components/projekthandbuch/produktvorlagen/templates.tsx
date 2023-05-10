import React, { useEffect } from 'react';

import { Col, FloatButton, Form, Layout, Row } from 'antd';
// import { useTemplate } from '../../../context/TemplateContext';
import { TemplateProps, TemplatesContent } from './TemplatesContent';
import { decodeXml, getJsonDataFromXml } from '../../../shares/utils';
import { NavTypeEnum } from '../documentation/navigation/navigation';
import { useTailoring } from '../../../context/TailoringContext';
import { SubmitArea } from './SubmitArea';

export function Templates() {
  // public readonly ctrl: ProduktvorlagenController;

  // public constructor(props: unknown) {
  //   super(props);
  // this.ctrl = new ProduktvorlagenController(this.forceUpdate.bind(this));
  // this.state = {checkAllProductTemplates: false};
  // }

  // private productTemplatesSubscription: Subscription = new Subscription();
  // private samplesSubscription: Subscription = new Subscription();
  // private showAllSubscription: Subscription = new Subscription();

  // const { selectAll } = useTemplate();

  // public componentDidMount(): void {
  //   this.productTemplatesSubscription = this.ctrl.produktvorlagenService
  //     .getCheckAllProductTemplates()
  //     .subscribe((checkAllProductTemplates: boolean) => {
  //       this.ctrl.checkAllProductTemplates = checkAllProductTemplates;
  //       this.setState({ checkAllProductTemplates: checkAllProductTemplates });
  //       // this.forceUpdate();
  //     });
  //
  //   this.samplesSubscription = this.ctrl.produktvorlagenService
  //     .getCheckAllSamples()
  //     .subscribe((checkAllSamples: boolean) => {
  //       this.ctrl.checkAllSamples = checkAllSamples;
  //       this.setState({ checkAllSamples: checkAllSamples });
  //       // this.forceUpdate();
  //     });
  //
  //   this.showAllSubscription = this.ctrl.produktvorlagenService.getShowAll().subscribe((showAll: boolean) => {
  //     this.ctrl.showAll = showAll;
  //     this.setState({ showAll: showAll });
  //   });
  // }

  // public componentWillUnmount(): void {
  //   this.productTemplatesSubscription?.unsubscribe();
  //   this.samplesSubscription?.unsubscribe();
  //   this.showAllSubscription?.unsubscribe();
  // }
  //

  const [menuStructure, setMenuStructure] = React.useState<TemplateProps[]>();

  const {
    modelVariantId,
    projectTypeVariantId,
    projectTypeId,
    getProjectFeaturesQueryString,
    // projectFeatures,
  } = useTailoring();

  useEffect(() => {
    async function mount() {
      setMenuStructure(await getReferenceProducts());
      // console.log(navigation);
    }

    mount().then();
    //eslint-disable-next-line
  }, [modelVariantId]);

  async function getReferenceProducts(): Promise<TemplateProps[]> {
    const referenceProductsUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml: any = await getJsonDataFromXml(referenceProductsUrl);

    const navigation: TemplateProps[] = await Promise.all(
      jsonDataFromXml.getElementsByTagName('Disziplin').map(async (disciplineValue: any) => {
        const disciplineEntry: TemplateProps = {
          key: disciplineValue.attributes.id,
          label: disciplineValue.attributes.name,
          dataType: NavTypeEnum.DISCIPLINE,
          disabled: false,
          checked: false,
          checkable: true,
        };

        const products: TemplateProps[] = await Promise.all(
          disciplineValue.getElementsByTagName('Produkt').map(async (productValue: any): Promise<TemplateProps> => {
            const topics = await getTopics(disciplineValue.attributes.id, productValue.attributes.id);

            return {
              key: productValue.attributes.id,
              // parent: disciplineEntry,
              label: productValue.attributes.name,
              dataType: NavTypeEnum.PRODUCT,
              disabled: false,
              checked: false,
              checkable: true,
              // onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
              children: topics,
            };
          })
        );
        console.log('products', products);

        disciplineEntry.children = products;

        return disciplineEntry;
      })
    );

    console.log('navigation', navigation);

    return navigation;
  }

  async function getTopics(disciplineId: string, productId: string): Promise<TemplateProps[]> {
    const topicUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml: any = await getJsonDataFromXml(topicUrl);

    console.log('ist Produktvorlage', jsonDataFromXml.attributes.Produktvorlage === 'Ja');

    // TODO jsonDataFromXml.attributes.Produktvorlage === true

    const topics = await Promise.all(
      jsonDataFromXml.getElementsByTagName('ThemaRef').map(async (topicValue: any) => {
        const infoText = await getTopicContent(topicValue.attributes.id, disciplineId, productId);

        return {
          key: topicValue.attributes.id,
          // parent: disciplineEntry,
          label: topicValue.attributes.name,
          infoText: decodeXml(infoText),
          dataType: NavTypeEnum.TOPIC,
          // disabled: false,
          checked: false,
          checkable: true,
          // onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
        };
      })
    );
    console.log('topics', topics);

    return topics;
  }

  async function getTopicContent(topicId: string, disciplineId: string, productId: string): Promise<string> {
    const topicUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '/Thema/' +
      topicId +
      '?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml: any = await getJsonDataFromXml(topicUrl);

    return jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
  }

  function handleSubmit(/*event: any*/) {
    console.log(event);
    // event.preventDefault();
  }

  return (
    <Form onFinish={handleSubmit()}>
      <Layout style={{ background: '#FFF' }}>
        <Row>
          <Col
            style={{ display: 'flex', flexDirection: 'column' }}
            xs={{ span: 24, order: 2 }}
            lg={{ span: 16, order: 1 }}
          >
            <div style={{ padding: '24px', flex: '1 0 auto' }}>
              {menuStructure && <TemplatesContent entries={menuStructure} />}
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
