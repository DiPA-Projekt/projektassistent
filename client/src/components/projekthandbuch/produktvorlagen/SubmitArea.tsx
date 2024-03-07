import { Button, Checkbox, Form } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTemplate } from '../../../context/TemplateContext';
import { ModelVariant, OperationOpts, SingleProduct } from '@dipa-projekt/projektassistent-openapi';
import { MultiProducts } from '@dipa-projekt/projektassistent-openapi/dist/models/MultiProducts';
import { ProductOfProject } from '@dipa-projekt/projektassistent-openapi/dist/models';
import API from '../../../api';
import { AjaxResponse } from 'rxjs/ajax';
import { TemplateFormModal } from './TemplateFormModal';
import { useTranslation } from 'react-i18next';
import { BookTwoTone } from '@ant-design/icons';
import { weitApiUrl } from '../../app/App';
import { decodeXml, getJsonDataFromXml } from '../../../shares/utils';
import parse from 'html-react-parser';
import { useTailoring } from '../../../context/TailoringContext';

export function SubmitArea() {
  const { t } = useTranslation();

  const { tailoringParameter } = useTailoring();

  const { checkedKeys, productsMap, insertTopicDescription, setInsertTopicDescription } = useTemplate();

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<ProductOfProject[]>([]);

  const selectedProductsRef = React.useRef(selectedProducts);
  useEffect(() => {
    selectedProductsRef.current = selectedProducts;
  }, [selectedProducts]);

  const buttonItemLayout = {
    wrapperCol: {
      span: 16,
      offset: 2,
    },
  };

  function collectDataForSingleProduct(values: {
    projectName: string;
    responsible: string;
    participants: string[];
    modelVariant: string;
    version: string;
  }): SingleProduct {
    return Object.assign(selectedProductsRef.current[0], {
      projectName: values.projectName,
      responsible: values.responsible,
      participants: values.participants,
      modelVariant: values.modelVariant,
      version: values.version,
    }) as SingleProduct;
  }

  function collectDataForMultiProducts(values: {
    projectName: string;
    modelVariant: string;
    version: string;
  }): MultiProducts {
    return {
      projectName: values.projectName,
      products: selectedProductsRef.current,
      modelVariant: values.modelVariant,
      version: values.version,
    } as MultiProducts;
  }

  function getChaptersWithSamplesData(
    topics: { title: string; text: string; samples: { id: string; title: string; text: string }[] }[]
  ): {
    text?: string;
    title: string;
    samplesText?: string;
  }[] {
    if (insertTopicDescription) {
      return topics.map(({ samples, ...keepAttrs }) => ({
        ...keepAttrs,
        text: keepAttrs.text,
        samplesText: samples
          .filter((sample) => checkedKeys.checked.includes(sample.id))
          .map((sample) => sample.text)
          .join('\n'),
      }));
    }
    return topics.map(({ samples, ...keepAttrs }) => ({
      ...keepAttrs,
      text: samples.map((sample) => sample.text).join('\n'),
    }));
  }

  function doSubmit(): void {
    setModalVisible(true);

    const productOfProjectMap = new Map<string, ProductOfProject>();

    for (const checkedKey of checkedKeys.checked) {
      const product = productsMap.get(checkedKey);

      if (product) {
        productOfProjectMap.set(product.product.id, {
          productName: product.product.title,
          disciplineName: product.discipline.title,
          modelVariant: product.modelVariant,
          version: product.version,
          responsible: '',
          participants: [],
          chapters: getChaptersWithSamplesData(product.topics),
          externalCopyTemplates: product.externalCopyTemplates.filter((externalCopyTemplate) =>
            checkedKeys.checked.includes(externalCopyTemplate.id)
          ),
        });
      } else if (
        Array.from(productsMap.values()).filter((x) => x.externalCopyTemplates.some((y) => y.id === checkedKey))
      ) {
        const productWithExternalCopyTemplate = Array.from(productsMap.values()).filter((x) =>
          x.externalCopyTemplates.find((y) => y.id === checkedKey)
        );

        if (productWithExternalCopyTemplate.length > 0) {
          const foundProduct = productWithExternalCopyTemplate.at(0);
          if (!foundProduct) {
            continue;
          }

          const existingProduct = productOfProjectMap.get(foundProduct.product.id);
          const externalCopyTemplates = foundProduct.externalCopyTemplates.filter((externalCopyTemplate) =>
            checkedKeys.checked.includes(externalCopyTemplate.id)
          );

          if (existingProduct) {
            productOfProjectMap.set(
              foundProduct.product.id,
              Object.assign(existingProduct, {
                externalCopyTemplates: externalCopyTemplates,
              })
            );
          } else {
            productOfProjectMap.set(foundProduct.product.id, {
              productName: foundProduct.product.title,
              disciplineName: foundProduct.discipline.title,
              modelVariant: '',
              version: '',
              responsible: '',
              participants: [],
              chapters: [],
              externalCopyTemplates: externalCopyTemplates,
            });
          }
        }
      }
    }

    const products: ProductOfProject[] = [];

    for (const productKey of productOfProjectMap.keys()) {
      const product = productOfProjectMap.get(productKey);
      if (product) {
        products.push(product);
      }
    }

    setSelectedProducts(products);
  }

  const handleClose = async (values: { projectName: string; responsible: string; participants: string[] }) => {
    setModalVisible(false);

    if (values) {
      const opts: OperationOpts = { responseOpts: { response: 'raw' } };

      const projectModelVariantUrl =
        weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId;

      const jsonDataFromXml = await getJsonDataFromXml(projectModelVariantUrl);
      const version = parse(decodeXml(jsonDataFromXml.getElementsByTagName('Version')[0]?.value));

      const modelVariantsUrl = weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante';
      const jsonDataFromXml2 = await getJsonDataFromXml(modelVariantsUrl);

      const modelVariants: ModelVariant[] = jsonDataFromXml2
        .getElementsByTagName('V-Modellvariante')
        .filter((variante) => variante.attributes.id === tailoringParameter.modelVariantId);

      const modelVariantName = modelVariants[0].attributes.name;

      const valuesWithModelVariantAndVersion = Object.assign(values, {
        modelVariant: modelVariantName,
        version: version,
      });

      if (selectedProductsRef.current.length > 1 || selectedProductsRef.current[0].externalCopyTemplates.length > 0) {
        API.ProductsApi.getZipForMultiProducts(
          {
            multiProducts: collectDataForMultiProducts(valuesWithModelVariantAndVersion),
          },
          opts
        ).subscribe((response: AjaxResponse<Blob>) => {
          downloadFile(response);
        });
      } else {
        API.ProductsApi.getDocxForSingleProduct(
          {
            singleProduct: collectDataForSingleProduct(valuesWithModelVariantAndVersion),
          },
          opts
        ).subscribe((response: AjaxResponse<Blob>) => {
          downloadFile(response);
        });
      }
    }
  };

  function downloadFile(response: AjaxResponse<Blob>) {
    const downloadUrl = window.URL.createObjectURL(response.response);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const contentDisposition = response.responseHeaders['content-disposition'];
    let contentDispositionMatch = 'file.zip';
    if (contentDisposition) {
      const match = /filename=*(.+)/;
      const filename = contentDisposition.match(match);
      if (filename && filename.length > 1) {
        contentDispositionMatch = filename[1];
      }
    }
    link.setAttribute('download', contentDispositionMatch);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function onChangeInsertTopicDescription() {
    setInsertTopicDescription(!insertTopicDescription);
  }

  return (
    <>
      <div className="sticky-wrapper" style={{ padding: '24px' }}>
        <Form.Item style={{ marginBottom: '0' }}>
          <Checkbox checked={insertTopicDescription} onChange={onChangeInsertTopicDescription}>
            <BookTwoTone twoToneColor="#389e0d" style={{ marginRight: '5px' }} />
            {t('text.insertTopicDescription')}
          </Checkbox>
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => doSubmit()}
            style={{ marginRight: '8px', marginTop: '20px' }}
            disabled={checkedKeys?.checked?.length === 0}
          >
            Vorlagen erzeugen
          </Button>
        </Form.Item>
      </div>

      <TemplateFormModal products={selectedProducts} open={modalVisible} handleClose={handleClose} />
    </>
  );
}
