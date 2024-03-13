// import { PageEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { decodeXml, fixLinksInText, getJsonDataFromXml, replaceUrlInText } from '../../../../shares/utils';
import React, { useEffect, useState } from 'react';
import { XMLElement } from 'react-xml-parser';
import { useTailoring } from '../../../../context/TailoringContext';
import { useDocumentation } from '../../../../context/DocumentationContext';
import { weitApiUrl } from '../../../app/App';
import parse from 'html-react-parser';
import { DataTable } from './DataTable';
import { PageEntry } from '../Documentation';

export function SubEntries(props: { data: PageEntry }) {
  const { tailoringParameter, getProjectFeaturesQueryString: getProjectFeaturesString } = useTailoring();

  const { productDisciplineId, productId } = useDocumentation();

  const [subPageEntries, setSubPageEntries] = useState<PageEntry[]>([]);

  async function getTextBlockContent(textbausteinId: string): Promise<string> {
    const textbausteinUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Textbaustein/' +
      textbausteinId;

    const jsonDataFromXml: XMLElement = await getJsonDataFromXml(textbausteinUrl);

    return jsonDataFromXml.getElementsByTagName('Text')[0]?.value;
  }

  async function getGeneratingDependenciesData(): Promise<XMLElement[]> {
    const generatingDependenciesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/ErzeugendeAbhaengigkeit?' +
      getProjectFeaturesString();

    const jsonDataFromXml: XMLElement = await getJsonDataFromXml(generatingDependenciesUrl);

    return jsonDataFromXml.getElementsByTagName('ErzeugendeAbhängigkeit');
  }

  async function getTopicContent(topicId: string): Promise<PageEntry> {
    const disciplineId = productDisciplineId?.replace('productDiscipline_', '');

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
      getProjectFeaturesString();

    const jsonDataFromXml: XMLElement = (await getJsonDataFromXml(topicUrl)) as XMLElement;

    let idCounter = 2000;

    const textBausteinRef = jsonDataFromXml.getElementsByTagName('TextbausteinRef');

    let description;

    if (textBausteinRef.length > 0) {
      description = await getTextBlockContent(textBausteinRef[0].attributes.id);
    } else {
      description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
    }

    // get table
    const generatingDependencies = await getGeneratingDependenciesData();
    const tableEntries = [];
    const dataEntries = [];

    for (const generatingDependency of generatingDependencies) {
      const generatingDependencyId = generatingDependency.attributes.id;
      const generatingDependencyTitle = generatingDependency.attributes.name;
      const generatingDependenciesData = [];

      const topics = generatingDependency.getElementsByTagName('ThemaRef');
      for (const topic of topics) {
        if (topic.attributes.id === topicId) {
          const products = generatingDependency.getElementsByTagName('ProduktRef');
          const productsToTopics = [];

          for (const product of products) {
            productsToTopics.push({
              id: product.attributes.id,
              title: product.attributes.name,
            });
          }

          generatingDependenciesData.push({
            subheader: { id: generatingDependencyId, title: generatingDependencyTitle, isLink: false },
            dataEntries: productsToTopics,
          });
        }
      }
      if (generatingDependenciesData.length > 0) {
        dataEntries.push(generatingDependenciesData);
      }
    }
    if (dataEntries.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Erzeugt',
        dataEntries: dataEntries,
      });
    }

    const textPart = decodeXml(description);

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: replaceUrlInText(textPart, tailoringParameter, getProjectFeaturesString()),
      tableEntries: tableEntries,
    };
  }

  useEffect(() => {
    async function mount() {
      const subPageEntriesData: PageEntry[] = [];
      if (props.data?.subPageEntries && props.data.subPageEntries.length > 0) {
        for (const menuEntryChildren of props.data?.subPageEntries as PageEntry[]) {
          subPageEntriesData.push(await getTopicContent(menuEntryChildren?.id));
        }
      }
      setSubPageEntries(subPageEntriesData);
    }

    void mount().then();
    //eslint-disable-next-line
  }, [props.data]);

  return (
    <div>
      {subPageEntries.map((subPageEntry) => {
        return (
          <div key={subPageEntry?.id} style={{ marginTop: '40px' }}>
            <h3 id={subPageEntry?.id}> {subPageEntry.header} </h3>
            {parse(fixLinksInText(subPageEntry.descriptionText))}
            {subPageEntry?.tableEntries?.length > 0 && <DataTable data={subPageEntry.tableEntries} />}
          </div>
        );
      })}
    </div>
  );
}
